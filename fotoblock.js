(function () {
  window._photoModule = window._photoModule || {};
  const PM = window._photoModule;

  // --- 1. Инициализация и Проверки ---
  const storage = window.storage;
  const db = window.db;
  // const SERVICE_ID = window.sName; <-- ЭТУ СТРОКУ УДАЛЯЕМ (она фиксирует пустое значение)
  const firebase = window.firebase; // Оставляем для доступа к FieldValue

  if (!storage || !db || !firebase) {
    console.error("Firebase SDK, Storage или Firestore не инициализированы.");
    return;
  }
  // Дополнительная проверка, чтобы избежать ReferenceError при загрузке.
  // Теперь проверяем sName в момент использования.
  // ...
  // Дополнительная проверка, чтобы избежать ReferenceError при загрузке.
  /*if (!sName) {
    console.error("sName (window.sName) не задан.");
  }*/
  // --- 2. Состояние модуля ---
  PM.mode = null; // 'new' | 'edit'
  PM.visitName = null;
  PM.filesMap = {};
  PM.pendingFiles = []; // Массив {key, file, dataUrl} для загрузки
  PM.photoCount = 0;
  PM.visitDocRef = null;

  // --- 3. Хелперы Путей и Ключей ---

  // Путь к оригиналу в Storage: ID_СТО / visits / visitName / full / filename
  function fullPath(visitName, fileName) {
    if (!sName) return null;
    const cleanFileName = fileName.replace(/\s+/g, "_");
    return `${sName}/visits/${visitName}/full/${Date.now()}_${cleanFileName}`;
  }

  // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ: Генерация DataURL (миниатюры) на клиенте через Canvas
  function generateThumbnailDataUrl(file, maxWidth = 90, maxHeight = 90) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;

          // Логика ресайза
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
          // 0.7 - качество JPEG
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Уникальный ID документа в Firestore: ID_СТО + visitName
  function getFirestoreVisitDocId(visitName) {
    const currentServiceId = window.sName; // <-- Берем актуальный sName из глобальной области
    if (!currentServiceId) {
      console.error(
        "getFirestoreVisitDocId: SERVICE_ID (window.sName) не задан."
      );
      return null;
    }
    return `${currentServiceId}_${visitName}`;
  }

  // --- 4. Управление Сессией ---

  PM.resetSession = function () {
    PM.filesMap = {};
    PM.pendingFiles = [];
    PM.photoCount = 0;
    PM.visitDocRef = null;
    PM.visitName = null;
  };

  // --- 5. Основная инициализация (экспорт) ---

  window.initPhotoBlockForModal = async function (
    modalBodyEl,
    mode,
    visitName
  ) {
    PM.mode = mode || "new";
    PM.visitName = visitName || null;

    PM.resetSession();

    if (PM.mode === "edit" && PM.visitName) {
      const docId = getFirestoreVisitDocId(PM.visitName);
      if (docId) {
        PM.visitDocRef = db.collection("visits").doc(docId);
      }
    }
    await PM.renderPhotoBlock(modalBodyEl);
  };

  // --- 6. Рендеринг UI ---

  PM.renderPhotoBlock = async function (modalBodyEl) {
    // --- Инициализация UI (опущено для краткости, код как у вас) ---
    const prev = modalBodyEl.querySelector("#photoBlock");
    if (prev) prev.remove();
    const container = document.createElement("div");
    container.id = "photoBlock";
    container.className = "mb-3 p-2 border rounded bg-light";
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="form-label fw-bold mb-0">Фото визита</label>
        <small id="photoCount" class="text-muted">0</small>
      </div>
      <div style="margin-top:4px;">
        <div id="photoRow" style="display:flex; align-items:center; gap:8px; overflow-x:auto; white-space:nowrap; padding-bottom:6px;">
          <div id="addFotoBtn" title="Добавить фото" style="flex:0 0 auto; width:86px; height:86px; border:1px dashed rgba(0,0,0,0.12); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff;">
            <i class="bi bi-camera" style="font-size:28px; color:#0d6efd;"></i>
          </div>
        </div>
        <div id="photoInfo" style="font-size:12px;color:#666;margin-top:6px;">
           ${
             PM.mode === "new"
               ? "Фото будут загружены при создании заказа."
               : "Загрузка..."
           }
        </div>
      </div>
      <input type="file" id="photoInput_local" accept="image/*" multiple style="display:none">
    `;
    modalBodyEl.insertAdjacentElement("afterbegin", container);

    // Элементы
    const photoRow = container.querySelector("#photoRow");
    const addBtn = container.querySelector("#addFotoBtn");
    const info = container.querySelector("#photoInfo");
    const fileInput = container.querySelector("#photoInput_local");
    const photoCountEl = container.querySelector("#photoCount");

    addBtn.addEventListener("click", () => fileInput.click());

    function updateCountUI() {
      photoCountEl.textContent = String(PM.photoCount || 0);
    }
    function createThumbEl(localKey, name, url, isPending) {
      // ... (Код создания элемента миниатюры, как у вас)
      const t = document.createElement("div");
      t.className = "thumb";
      t.style.cssText =
        "width:86px; height:86px; border-radius:6px; overflow:hidden; position:relative; flex:0 0 auto; background:#f8f9fa; display:inline-flex; align-items:center; justify-content:center;";
      t.setAttribute("data-local-id", localKey);
      const img = document.createElement("img");
      img.src = url;
      img.style.cssText = "width:100%; height:100%; object-fit:cover;";
      const overlay = document.createElement("div");
      overlay.className = "thumb-overlay";
      overlay.style.cssText =
        "position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.6); font-size:10px; color:#000; font-weight:bold; display:none;";
      if (isPending) {
        overlay.textContent = "Ждет сохр.";
        overlay.style.display = "flex";
      }
      const del = document.createElement("button");
      del.className = "thumb-del";
      del.textContent = "✕";
      del.style.cssText =
        "position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); color:#fff; border:none; border-radius:4px; padding:0 5px; font-size:12px; cursor:pointer;";
      t.appendChild(img);
      t.appendChild(overlay);
      t.appendChild(del);
      return t;
    }
    // --- ЛОГИКА ОТОБРАЖЕНИЯ (NEW vs EDIT) ---

    if (PM.mode === "edit" && PM.visitName && PM.visitDocRef) {
      info.textContent = "Загрузка фото...";

      const lsKey = `thumbs_${PM.visitName}`;
      let localCached = JSON.parse(localStorage.getItem(lsKey) || "[]");

      try {
        const docSnap = await PM.visitDocRef.get();
        const firestorePhotos = docSnap.exists
          ? docSnap.data().photos || []
          : [];

        // 1. Создаем Set путей для быстрой проверки наличия в Firestore
        const firestoreRefs = new Set(firestorePhotos.map((p) => p.refPath));

        // 2. Очищаем LocalStorage от удаленных фото
        localCached = localCached.filter((item) =>
          firestoreRefs.has(item.refPath)
        );

        // 3. Создаем Map для быстрого доступа к DataURL
        const lsMap = new Map(
          localCached.map((item) => [item.refPath, item.thumbUrl])
        );

        // 4. Формируем финальный массив для отображения
        const photosToDisplay = [];

        firestorePhotos.forEach((photo) => {
          const displayUrl = lsMap.get(photo.refPath) || photo.fullUrl; // ГАРАНТИЯ: DataURL или fullUrl

          photosToDisplay.push({
            ...photo,
            thumbUrl: displayUrl,
            // Если нет в LS, сохраняем fullUrl, чтобы не грузить его снова как миниатюру
            // Это обновляет LS, если фото загружено другим пользователем
            isCacheUpdated: lsMap.has(photo.refPath),
          });
        });

        // 5. Очищаем UI и PM.filesMap, чтобы отрисовать актуальные данные
        PM.filesMap = {};
        PM.photoCount = 0;
        photoRow.querySelectorAll(".thumb").forEach((el) => el.remove());

        // 6. Отрисовываем и обновляем PM.filesMap
        const updatedLocalCache = [];

        photosToDisplay.forEach((item) => {
          const localKey = "srv_" + Math.random().toString(36).substr(2, 9);
          const thumbEl = createThumbEl(
            localKey,
            item.name,
            item.thumbUrl,
            false
          );
          photoRow.appendChild(thumbEl);

          PM.filesMap[localKey] = {
            name: item.name,
            state: "uploaded",
            thumbUrl: item.thumbUrl,
            fullUrl: item.fullUrl,
            refPath: item.refPath,
            element: thumbEl,
          };
          PM.photoCount++;

          // Собираем актуальный кэш для сохранения в LS
          updatedLocalCache.push({
            name: item.name,
            thumbUrl: item.thumbUrl,
            fullUrl: item.fullUrl,
            refPath: item.refPath,
          });
        });

        localStorage.setItem(lsKey, JSON.stringify(updatedLocalCache));

        if (PM.photoCount === 0) {
          info.textContent = "Фото нет.";
        } else {
          info.textContent = `Всего фото: ${PM.photoCount}`;
        }
      } catch (e) {
        console.error("Ошибка загрузки Firestore или кэша:", e);
        info.textContent = "Ошибка загрузки.";
      }
    }
    updateCountUI();

    // --- ОБРАБОТЧИК: Добавление файла (Input) ---
    fileInput.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      if (!sName) {
        console.error("ID сервиса отсутствует.");
        return;
      }

      const isEditMode = PM.mode === "edit" && PM.visitDocRef;
      info.textContent = isEditMode ? "Загрузка фото..." : "Новых фото...";

      for (const file of files) {
        const localKey =
          (isEditMode ? "upl_" : "pend_") +
          Date.now() +
          "_" +
          Math.floor(Math.random() * 1000);

        const thumbDataUrl = await generateThumbnailDataUrl(file);

        // Временно показываем
        const thumbEl = createThumbEl(localKey, file.name, thumbDataUrl, true);
        const ov = thumbEl.querySelector(".thumb-overlay");
        photoRow.appendChild(thumbEl);

        if (isEditMode) {
          // --- EDIT: Грузим сразу ---
          ov.textContent = "Загрузка...";
          ov.style.display = "flex";
          try {
            const fPath = fullPath(PM.visitName, file.name);
            if (!fPath) throw new Error("Нет пути (sName?)");

            const ref = storage.ref(fPath);
            await ref.put(file);
            const fullUrl = await ref.getDownloadURL();

            // 1. Обновление Firestore (без невалидного thumbUrl)
            const photoData = {
              name: file.name,
              fullUrl: fullUrl,
              refPath: fPath,
            };

            await PM.visitDocRef.update({
              photos: firebase.firestore.FieldValue.arrayUnion(photoData),
            });

            // 2. Обновляем LocalStorage кэш
            const lsKey = `thumbs_${PM.visitName}`;
            const currentLS = JSON.parse(localStorage.getItem(lsKey) || "[]");
            currentLS.push({
              ...photoData,
              thumbUrl: thumbDataUrl,
            }); // Сохраняем DataURL
            localStorage.setItem(lsKey, JSON.stringify(currentLS));

            // Успех UI
            ov.style.display = "none";
            PM.filesMap[localKey] = {
              ...photoData,
              thumbUrl: thumbDataUrl, // DataURL для текущей сессии
              state: "uploaded",
              element: thumbEl,
            };
            PM.photoCount++;
          } catch (err) {
            console.error(err);
            ov.textContent = "Ошибка";
            ov.style.background = "red";
          }
        } else {
          // --- NEW: Копим в pendingFiles ---
          PM.pendingFiles.push({
            key: localKey,
            file: file,
            dataUrl: thumbDataUrl,
          });
          PM.filesMap[localKey] = {
            name: file.name,
            state: "pending",
            thumbUrl: thumbDataUrl,
            fullUrl: thumbDataUrl, // Временно для галереи
            refPath: null,
            element: thumbEl,
          };
          PM.photoCount++;
        }
      }
      updateCountUI();
      if (PM.mode === "new") {
        info.textContent = `Новых фото: ${PM.photoCount}. Сохраните визит.`;
      } else {
        info.textContent = "Загрузка завершена.";
      }
      e.target.value = "";
    });

    // --- ДЕЛЕГИРОВАНИЕ: Удаление и Галерея (код оставлен без изменений) ---
    photoRow.addEventListener("click", async (ev) => {
      // ... (Ваша логика удаления и галереи)
      const delBtn = ev.target.closest(".thumb-del");
      if (delBtn) {
        const thumb = delBtn.closest(".thumb");
        const localId = thumb.getAttribute("data-local-id");
        const item = PM.filesMap[localId];
        if (item && confirm("Удалить фото?")) {
          if (item.state === "pending") {
            PM.pendingFiles = PM.pendingFiles.filter((p) => p.key !== localId);
          } else if (item.state === "uploaded" && PM.visitDocRef) {
            try {
              const doc = await PM.visitDocRef.get();
              const data = doc.data();
              const photos = data.photos || [];
              const updatedPhotos = photos.filter(
                (p) => p.refPath !== item.refPath
              );

              await PM.visitDocRef.update({ photos: updatedPhotos });

              await storage
                .ref(item.refPath)
                .delete()
                .catch((e) => console.warn("Файл storage уже удален?", e));

              const lsKey = `thumbs_${PM.visitName}`;
              const curLS = JSON.parse(localStorage.getItem(lsKey) || "[]");
              const newLS = curLS.filter((p) => p.refPath !== item.refPath);
              localStorage.setItem(lsKey, JSON.stringify(newLS));
            } catch (e) {
              console.error("Ошибка удаления:", e);
              return;
            }
          }
          delete PM.filesMap[localId];
          thumb.remove();
          PM.photoCount--;
          updateCountUI();
        }
        return;
      }

      const thumbEl = ev.target.closest(".thumb");
      if (thumbEl) {
        const localId = thumbEl.getAttribute("data-local-id");
        const item = PM.filesMap[localId];
        if (item) {
          const galleryItems = Object.values(PM.filesMap).map((p) => ({
            url: p.fullUrl,
            name: p.name,
          }));
          openFullScreenGallery(galleryItems, item.fullUrl);
        }
      }
    });
  };

  // --- 7. Функция ЗАГРУЗКИ ОТЛОЖЕННЫХ ФОТО (Вызывается из main.js) ---
  window.uploadPendingPhotosToVisit = async function (
    visitFolderName,
    clientPhone,
    clientName
  ) {
    if (!PM.pendingFiles || PM.pendingFiles.length === 0) {
      return;
    }

    // Новая проверка: получаем актуальный ID сервиса
    const currentServiceId = window.sName;
    if (!currentServiceId) {
      console.error(
        "uploadPendingPhotosToVisit: ID сервиса отсутствует. Невозможно создать документ Firestore."
      );
      return; // Завершаем выполнение, если нет ID
    }

    console.log("Начинаем загрузку фото для визита:", visitFolderName);

    const clientUniqueId =
      (clientPhone || "NoPhone") + "_" + (clientName || "NoName");

    const docId = getFirestoreVisitDocId(visitFolderName);

    if (!docId) {
      // Ошибка уже была залогирована в getFirestoreVisitDocId
      return;
    }

    const visitRef = db.collection("visits").doc(docId);

    const uploadedData = [];
    const lsCacheData = [];

    const promises = PM.pendingFiles.map(async (item) => {
      // ... (Ваш код загрузки в Storage)
      try {
        const file = item.file;
        // Используем currentServiceId, а не SERVICE_ID из глобальной области
        const fPath = fullPath(visitFolderName, file.name);
        if (!fPath) throw new Error("Нет пути (sName?)");

        const ref = storage.ref(fPath);
        await ref.put(file);
        // Получение URL (с дополнительным логированием)
        console.log(
          `[DEBUG] Загрузка файла ${file.name} завершена. Запрос URL...`
        );
        const fullUrl = await ref.getDownloadURL();
        console.log(`[DEBUG] URL получен: ${fullUrl}`); // <--- Смотрим, появляется ли это

        // 1. Объект для Firestore (без thumbUrl)
        const photoObj = {
          name: file.name,
          fullUrl: fullUrl,
          refPath: fPath,
        };

        uploadedData.push(photoObj);

        // 2. Для LocalStorage сохраняем DataURL миниатюры
        lsCacheData.push({
          ...photoObj,
          thumbUrl: item.dataUrl, // <-- DataURL для кэша
        });
      } catch (e) {
        console.error("Ошибка загрузки файла:", item.file.name, e);
        return;
      }
    });

    await Promise.all(promises);

    if (uploadedData.length > 0) {
      // 3. Обновляем/Создаем документ в Firestore
      try {
        console.log("[DEBUG] НАЧАЛО ЗАПИСИ FIRESTORE...");
        await visitRef.set(
          {
            visitName: visitFolderName,
            serviceId: currentServiceId, // <-- Используем актуальный ID сервиса
            clientId: clientUniqueId,
            clientPhone: clientPhone,
            photos: firebase.firestore.FieldValue.arrayUnion(...uploadedData),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        console.log("[DEBUG] ЗАПИСЬ FIRESTORE УСПЕШНО ЗАВЕРШЕНА.");
        // 4. Сохраняем миниатюры в LocalStorage клиента
        const lsKey = `thumbs_${visitFolderName}`;
        const oldLS = JSON.parse(localStorage.getItem(lsKey) || "[]");
        const newLS = [...oldLS, ...lsCacheData];
        localStorage.setItem(lsKey, JSON.stringify(newLS));
      } catch (dbError) {
        // Если код доходит сюда, это либо проблема с docId, либо с правами.
        console.error(
          "КРИТИЧЕСКАЯ ОШИБКА FIRESTORE: Не удалось записать документ. Вероятные причины: 1) Неверный ID документа (docId). 2) Недостаточные права доступа (Security Rules).",
          dbError
        );
        return;
      }
    }

    PM.pendingFiles = [];
    console.log("Загрузка фото завершена.");
  };

  // --- 8. Галерея (Full Screen) (код оставлен без изменений) ---
  function openFullScreenGallery(items, currentUrl) {
    // ... (Ваша логика галереи)
    const old = document.getElementById("fs-gallery");
    if (old) old.remove();
    let currentIndex = items.findIndex((i) => i.url === currentUrl);
    if (currentIndex === -1) currentIndex = 0;
    const overlay = document.createElement("div");
    overlay.id = "fs-gallery";
    overlay.style.cssText =
      "position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; user-select:none;";
    const imgContainer = document.createElement("div");
    imgContainer.style.cssText =
      "position:relative; width:100%; height:80%; display:flex; justify-content:center; align-items:center;";
    const imgEl = document.createElement("img");
    imgEl.style.cssText =
      "max-width:100%; max-height:100%; object-fit:contain;";
    imgEl.src = items[currentIndex].url;
    imgContainer.appendChild(imgEl);
    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText =
      "position:absolute; top:20px; right:20px; color:#fff; font-size:40px; cursor:pointer; z-index:10002;";
    closeBtn.onclick = () => overlay.remove();
    const counter = document.createElement("div");
    counter.style.cssText = "color:#ccc; margin-top:10px; font-size:14px;";
    const updateView = (idx) => {
      currentIndex = (idx + items.length) % items.length;
      imgEl.src = items[currentIndex].url;
      counter.textContent = `${currentIndex + 1} / ${items.length}`;
    };
    updateView(currentIndex);
    if (items.length > 1) {
      const createArrow = (dir) => {
        const btn = document.createElement("div");
        btn.innerHTML = dir === "prev" ? "&#10094;" : "&#10095;";
        btn.style.cssText = `position:absolute; top:50%; ${
          dir === "prev" ? "left:10px" : "right:10px"
        }; transform:translateY(-50%); color:#fff; font-size:40px; cursor:pointer; padding:10px; z-index:10001;`;
        btn.onclick = (e) => {
          e.stopPropagation();
          updateView(currentIndex + (dir === "prev" ? -1 : 1));
        };
        return btn;
      };
      overlay.appendChild(createArrow("prev"));
      overlay.appendChild(createArrow("next"));
    }
    overlay.appendChild(closeBtn);
    overlay.appendChild(imgContainer);
    overlay.appendChild(counter);
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", keyHandler);
      }
      if (e.key === "ArrowLeft") updateView(currentIndex - 1);
      if (e.key === "ArrowRight") updateView(currentIndex + 1);
    };
    document.addEventListener("keydown", keyHandler);
    document.body.appendChild(overlay);
  }
})();
