/**
 * fotoblock.js
 * Реализация: Fast UI + Background Upload + Full Gallery (Swipe/Arrows) + Horizontal Scroll.
 */

(function () {
  // === ЗАВИСИМОСТИ ===
  const storage = window.storage;
  const t = window.t || ((key) => key);

  if (!storage) {
    console.error("Firebase Storage SDK не инициализирован.");
    return;
  }

  // === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===
  const PM = {
    pendingFiles: [], // Буфер для загрузки
    miniatures: [], // Буфер для отображения в newOrder

    currentContainer: null,
    currentMode: null,
    currentVisitName: null,
  };

  // === 1. ХЕЛПЕРЫ ===

  function fullPath(visitName, fileName) {
    const sName = window.sName;
    if (!sName) return null;
    const cleanFileName = fileName.replace(/\s+/g, "_");
    return `${sName}/visits/${visitName}/full/${Date.now()}_${cleanFileName}`;
  }

  // Использует window.firebase, который должен быть глобально доступен
  function fetchPhotosFromStorage(visitName) {
    const sName = window.sName;
    if (!sName || !storage) return Promise.resolve([]);

    // Путь к папке визита в Storage
    const visitRef = storage.ref(`${sName}/visits/${visitName}/full`);

    // listAll() запрашивает метаданные всех файлов в папке
    return visitRef.listAll().then((res) => {
      const promises = res.items.map((itemRef) =>
        // Получаем прямую ссылку для отображения
        itemRef.getDownloadURL().then((url) => ({
          name: itemRef.name,
          fullUrl: url,
          refPath: itemRef.fullPath,
          // Для кросс-девайс просмотра мы используем fullUrl как thumbUrl
          thumbUrl: url,
        }))
      );
      return Promise.all(promises);
    });
  }

  function generateThumbnailDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          const maxWidth = 150; // Чуть больше для качества на ретине
          const maxHeight = 150;
          if (w > h) {
            if (w > maxWidth) {
              h *= maxWidth / w;
              w = maxWidth;
            }
          } else {
            if (h > maxHeight) {
              w *= maxHeight / h;
              h = maxHeight;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // === 2. РЕНДЕРИНГ UI (С Горизонтальным скроллом) ===

  function createThumbElement(item, index, isEditMode, allPhotos) {
    const thumbUrl =
      typeof item === "string" ? item : item.thumbUrl || item.fullUrl;
    const fileName = typeof item === "object" ? item.name : "";

    const wrapper = document.createElement("div");
    // Стили для элемента в ряду (фиксированный размер, без сжатия)
    wrapper.style.cssText =
      "flex: 0 0 auto; position: relative; width: 86px; height: 86px; border-radius: 6px; overflow: hidden; background: #f8f9fa; border: 1px solid #dee2e6;";

    const img = document.createElement("img");
    img.src = thumbUrl;
    img.style.cssText =
      "width: 100%; height: 100%; object-fit: cover; cursor: pointer;";

    // КЛИК ПО МИНИАТЮРЕ -> ОТКРЫТИЕ ГАЛЕРЕИ
    img.onclick = () => {
      // Если это строка (newOrder), превращаем в объект для унификации
      const gallerySource = allPhotos.map((p) =>
        typeof p === "string" ? { fullUrl: p, thumbUrl: p } : p
      );
      openFullScreenGallery(index, gallerySource);
    };

    const delBtn = document.createElement("button");
    delBtn.innerHTML = "&times;";
    delBtn.style.cssText =
      "position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 4px; width: 20px; height: 20px; font-size: 16px; line-height: 16px; padding: 0; cursor: pointer; z-index: 10;";

    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (isEditMode) {
        deletePhotoFromStorage(index);
      } else {
        deletePhotoFromPending(index);
      }
    };

    wrapper.appendChild(img);
    wrapper.appendChild(delBtn);
    return wrapper;
  }

  function renderPhotoBlock(container, photos, mode) {
    if (!container) return;

    let block = container.querySelector("#photoBlock");
    if (!block) {
      block = document.createElement("div");
      block.id = "photoBlock";
      block.className = "mb-3 p-2 border rounded bg-light";
      container.insertAdjacentElement("afterbegin", block);
    }

    const count = photos.length;
    let infoText =
      mode === "new"
        ? count > 0
          ? t("newPhotosCount", { count })
          : t("addPhotoPrompt")
        : count > 0
        ? t("totalPhotosCount", { count })
        : t("noPhotos");

    block.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label fw-bold mb-0">${t("visitPhotos")}</label>
              <small class="text-muted">${count}</small>
          </div>
          
          <div id="scrollContainer" style="display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 8px; padding-bottom: 5px; align-items: center;">
              
              <div id="addFotoBtn" title="${t(
                "addPhoto"
              )}" style="flex: 0 0 auto; width: 86px; height: 86px; border: 1px dashed #ccc; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff;">
                  <i class="bi bi-camera" style="font-size: 28px; color: #0d6efd;"></i>
              </div>

              </div>

          <div class="text-muted mt-2" style="font-size: 12px;">${infoText}</div>
          <input type="file" id="photoInput_local" accept="image/*" multiple style="display:none">
      `;

    const scrollContainer = block.querySelector("#scrollContainer");
    const addBtn = block.querySelector("#addFotoBtn");
    const fileInput = block.querySelector("#photoInput_local");

    addBtn.onclick = () => fileInput.click();

    // Отрисовка фото
    photos.forEach((item, idx) => {
      const thumb = createThumbElement(item, idx, mode === "edit", photos);
      scrollContainer.appendChild(thumb);
    });

    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        window.addPhoto(files);
      }
      e.target.value = "";
    };
  }

  // === 3. ЛОГИКА УДАЛЕНИЯ ===

  function deletePhotoFromPending(index) {
    PM.pendingFiles.splice(index, 1);
    PM.miniatures.splice(index, 1);
    renderPhotoBlock(PM.currentContainer, PM.miniatures, "new");
  }

  function deletePhotoFromStorage(index) {
    if (!PM.currentVisitName) return;

    const lsKey = `thumbs_${PM.currentVisitName}`;
    let cachedPhotos = JSON.parse(localStorage.getItem(lsKey) || "[]");

    const photoToDelete = cachedPhotos[index];

    if (photoToDelete) {
      // 1. Удаляем из LS
      cachedPhotos.splice(index, 1);
      localStorage.setItem(lsKey, JSON.stringify(cachedPhotos));

      // 2. Перерисовываем UI
      renderPhotoBlock(PM.currentContainer, cachedPhotos, "edit");

      // 3. Удаляем файл из Storage (тихо)
      if (photoToDelete.refPath) {
        storage
          .ref(photoToDelete.refPath)
          .delete()
          .catch((err) => {
            console.warn("Файл уже удален или ошибка:", err);
          });
      }
    }
  }

  // === 4. EXPORT: ИНИЦИАЛИЗАЦИЯ И ДОБАВЛЕНИЕ ===
  window.initPhotoBlockForModal = function (container, mode, visitFolderName) {
    PM.currentContainer = container;
    PM.currentMode = mode;
    PM.currentVisitName = visitFolderName;

    if (mode === "new") {
      renderPhotoBlock(container, PM.miniatures, "new");
    } else if (mode === "edit" && visitFolderName) {
      const lsKey = `thumbs_${visitFolderName}`;
      const cachedPhotos = JSON.parse(localStorage.getItem(lsKey) || "[]");

      // --- ЭТАП 1: МГНОВЕННОЕ ОТОБРАЖЕНИЕ (Fast UI) ---
      // Показываем пользователю то, что есть в его локальном кэше (старое или актуальное)
      renderPhotoBlock(container, cachedPhotos, "edit");

      // --- ЭТАП 2: ФОНОВАЯ СИНХРОНИЗАЦИЯ (Решение проблемы) ---
      // Всегда запрашиваем актуальный список из Storage, независимо от наличия кэша.
      fetchPhotosFromStorage(visitFolderName, lsKey)
        .then((livePhotos) => {
          // Проверяем, отличается ли актуальный список от локального кэша
          // Сравниваем по длине (быстрый способ) или по содержимому (более надежный)
          const isCacheOutdated = livePhotos.length !== cachedPhotos.length;

          if (isCacheOutdated) {
            console.log(
              "Кэш устарел. Принудительная синхронизация и обновление."
            );

            // Обновляем Local Storage актуальными данными
            localStorage.setItem(lsKey, JSON.stringify(livePhotos));

            // Перерисовываем блок актуальными фото, если он еще открыт
            // (Используем livePhotos, так как они содержат все fullUrl)
            if (PM.currentContainer === container) {
              renderPhotoBlock(container, livePhotos, "edit");
            }
          } else if (cachedPhotos.length === 0 && livePhotos.length === 0) {
            // Убедимся, что рендеринг был выполнен правильно, если оба пустые
            renderPhotoBlock(container, [], "edit");
          }
        })
        .catch((err) => {
          console.error("Ошибка при фоновой синхронизации фото:", err);
          // В случае ошибки оставляем то, что было в кэше.
        });
    }
  };

  window.addPhoto = function (files) {
    if (!files || files.length === 0) return;
    const fileArray = Array.isArray(files) ? files : Array.from(files);

    // --- NEW MODE ---
    if (PM.currentMode === "new") {
      fileArray.forEach((file) => {
        generateThumbnailDataUrl(file).then((dataUrl) => {
          PM.pendingFiles.push({ file: file, dataUrl: dataUrl });
          PM.miniatures.push(dataUrl);
          if (PM.currentContainer)
            renderPhotoBlock(PM.currentContainer, PM.miniatures, "new");
        });
      });
    }

    // --- EDIT MODE (Мгновенное сохранение + Фон) ---
    else if (PM.currentMode === "edit" && PM.currentVisitName) {
      const lsKey = `thumbs_${PM.currentVisitName}`;
      const currentLS = JSON.parse(localStorage.getItem(lsKey) || "[]");

      fileArray.forEach((file) => {
        generateThumbnailDataUrl(file).then((dataUrl) => {
          const fPath = fullPath(PM.currentVisitName, file.name);
          const photoObj = {
            name: file.name,
            fullUrl: "", // Будет обновлено после загрузки
            refPath: fPath,
            thumbUrl: dataUrl,
          };

          currentLS.push(photoObj);
          localStorage.setItem(lsKey, JSON.stringify(currentLS));

          if (PM.currentContainer)
            renderPhotoBlock(PM.currentContainer, currentLS, "edit");

          // Фоновая загрузка с обновлением LS
          if (fPath) {
            const ref = storage.ref(fPath);
            ref
              .put(file)
              .then(() => ref.getDownloadURL())
              .then((url) => {
                // Обновляем fullUrl в LS после загрузки!
                const updatedLS = JSON.parse(
                  localStorage.getItem(lsKey) || "[]"
                );
                const itemToUpdate = updatedLS.find((p) => p.refPath === fPath);
                if (itemToUpdate) {
                  itemToUpdate.fullUrl = url;
                  localStorage.setItem(lsKey, JSON.stringify(updatedLS));
                }
              })
              .catch((e) => console.error("Ошибка загрузки:", e));
          }
        });
      });
    }
  };

  // === 5. EXPORT: ЗАГРУЗКА (Вызывается из addCheck) ===

  window.uploadPendingPhotosToVisit = function (visitFolderName) {
    if (!PM.pendingFiles || PM.pendingFiles.length === 0) {
      return Promise.resolve();
    }

    const sName = window.sName;
    if (!sName) {
      console.error("sName не найден.");
      return Promise.resolve();
    }

    const lsCacheData = [];
    const filesToUpload = [...PM.pendingFiles];

    // 1. Быстрое сохранение в LS
    filesToUpload.forEach((item) => {
      const fPath = fullPath(visitFolderName, item.file.name);
      lsCacheData.push({
        name: item.file.name,
        fullUrl: "",
        refPath: fPath,
        thumbUrl: item.dataUrl,
      });
    });

    const lsKey = `thumbs_${visitFolderName}`;
    const oldLS = JSON.parse(localStorage.getItem(lsKey) || "[]");
    const newLS = [...oldLS, ...lsCacheData];

    try {
      localStorage.setItem(lsKey, JSON.stringify(newLS));
      PM.pendingFiles = [];
      PM.miniatures = [];
    } catch (e) {
      console.error("LS Error:", e);
    }

    // 2. Фоновая загрузка с ОБНОВЛЕНИЕМ Local Storage
    filesToUpload.forEach((item) => {
      const fPath = fullPath(visitFolderName, item.file.name);
      if (fPath) {
        const ref = storage.ref(fPath);
        ref
          .put(item.file)
          .then(() => ref.getDownloadURL())
          .then((url) => {
            console.log(`[ФОН] ${item.file.name} загружен. URL: ${url}`);
            // ! ВАЖНО: Обновляем LS, чтобы при клике открывался оригинал !
            const currentLS = JSON.parse(localStorage.getItem(lsKey) || "[]");
            const photoIndex = currentLS.findIndex((p) => p.refPath === fPath);
            if (photoIndex !== -1) {
              currentLS[photoIndex].fullUrl = url;
              localStorage.setItem(lsKey, JSON.stringify(currentLS));
            }
          })
          .catch((e) => console.error(`Ошибка загрузки ${item.file.name}:`, e));
      }
    });

    return Promise.resolve();
  };

  // === 6. ПОЛНАЯ ГАЛЕРЕЯ (СВАЙПЫ + СТРЕЛКИ) ===

  function openFullScreenGallery(startIndex, photos) {
    // Удаляем старую галерею, если есть
    const old = document.getElementById("fs-gallery");
    if (old) old.remove();

    let currentIndex = startIndex;

    // Создаем оверлей
    const overlay = document.createElement("div");
    overlay.id = "fs-gallery";
    overlay.style.cssText =
      "position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; user-select: none;";

    // Контейнер картинки
    const imgContainer = document.createElement("div");
    imgContainer.style.cssText =
      "position: relative; width: 100%; height: 85%; display: flex; justify-content: center; align-items: center;";

    const img = document.createElement("img");
    img.style.cssText =
      "max-width: 100%; max-height: 100%; object-fit: contain; transition: opacity 0.2s;";

    // Счетчик
    const counter = document.createElement("div");
    counter.style.cssText = "color: #ccc; font-size: 14px; margin-top: 10px;";

    // Функция обновления
    const updateImage = (index) => {
      if (index < 0) index = photos.length - 1;
      if (index >= photos.length) index = 0;
      currentIndex = index;

      const item = photos[currentIndex];
      // Приоритет: fullUrl (Storage) -> thumbUrl (DataURL)
      img.src = item.fullUrl || item.thumbUrl;
      counter.textContent = `${currentIndex + 1} / ${photos.length}`;
    };

    // Кнопка закрытия
    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText =
      "position: absolute; top: 20px; right: 20px; color: #fff; font-size: 40px; cursor: pointer; z-index: 10002;";
    closeBtn.onclick = () => overlay.remove();

    // Стрелки
    const createArrow = (dir) => {
      const btn = document.createElement("div");
      btn.innerHTML = dir === "prev" ? "&#10094;" : "&#10095;";
      btn.style.cssText = `position: absolute; top: 50%; ${
        dir === "prev" ? "left: 10px" : "right: 10px"
      }; transform: translateY(-50%); color: #fff; font-size: 40px; cursor: pointer; padding: 20px; z-index: 10001; user-select: none;`;
      btn.onclick = (e) => {
        e.stopPropagation();
        updateImage(dir === "prev" ? currentIndex - 1 : currentIndex + 1);
      };
      return btn;
    };

    imgContainer.appendChild(img);
    overlay.appendChild(closeBtn);
    overlay.appendChild(imgContainer);
    overlay.appendChild(counter);

    if (photos.length > 1) {
      overlay.appendChild(createArrow("prev"));
      overlay.appendChild(createArrow("next"));
    }

    document.body.appendChild(overlay);
    updateImage(currentIndex);

    // --- СОБЫТИЯ (КЛАВИАТУРА И ТАЧ) ---

    // Клавиатура
    const keyHandler = (e) => {
      if (!document.getElementById("fs-gallery")) {
        document.removeEventListener("keydown", keyHandler);
        return;
      }
      if (e.key === "Escape") overlay.remove();
      if (e.key === "ArrowLeft") updateImage(currentIndex - 1);
      if (e.key === "ArrowRight") updateImage(currentIndex + 1);
    };
    document.addEventListener("keydown", keyHandler);

    // Тач (Свайпы)
    let touchStartX = 0;
    let touchEndX = 0;

    imgContainer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    imgContainer.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const threshold = 50; // Мин. расстояние для свайпа
      if (touchEndX < touchStartX - threshold) updateImage(currentIndex + 1); // Свайп влево (Next)
      if (touchEndX > touchStartX + threshold) updateImage(currentIndex - 1); // Свайп вправо (Prev)
    }
  }
})();
