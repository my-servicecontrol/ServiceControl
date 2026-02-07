(function () {
  // ================= DEPENDENCIES =================
  const storage = window.storage;

  if (!storage) {
    console.error("Firebase Storage SDK не инициализирован");
    return;
  }

  // ================= STATE & CACHE =================
  let cachedData = {};
  let historyLog = [];

  // Исправленный блок парсинга с защитой от пустых строк
  try {
    const rawCache = localStorage.getItem("photo_cache");
    const rawHistory = localStorage.getItem("photo_history");

    cachedData = rawCache && rawCache.trim() !== "" ? JSON.parse(rawCache) : {};
    historyLog =
      rawHistory && rawHistory.trim() !== "" ? JSON.parse(rawHistory) : [];
  } catch (e) {
    console.error("Ошибка парсинга кэша, сброс до пустых значений:", e);
    cachedData = {};
    historyLog = [];
  }

  const PM = {
    mode: null,
    container: null,
    visitName: null,
    cache: cachedData,
    history: historyLog,
    draft: [],
    photos: [],
    uploads: {},
    //isVisible: localStorage.getItem("photo_block_visible") !== "false",
  };
  function saveToLocalStorage() {
    try {
      localStorage.setItem("photo_cache", JSON.stringify(PM.cache));
      localStorage.setItem("photo_history", JSON.stringify(PM.history));
    } catch (e) {
      console.warn("LocalStorage переполнен, очистка старых записей...");
      const toRemove = PM.history.splice(0, 10);
      toRemove.forEach((v) => delete PM.cache[v]);
      saveToLocalStorage();
    }
  }
  // ===== reset =====
  function resetPhotoManager() {
    PM.mode = null;
    PM.container = null;
    PM.visitName = null;
    PM.draft = [];
    PM.photos = [];
    PM.uploads = {};
  }

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

  function warmUpBrowserCache(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Продолжаем даже при ошибке
      img.src = url;
    });
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

    // Внутри createThumb перед добавлением кнопки del
    const statusValue = document.getElementById("typeStatus")?.value;
    const isLocked =
      ["виконано", "factura", "в архів"].includes(statusValue) ||
      window.activated === false;

    if (!isLocked) {
      w.appendChild(del);
    }
    return w;
  }

  function render() {
    const container = PM.container;
    if (!container) return;

    const statusValue = document.getElementById("typeStatus")?.value;
    const isLocked =
      ["виконано", "factura", "в архів"].includes(statusValue) ||
      window.activated === false;

    let block = container.querySelector("#photoBlock");
    if (!block) {
      block = document.createElement("div");
      block.id = "photoBlock";
      block.className = "mb-3 p-2 border rounded bg-light transition-all";
      container.insertAdjacentElement("afterbegin", block);
    }

    const photos = PM.mode === "new" ? PM.draft : PM.photos;

    // Иконка стрелки в зависимости от состояния
    const arrowIcon = PM.isVisible ? "bi-chevron-up" : "bi-chevron-down";
    const toggleHtml = `
      <div id="togglePhotoBtn" style="cursor:pointer; display:flex; align-items:center; gap:5px; user-select:none;">
        <small class="text-muted" style="font-size: 11px;">${photos.length} фото</small>
        <i class="bi ${arrowIcon}" style="font-size: 12px; color: #6c757d;"></i>
      </div>
    `;

    if (!PM.isVisible) {
      // СКРЫТЫЙ вид: всего одна строка, минимум места
      block.style.padding = "2px 8px";
      block.innerHTML = `
        <div class="d-flex justify-content-between align-items-center" style="height: 24px;">
          <label class="form-label fw-bold mb-0" style="font-size: 12px; opacity: 0.7;">${t(
            "visitPhotos"
          )}</label>
          ${toggleHtml}
        </div>
      `;
    } else {
      // ОТКРЫТЫЙ вид
      block.style.padding = "8px";
      block.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-bold mb-0">${t("visitPhotos")}</label>
          ${toggleHtml}
        </div>
        <div id="scroll" style="display:flex;gap:8px;overflow-x:auto;align-items:center;padding-bottom:5px">
          <div id="addBtn" style="
            flex: 0 0 auto;
            width: 86px;
            height: 86px;
            border: 1px dashed #ccc;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isLocked ? "#e9ecef" : "#fff"};
            cursor: ${isLocked ? "not-allowed" : "pointer"};
            opacity: ${isLocked ? "0.6" : "1"};
          ">
            <i class="bi bi-camera" style="font-size:28px; color: ${
              isLocked ? "#6c757d" : "#0d6efd"
            };"></i>
          </div>
        </div>
        <input id="photoInput" type="file" accept="image/*" multiple hidden>
      `;

      const scroll = block.querySelector("#scroll");
      const addBtn = block.querySelector("#addBtn");
      const input = block.querySelector("#photoInput");

      if (!isLocked) {
        addBtn.onclick = () => input.click();
        input.onchange = (e) => {
          addPhotos(Array.from(e.target.files || []));
          e.target.value = "";
        };
      }
      photos.forEach((p, i) => scroll.appendChild(createThumb(p, i, photos)));
    }

    // Обработчик клика на стрелку и количество фото
    block.querySelector("#togglePhotoBtn").onclick = (e) => {
      e.preventDefault();
      PM.isVisible = !PM.isVisible;
      localStorage.setItem("photo_block_visible", PM.isVisible);
      render();
    };
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
    // Настройка метаданных для браузерного кэширования на 1 год (31536000 секунд)
    const metadata = {
      cacheControl: "public, max-age=31536000",
      contentType: file.type, // важно сохранить тип файла
    };

    // Передаем метаданные вторым аргументом в .put()
    const task = storage.ref(photo.refPath).put(file, metadata);
    PM.uploads[photo.id] = task;

    task.on("state_changed", (snap) => {
      photo.progress = Math.round(
        (snap.bytesTransferred / snap.totalBytes) * 100
      );
      // Важно: обновляем кэш в процессе, чтобы status: "uploading" закрепился в LS
      PM.cache[PM.visitName] = [...PM.photos];
      render();
    });

    task.then(async (snapshot) => {
      const url = await snapshot.ref.getDownloadURL();

      // --- ПЕРЕДАЕМ В ФАНТОМНЫЙ КЭШ ---
      await warmUpBrowserCache(url);
      // --------------------------------

      photo.fullUrl = url;
      photo.thumbUrl = url; // Используем тот же URL для превью
      photo.status = "uploaded";
      delete photo.progress;

      delete PM.uploads[photo.id]; // Удаляем из активных загрузок
      PM.cache[PM.visitName] = [...PM.photos];
      saveToLocalStorage();
      render();
    });
  }

  function deleteFromStorage(item) {
    // Проверка условий запрета
    const statusValue = document.getElementById("typeStatus")?.value;
    if (
      statusValue === "виконано" ||
      statusValue === "factura" ||
      statusValue === "в архів" ||
      window.activated === false // Убедись, что activated доступна глобально
    ) {
      return;
    }

    PM.photos = PM.photos.filter((p) => p.id !== item.id);
    PM.cache[PM.visitName] = PM.photos;
    saveToLocalStorage();
    render();
    if (item.refPath)
      storage
        .ref(item.refPath)
        .delete()
        .catch((err) => console.error("Ошибка удаления:", err));
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
      // 1. Пытаемся взять данные из многослойного кэша
      PM.photos = PM.cache[visitName] || [];

      // 2. Мгновенно отображаем то, что нашли в кэше
      render();

      // 3. Фоновая проверка облака
      fetchVisitPhotos(visitName)
        .then((newList) => {
          // Если у нас прямо сейчас что-то грузится для этого визита,
          // не позволяем облаку затереть локальные превью.
          const isUploadingRightNow = PM.photos.some(
            (p) => p.status === "uploading"
          );
          if (isUploadingRightNow) return;

          const oldList = PM.cache[visitName] || [];

          // Сравниваем: изменилось ли что-то в облаке?
          const isDifferent =
            newList.length !== oldList.length ||
            newList.some((p, i) => !oldList[i] || p.name !== oldList[i].name);

          if (isDifferent) {
            console.log(`Данные визита ${visitName} обновились в облаке.`);

            // Обновляем кэш
            PM.cache[visitName] = newList;
            PM.photos = newList;

            // Управляем историей (лимит 20)
            PM.history = PM.history.filter((v) => v !== visitName);
            PM.history.push(visitName);
            if (PM.history.length > 20) {
              const oldVisit = PM.history.shift();
              delete PM.cache[oldVisit];
            }
            saveToLocalStorage();
            render();
          }
        })
        .catch((err) => console.error("Ошибка фонового обновления:", err));
    }

    // Авто-обновление при смене статуса
    const statusSelect = document.getElementById("typeStatus");
    if (statusSelect && !statusSelect.__linkedToPhotos) {
      statusSelect.__linkedToPhotos = true;
      statusSelect.addEventListener("change", () => render());
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

      PM.cache[visitName] = [...PM.photos]; // Сохраняем текущее состояние (с загружающимися фото) в кэш
      saveToLocalStorage(); // Записываем в память браузера
      PM.draft = [];
      render();
    }
  };

  // ===== cleanup binding (ОДИН РАЗ) =====
  (function bindModalCleanupOnce() {
    const modalEl = document.getElementById("commonModal");
    if (!modalEl || modalEl.__photoCleanupBound) return;
    modalEl.__photoCleanupBound = true;

    modalEl.addEventListener("hidden.bs.modal", () => resetPhotoManager());
  })();

  // ================= GALLERY =================
  function openFullScreenGallery(startIndex, photos) {
    const old = document.getElementById("fs-gallery");
    if (old) old.remove();

    let index = startIndex;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let lastDist = 0;
    let startX = 0,
      startY = 0;
    let lastTapTime = 0;
    let isPinching = false;
    let isDragging = false; // Для десктопа
    let lastMouseX = 0,
      lastMouseY = 0;
    const DOUBLE_TAP_DELAY = 300;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const overlay = document.createElement("div");
    overlay.id = "fs-gallery";
    // ИЗМЕНЕНИЕ: touch-action: none и inset: 0 для полного экрана
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,.98);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;touch-action:none";

    const imgWrap = document.createElement("div");
    // ИЗМЕНЕНИЕ: height: 100% вместо 85% для прилегания краев к экрану
    imgWrap.style.cssText =
      "position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden";

    const img = document.createElement("img");
    img.style.cssText =
      "max-width:100%;max-height:100%;object-fit:contain;transition:opacity .2s;transform-origin:center;cursor:zoom-in;will-change:transform;";

    const counter = document.createElement("div");
    // Сделаем счетчик полупрозрачным поверх фото
    counter.style.cssText =
      "position:absolute;bottom:20px;color:#fff;background:rgba(0,0,0,0.5);padding:5px 15px;border-radius:20px;font-size:14px;z-index:10005";

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const applyTransform = (noTransition = false) => {
      if (scale <= 1) {
        translateX = 0;
        translateY = 0;
      } else {
        const rect = img.getBoundingClientRect();
        const wrapRect = imgWrap.getBoundingClientRect();
        const maxX = Math.max(0, (rect.width - wrapRect.width) / 2);
        const maxY = Math.max(0, (rect.height - wrapRect.height) / 2);
        translateX = clamp(translateX, -maxX, maxX);
        translateY = clamp(translateY, -maxY, maxY);
      }
      img.style.transition = noTransition ? "none" : "transform .2s ease-out";
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

    // ВОССТАНОВЛЕНО: Предзагрузка
    const preload = (i) => {
      if (!photos[i] || photos[i].__preloaded) return;

      // Если thumbUrl содержит data:image (локальный кэш), значит фото уже в памяти
      if (photos[i].thumbUrl && photos[i].thumbUrl.startsWith("data:")) {
        photos[i].__preloaded = true;
        return;
      }

      const p = new Image();
      p.src = photos[i].fullUrl || photos[i].thumbUrl;
      photos[i].__preloaded = true;
    };

    const updateImage = (i) => {
      if (i < 0) i = photos.length - 1;
      if (i >= photos.length) i = 0;
      index = i;
      resetTransform();

      // ПРИОРИТЕТ: 1. Оригинал (fullUrl), 2. Локальный кэш/Превью (thumbUrl)
      // В вашем случае thumbUrl при загрузке — это тяжелый Base64,
      // а после загрузки — это ссылка на Firebase. Оба варианта работают быстро.
      const targetSrc = photos[index].fullUrl || photos[index].thumbUrl;

      img.src = targetSrc;
      counter.textContent = `${index + 1} / ${photos.length}`;
      applyTransform();

      preload(index - 1 < 0 ? photos.length - 1 : index - 1);
      preload(index + 1 >= photos.length ? 0 : index + 1);
    };

    // Кнопки навигации
    const arrow = (dir) => {
      const b = document.createElement("div");
      b.innerHTML = dir === "prev" ? "❮" : "❯";
      b.style.cssText = `position:absolute;top:50%;${
        dir === "prev" ? "left:10px" : "right:10px"
      };transform:translateY(-50%);font-size:40px;color:#fff;cursor:pointer;padding:20px;z-index:10001;text-shadow: 0 0 10px rgba(0,0,0,0.5)`;
      b.onclick = (e) => {
        e.stopPropagation();
        updateImage(dir === "prev" ? index - 1 : index + 1);
      };
      return b;
    };

    const close = document.createElement("div");
    close.innerHTML = "&times;";
    close.style.cssText =
      "position:absolute;top:20px;right:20px;font-size:45px;color:#fff;cursor:pointer;z-index:10002;line-height:1";
    close.onclick = () => overlay.remove();

    // ВОССТАНОВЛЕНО: Клавиатура
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

    // ДЕСКТОП: Drag-and-drop
    if (!isTouchDevice) {
      img.addEventListener("mousedown", (e) => {
        if (scale > 1) {
          isDragging = true;
          img.style.cursor = "grabbing";
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          e.preventDefault();
        }
      });
      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        // ТУТ МОЖНО УВЕЛИЧИТЬ ЧУВСТВИТЕЛЬНОСТЬ МЫШИ
        translateX += ((e.clientX - lastMouseX) * 3) / scale;
        translateY += ((e.clientY - lastMouseY) * 3) / scale;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        applyTransform(true);
      });
      window.addEventListener("mouseup", () => {
        isDragging = false;
        img.style.cursor = scale > 1 ? "grab" : "zoom-in";
      });
      img.addEventListener("click", (e) => {
        let clickTimer = setTimeout(() => {
          if (scale === 1) zoomMax();
        }, 200);
        img.addEventListener(
          "dblclick",
          () => {
            clearTimeout(clickTimer);
            resetTransform();
          },
          { once: true }
        );
      });
    }

    // МОБИЛЬНЫЕ: Умный зум и свайпы
    imgWrap.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isPinching = false;
        }
        if (e.touches.length === 2) {
          isPinching = true;
          lastDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      },
      { passive: false }
    );

    imgWrap.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const delta = (dist - lastDist) / 100;
          scale = clamp(scale + delta, 1, 5);
          lastDist = dist;
          applyTransform(true);
        } else if (e.touches.length === 1 && scale > 1 && !isPinching) {
          // ТУТ МОЖНО УВЕЛИЧИТЬ ЧУВСТВИТЕЛЬНОСТЬ ТАЧА (например dx * 1.2)
          const dx = (e.touches[0].clientX - startX) * 3;
          const dy = (e.touches[0].clientY - startY) * 3;

          translateX += dx;
          translateY += dy;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          applyTransform(true);
        }
      },
      { passive: false }
    );

    imgWrap.addEventListener("touchend", (e) => {
      if (e.touches.length === 0) {
        lastDist = 0;
        setTimeout(() => {
          isPinching = false;
        }, 100);
      }
      if (scale > 1 && scale < 1.05) resetTransform();

      const now = Date.now();
      if (e.changedTouches.length === 1 && !isPinching) {
        if (now - lastTapTime < DOUBLE_TAP_DELAY) {
          scale === 1 ? zoomMax() : resetTransform();
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;
        if (scale === 1) {
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 70) updateImage(dx < 0 ? index + 1 : index - 1);
        }
      }
    });

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
