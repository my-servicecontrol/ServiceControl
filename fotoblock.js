(function () {
  // ================= DEPENDENCIES =================
  const storage = window.storage;
  const t = window.t || ((k) => k);

  if (!storage) {
    console.error("Firebase Storage SDK не инициализирован");
    return;
  }

  // ================= STATE =================
  const PM = {
    mode: null, // "new" | "edit"
    container: null,
    visitName: null,

    // newOrder
    draft: [], // [{ id, file, thumbUrl }]

    // editOrder
    photos: [], // [{ id, name, thumbUrl, fullUrl, refPath, status, progress }]
    uploads: {}, // id -> uploadTask
  };
  // ===== reset =====
  function resetPhotoManager() {
    PM.mode = null;
    PM.container = null;
    PM.visitName = null;
    PM.draft = [];
    PM.photos = [];
    PM.uploads = {};
  }

  // ===== cleanup binding (ОДИН РАЗ) =====
  (function bindModalCleanupOnce() {
    const modalEl = document.getElementById("commonModal");
    if (!modalEl) return;

    // защита от двойной подписки
    if (modalEl.__photoCleanupBound) return;
    modalEl.__photoCleanupBound = true;

    modalEl.addEventListener("hidden.bs.modal", () => {
      resetPhotoManager();
    });
  })();
  // ================= HELPERS =================
  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  function fullPath(visitName, fileName) {
    const sName = window.sName;
    if (!sName) return null;
    return `${sName}/visits/${visitName}/full/${Date.now()}_${fileName.replace(
      /\s+/g,
      "_"
    )}`;
  }

  function generateThumbnailDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width,
            h = img.height;
          const max = 150;
          if (w > h && w > max) {
            h *= max / w;
            w = max;
          } else if (h > max) {
            w *= max / h;
            h = max;
          }
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // ================= STORAGE =================
  function fetchVisitPhotos(visitName) {
    const sName = window.sName;
    if (!sName || !visitName) return Promise.resolve([]);

    const ref = storage.ref(`${sName}/visits/${visitName}/full`);
    return ref.listAll().then((res) =>
      Promise.all(
        res.items.map((item) =>
          item.getDownloadURL().then((url) => ({
            id: uid(),
            name: item.name,
            thumbUrl: url, // ВАЖНО: используем как превью
            fullUrl: url, // оригинал подтянется только в галерее
            refPath: item.fullPath,
            status: "uploaded",
          }))
        )
      )
    );
  }

  // ================= UI =================
  function createThumb(item, index, all) {
    const w = document.createElement("div");
    w.style.cssText =
      "flex:0 0 auto;position:relative;width:86px;height:86px;border-radius:6px;overflow:hidden;border:1px solid #dee2e6;background:#f8f9fa";

    const img = document.createElement("img");
    img.src = item.thumbUrl;
    img.style.cssText =
      "width:100%;height:100%;object-fit:cover;transition:opacity .2s";

    if (item.status !== "uploaded") {
      img.style.opacity = "0.4";
      img.style.pointerEvents = "none";

      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;color:#555";
      overlay.textContent = item.progress != null ? `${item.progress}%` : "";
      w.appendChild(overlay);
    } else {
      img.style.cursor = "pointer";
      img.onclick = () => openFullScreenGallery(index, all);
    }

    w.appendChild(img);

    // delete
    const del = document.createElement("button");
    del.innerHTML = "&times;";
    del.style.cssText =
      "position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:4px;width:20px;height:20px;cursor:pointer";
    del.onclick = (e) => {
      e.stopPropagation();
      if (PM.mode === "new") {
        PM.draft = PM.draft.filter((x) => x.id !== item.id);
        render();
      } else {
        deleteFromStorage(item);
      }
    };

    w.appendChild(del);
    return w;
  }

  function render() {
    const container = PM.container;
    if (!container) return;

    let block = container.querySelector("#photoBlock");
    if (!block) {
      block = document.createElement("div");
      block.id = "photoBlock";
      block.className = "mb-3 p-2 border rounded bg-light";
      container.insertAdjacentElement("afterbegin", block);
    }

    const photos = PM.mode === "new" ? PM.draft : PM.photos;

    block.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="form-label fw-bold mb-0">${t("visitPhotos")}</label>
        <small class="text-muted">${photos.length}</small>
      </div>
      <div id="scroll" style="display:flex;gap:8px;overflow-x:auto;align-items:center">
        <div id="addBtn" style="flex:0 0 auto;width:86px;height:86px;border:1px dashed #ccc;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff">
          <i class="bi bi-camera" style="font-size:28px;color:#0d6efd"></i>
        </div>
      </div>
      <input id="photoInput" type="file" accept="image/*" multiple hidden>
    `;

    const scroll = block.querySelector("#scroll");
    const addBtn = block.querySelector("#addBtn");
    const input = block.querySelector("#photoInput");

    addBtn.onclick = () => input.click();
    input.onchange = (e) => {
      addPhotos(Array.from(e.target.files || []));
      e.target.value = "";
    };

    photos.forEach((p, i) => scroll.appendChild(createThumb(p, i, photos)));
  }

  // ================= LOGIC =================
  function addPhotos(files) {
    if (PM.mode === "new") {
      files.forEach((file) => {
        const id = uid();
        generateThumbnailDataUrl(file).then((thumb) => {
          PM.draft.push({ id, file, thumbUrl: thumb });
          render();
        });
      });
    }

    if (PM.mode === "edit") {
      files.forEach((file) => {
        const id = uid();
        const refPath = fullPath(PM.visitName, file.name);

        const photo = {
          id,
          name: file.name,
          thumbUrl: "",
          fullUrl: "",
          refPath,
          status: "uploading",
          progress: 0,
        };

        PM.photos.push(photo);
        render();

        generateThumbnailDataUrl(file).then((thumb) => {
          photo.thumbUrl = thumb;
          render();
        });

        uploadPhoto(photo, file);
      });
    }
  }

  function uploadPhoto(photo, file) {
    const task = storage.ref(photo.refPath).put(file);
    PM.uploads[photo.id] = task;

    task.on("state_changed", (snap) => {
      photo.progress = Math.round(
        (snap.bytesTransferred / snap.totalBytes) * 100
      );
      render();
    });

    task.then(() =>
      task.snapshot.ref.getDownloadURL().then((url) => {
        photo.fullUrl = url;
        photo.status = "uploaded";
        delete photo.progress;
        render();
      })
    );
  }

  function deleteFromStorage(item) {
    PM.photos = PM.photos.filter((p) => p.id !== item.id);
    render();
    if (item.refPath)
      storage
        .ref(item.refPath)
        .delete()
        .catch(() => {});
  }

  // ================= PUBLIC API =================
  window.initPhotoBlockForModal = function (container, mode, visitName) {
    PM.container = container;
    PM.mode = mode;
    PM.visitName = visitName;
    PM.uploads = {};

    if (mode === "new") {
      PM.draft = [];
      render();
      return;
    }

    if (mode === "edit") {
      if (PM.photos && PM.photos.length) {
        render();
        return;
      }
      PM.photos = [];
      render();

      fetchVisitPhotos(visitName).then((list) => {
        if (!PM.photos.length) {
          PM.photos = list;
          render();
        }
      });
    }
  };

  window.uploadPendingPhotosToVisit = function (visitName) {
    if (PM.draft.length) {
      PM.draft.forEach((d) => {
        const photo = {
          id: d.id,
          name: d.file.name,
          thumbUrl: d.thumbUrl,
          fullUrl: "",
          refPath: fullPath(visitName, d.file.name),
          status: "uploading",
        };
        PM.photos.push(photo);
        uploadPhoto(photo, d.file);
      });
      PM.draft = [];
      render();
    }
  };

  // ================= GALLERY =================
  function openFullScreenGallery(startIndex, photos) {
    const old = document.getElementById("fs-gallery");
    if (old) old.remove();

    let index = startIndex;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    // Состояние для десктопного перетаскивания
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    let clickTimer = null;

    const overlay = document.createElement("div");
    overlay.id = "fs-gallery";
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;touch-action:none";

    const imgWrap = document.createElement("div");
    imgWrap.style.cssText =
      "position:relative;width:100%;height:85%;display:flex;align-items:center;justify-content:center;overflow:hidden";

    const img = document.createElement("img");
    img.style.cssText =
      "max-width:100%;max-height:100%;object-fit:contain;transition:opacity .2s;transform-origin:center;cursor:zoom-in";

    const counter = document.createElement("div");
    counter.style.cssText = "color:#ccc;font-size:14px;margin-top:10px";

    // ===== helpers =====
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const applyTransform = (noTransition = false) => {
      // Убираем transition во время перетаскивания для плавности (0s)
      img.style.transition = noTransition
        ? "none"
        : "transform .2s, opacity .2s";
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    const resetTransform = () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      img.style.cursor = "zoom-in";
      applyTransform();
    };

    const zoomMax = () => {
      scale = 3;
      img.style.cursor = "grab";
      applyTransform();
    };

    const preload = (i) => {
      if (!photos[i] || photos[i].__preloaded) return;
      const src = photos[i].fullUrl || photos[i].thumbUrl;
      if (!src) return;
      const p = new Image();
      p.src = src;
      photos[i].__preloaded = true;
    };

    const updateImage = (i) => {
      if (i < 0) i = photos.length - 1;
      if (i >= photos.length) i = 0;
      index = i;
      resetTransform();
      img.src = photos[index].fullUrl || photos[index].thumbUrl;
      counter.textContent = `${index + 1} / ${photos.length}`;
      preload(index - 1 < 0 ? photos.length - 1 : index - 1);
      preload(index + 1 >= photos.length ? 0 : index + 1);
    };

    // ===== arrows =====
    const arrow = (dir) => {
      const b = document.createElement("div");
      b.innerHTML = dir === "prev" ? "❮" : "❯";
      b.style.cssText = `position:absolute;top:50%;${
        dir === "prev" ? "left:10px" : "right:10px"
      };transform:translateY(-50%);font-size:40px;color:#fff;cursor:pointer;padding:20px;z-index:10001;`;
      b.onclick = (e) => {
        e.stopPropagation();
        updateImage(dir === "prev" ? index - 1 : index + 1);
      };
      return b;
    };

    // ===== close =====
    const close = document.createElement("div");
    close.innerHTML = "&times;";
    close.style.cssText =
      "position:absolute;top:20px;right:20px;font-size:40px;color:#fff;cursor:pointer;z-index:10002";
    close.onclick = () => overlay.remove();

    // ===== keyboard =====
    const keyHandler = (e) => {
      if (!document.getElementById("fs-gallery")) {
        document.removeEventListener("keydown", keyHandler);
        return;
      }
      if (e.key === "Escape") overlay.remove();
      if (e.key === "ArrowLeft") updateImage(index - 1);
      if (e.key === "ArrowRight") updateImage(index + 1);
    };
    document.addEventListener("keydown", keyHandler);

    // ===== DESKTOP MOUSE EVENTS (ZOOM & DRAG) =====
    if (!isTouchDevice) {
      img.addEventListener("mousedown", (e) => {
        if (scale > 1) {
          isDragging = true;
          img.style.cursor = "grabbing";
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          e.preventDefault(); // Предотвращаем стандартное перетаскивание картинки
        }
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        translateX += dx;
        translateY += dy;
        applyTransform(true); // true для мгновенного отклика без анимации
      });

      window.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          img.style.cursor = "grab";
        }
      });

      img.addEventListener("click", (e) => {
        if (clickTimer) return;
        clickTimer = setTimeout(() => {
          if (scale === 1) {
            zoomMax();
          }
          clickTimer = null;
        }, 220);
      });

      img.addEventListener("dblclick", (e) => {
        e.preventDefault();
        clearTimeout(clickTimer);
        clickTimer = null;
        resetTransform();
      });
    }

    // ===== touch: swipe + pinch (MOBILE) =====
    let startX = 0,
      startY = 0,
      lastDist = 0,
      draggingTouch = false;

    imgWrap.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        draggingTouch = scale > 1;
      }
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDist = Math.hypot(dx, dy);
      }
    });

    imgWrap.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = (dist - lastDist) / 200;
        scale = clamp(scale + delta, 1, 3);
        lastDist = dist;
        applyTransform(true);
      }
      if (e.touches.length === 1 && draggingTouch) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        translateX += dx;
        translateY += dy;
        applyTransform(true);
      }
    });

    imgWrap.addEventListener("touchend", (e) => {
      if (scale === 1 && e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) updateImage(dx < 0 ? index + 1 : index - 1);
      }
      draggingTouch = false;
    });

    // ===== mount =====
    imgWrap.appendChild(img);
    overlay.appendChild(close);
    overlay.appendChild(imgWrap);
    overlay.appendChild(counter);

    if (photos.length > 1) {
      overlay.appendChild(arrow("prev"));
      overlay.appendChild(arrow("next"));
    }

    document.body.appendChild(overlay);
    updateImage(index);
  }
})();
