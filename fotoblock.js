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

    let idx = startIndex;

    const overlay = document.createElement("div");
    overlay.id = "fs-gallery";
    overlay.style.cssText =
      "position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; user-select: none;";

    const img = document.createElement("img");
    img.style.cssText = "max-width:100%;max-height:85%;object-fit:contain";

    const counter = document.createElement("div");
    counter.style.cssText = "color:#ccc;margin-top:10px";

    const left = document.createElement("div");
    left.innerHTML = "❮";
    left.style.cssText = `
  position:absolute;
  left:20px;
  top:50%;
  transform:translateY(-50%);
  font-size:40px;
  color:#fff;
  cursor:pointer;
  user-select:none;
`;

    const right = document.createElement("div");
    right.innerHTML = "❯";
    right.style.cssText = `
  position:absolute;
  right:20px;
  top:50%;
  transform:translateY(-50%);
  font-size:40px;
  color:#fff;
  cursor:pointer;
  user-select:none;
`;

    left.onclick = () => update(idx - 1);
    right.onclick = () => update(idx + 1);

    overlay.appendChild(left);
    overlay.appendChild(right);

    const update = (i) => {
      if (i < 0) i = photos.length - 1;
      if (i >= photos.length) i = 0;
      idx = i;
      img.src = photos[idx].fullUrl || photos[idx].thumbUrl;
      counter.textContent = `${idx + 1} / ${photos.length}`;
    };

    const close = document.createElement("div");
    close.innerHTML = "&times;";
    close.style.cssText =
      "position:absolute;top:20px;right:20px;color:#fff;font-size:40px;cursor:pointer";
    close.onclick = () => overlay.remove();

    overlay.appendChild(close);
    overlay.appendChild(img);
    overlay.appendChild(counter);
    document.body.appendChild(overlay);
    update(idx);

    // обработка свайп
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50; // px

    overlay.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
    });

    overlay.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      touchEndX = e.touches[0].clientX;
    });

    overlay.addEventListener("touchend", () => {
      if (!touchStartX || !touchEndX) return;

      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff > 0) {
          // swipe left → next
          update(idx + 1);
        } else {
          // swipe right → prev
          update(idx - 1);
        }
      }

      touchStartX = 0;
      touchEndX = 0;
    });
    overlay.style.touchAction = "pan-y";

    document.addEventListener("keydown", (e) => {
      if (!document.getElementById("fs-gallery")) return;
      if (e.key === "Escape") overlay.remove();
      if (e.key === "ArrowLeft") update(idx - 1);
      if (e.key === "ArrowRight") update(idx + 1);
    });
  }
})();
