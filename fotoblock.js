// fotoblock.js — Версия с отложенной загрузкой и улучшенной галереей.
(function () {
  window._photoModule = window._photoModule || {};
  const PM = window._photoModule;

  // Инициализация глобальной переменной storage
  // (Предполагается, что window.storage = app.storage() уже выполнено в index.html)
  const storage = window.storage;

  if (typeof storage === "undefined") {
    console.error(
      "Firebase storage not found. Проверьте инициализацию в index.html."
    );
    return;
  }

  // --- Состояние модуля ---
  PM.mode = null; // 'new' | 'edit'
  PM.visitName = null;
  PM.filesMap = {}; // Хранит информацию о файлах (и загруженных, и ожидающих)
  PM.pendingFiles = []; // Массив File[] для отложенной загрузки
  PM.photoCount = 0;

  // --- Пути ---
  function visitPath(visitName) {
    return `visits/${visitName}`;
  }

  // --- Управление сессией ---
  PM.createSession = function () {
    // В режиме 'new' просто очищаем списки, sessionID больше не нужен для путей
    PM.filesMap = {};
    PM.pendingFiles = [];
    PM.photoCount = 0;
  };

  PM.resetSession = function () {
    PM.filesMap = {};
    PM.pendingFiles = [];
    PM.photoCount = 0;
  };

  // --- Основная инициализация (вызывается из modal) ---
  window.initPhotoBlockForModal = async function (
    modalBodyEl,
    mode,
    visitName
  ) {
    PM.mode = mode || "new";
    PM.visitName = visitName || null;

    // Если это новый заказ, сбрасываем состояние.
    // Если edit - сбрасываем только карту отображения, pendingFiles (если вдруг остались) можно очистить.
    if (PM.mode === "new") {
      PM.createSession();
    } else {
      PM.filesMap = {};
      PM.photoCount = 0;
      // Важно: в режиме edit pendingFiles обычно пуст, но на всякий случай обнуляем,
      // если мы не в процессе перехода от new к edit.
      // Но по вашей логике edit вызывается после успешного сохранения, значит старые pending уже загружены.
      PM.pendingFiles = [];
    }

    await PM.renderPhotoBlock(modalBodyEl, PM.mode, PM.visitName);
  };

  // --- Рендеринг UI ---
  PM.renderPhotoBlock = async function (modalBodyEl, mode, visitName) {
    // Удаляем старый блок если есть
    const prev = modalBodyEl.querySelector("#photoBlock");
    if (prev) prev.remove();

    // Создаем контейнер (дизайн сохранен)
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
             mode === "new"
               ? "Фото будут загружены при сохранении визита."
               : "Добавьте фото — загрузка начнётся автоматически."
           }
        </div>
      </div>
      <input type="file" id="photoInput_local" accept="image/*" multiple style="display:none">
    `;

    // Вставляем в начало modalBody
    modalBodyEl.insertAdjacentElement("afterbegin", container);

    const photoRow = container.querySelector("#photoRow");
    const addBtn = container.querySelector("#addFotoBtn");
    const info = container.querySelector("#photoInfo");
    const fileInput = container.querySelector("#photoInput_local");
    const photoCountEl = container.querySelector("#photoCount");

    // Обработчик клика по кнопке "Добавить"
    addBtn.addEventListener("click", () => fileInput.click());

    // Хелпер обновления счетчика
    function updateCountUI() {
      photoCountEl.textContent = String(PM.photoCount || 0);
    }

    // Хелпер создания HTML превью
    function createThumbEl(localKey, name, isPending) {
      const t = document.createElement("div");
      t.className = "thumb";
      t.style.width = "86px";
      t.style.height = "86px";
      t.style.borderRadius = "6px";
      t.style.overflow = "hidden";
      t.style.position = "relative";
      t.style.display = "inline-flex";
      t.style.alignItems = "center";
      t.style.justifyContent = "center";
      t.style.background = "#f8f9fa";
      t.style.flex = "0 0 auto";
      t.setAttribute("data-local-id", localKey);

      const img = document.createElement("img");
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.alt = name || "";

      // Оверлей для статуса (например, "Ожидание...")
      const overlay = document.createElement("div");
      overlay.className = "thumb-overlay";
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.background = "rgba(255,255,255,0.45)";
      overlay.style.fontSize = "11px";
      overlay.style.textAlign = "center";
      overlay.style.lineHeight = "1.2";
      overlay.style.color = "#333";
      overlay.style.fontWeight = "500";

      if (isPending) {
        overlay.textContent = "Ждет сохранения";
        overlay.style.display = "flex";
      } else {
        overlay.style.display = "none";
      }

      // Кнопка удаления
      const del = document.createElement("button");
      del.className = "thumb-del";
      del.type = "button";
      del.textContent = "✕";
      del.style.position = "absolute";
      del.style.top = "4px";
      del.style.right = "4px";
      del.style.background = "rgba(0,0,0,0.6)";
      del.style.color = "#fff";
      del.style.border = "none";
      del.style.borderRadius = "4px";
      del.style.padding = "0 5px";
      del.style.fontSize = "12px";
      del.style.cursor = "pointer";

      t.appendChild(img);
      t.appendChild(overlay);
      t.appendChild(del);
      return t;
    }

    // --- Обработка выбора файлов ---
    fileInput.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      if (PM.mode === "new") {
        // РЕЖИМ NEW: Только локальное превью, добавляем в pendingFiles
        files.forEach((file) => {
          const localKey =
            "pending_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

          // Добавляем в массив очереди
          PM.pendingFiles.push({ key: localKey, file: file });

          // Создаем локальный URL для показа
          const blobUrl = URL.createObjectURL(file);

          // Отображаем
          const thumbEl = createThumbEl(localKey, file.name, true);
          const img = thumbEl.querySelector("img");
          img.src = blobUrl;

          // Добавляем в UI
          photoRow.appendChild(thumbEl);

          // Регистрируем в карте (чтобы работала галерея и удаление)
          PM.filesMap[localKey] = {
            name: file.name,
            state: "pending",
            url: blobUrl, // Локальный blob для галереи
            refPath: null, // Еще нет на сервере
            element: thumbEl,
          };
          PM.photoCount++;
        });
        updateCountUI();
        info.textContent = `Добавлено фото: ${PM.photoCount}. Нажмите "Создать" для загрузки.`;
      } else {
        // РЕЖИМ EDIT: Сразу загружаем на сервер (старая логика для edit, но путь сразу в visit)
        if (!PM.visitName) {
          console.error("Edit mode without visitName!");
          return;
        }
        info.textContent = "Загрузка...";
        for (const file of files) {
          const localKey =
            "upl_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
          const thumbEl = createThumbEl(localKey, file.name, true);
          // Превью
          const img = thumbEl.querySelector("img");
          const blobUrl = URL.createObjectURL(file);
          img.src = blobUrl;

          photoRow.appendChild(thumbEl);

          // Показываем оверлей "Загрузка"
          const ov = thumbEl.querySelector(".thumb-overlay");
          ov.textContent = "Загрузка...";
          ov.style.display = "flex";

          // Загрузка
          try {
            const path = `${visitPath(
              PM.visitName
            )}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
            const ref = storage.ref(path);
            await ref.put(file);
            const url = await ref.getDownloadURL();

            // Успех
            ov.style.display = "none";
            img.src = url; // меняем blob на реальный url

            PM.filesMap[localKey] = {
              name: file.name,
              state: "uploaded",
              url: url,
              refPath: path,
              element: thumbEl,
            };
            PM.photoCount++;
          } catch (err) {
            console.error(err);
            ov.textContent = "Ошибка";
            ov.style.background = "rgba(255,0,0,0.5)";
            ov.style.color = "#fff";
          }
        }
        updateCountUI();
        info.textContent = "Загрузка завершена.";
      }
      e.target.value = ""; // сброс input
    });

    // --- Делегирование событий (Удаление и Галерея) ---
    photoRow.addEventListener("click", async (ev) => {
      // 1. Удаление
      const delBtn = ev.target.closest(".thumb-del");
      if (delBtn) {
        const thumb = delBtn.closest(".thumb");
        if (!thumb) return;
        const localId = thumb.getAttribute("data-local-id");
        const infoObj = PM.filesMap[localId];

        if (infoObj) {
          if (infoObj.state === "pending") {
            // Удаляем из массива pendingFiles
            PM.pendingFiles = PM.pendingFiles.filter(
              (item) => item.key !== localId
            );
            // Освобождаем память blob
            URL.revokeObjectURL(infoObj.url);
          } else if (infoObj.state === "uploaded" && infoObj.refPath) {
            // Удаляем с сервера
            if (confirm("Удалить фото с сервера?")) {
              try {
                await storage.ref(infoObj.refPath).delete();
              } catch (e) {
                console.error("Ошибка удаления", e);
                return; // Не удаляем из UI если ошибка
              }
            } else {
              return; // Отмена
            }
          }
          // Удаляем из UI и Map
          delete PM.filesMap[localId];
          thumb.remove();
          PM.photoCount = Math.max(0, PM.photoCount - 1);
          updateCountUI();
        }
        return;
      }

      // 2. Открытие галереи
      const thumbEl = ev.target.closest(".thumb");
      if (thumbEl) {
        // Собираем массив для галереи: смешанные (blob) и загруженные (http)
        const galleryItems = Object.values(PM.filesMap).map((p) => ({
          url: p.url,
          name: p.name,
        }));
        // Ищем индекс текущего фото по URL
        const currentUrl = thumbEl.querySelector("img").src;
        // blob ссылки могут отличаться строкой, поэтому ищем по вхождению или совпадению
        // Но проще передать URL
        openFullScreenGallery(galleryItems, currentUrl);
      }
    });

    // --- Загрузка существующих фото (режим EDIT) ---
    if (mode === "edit" && visitName) {
      info.textContent = "Загрузка превью...";
      try {
        const listRef = storage.ref(visitPath(visitName));
        const res = await listRef.listAll();
        if (!res.items || res.items.length === 0) {
          info.textContent = "Фото отсутствуют.";
        } else {
          for (const itemRef of res.items) {
            const url = await itemRef.getDownloadURL();
            const name = itemRef.name;
            const localKey =
              "srv_" +
              Date.now() +
              "_" +
              Math.random().toString(36).substr(2, 9);

            const thumbEl = createThumbEl(localKey, name, false);
            const img = thumbEl.querySelector("img");
            img.src = url;
            photoRow.appendChild(thumbEl);

            PM.filesMap[localKey] = {
              name: name,
              state: "uploaded",
              url: url,
              refPath: itemRef.fullPath,
              element: thumbEl,
            };
            PM.photoCount++;
          }
          updateCountUI();
          info.textContent = `${PM.photoCount} фото`;
        }
      } catch (err) {
        console.error("List error:", err);
        info.textContent = "Ошибка загрузки списка.";
      }
    }
  };

  // --- Функция финальной загрузки (Вместо finalizeSessionFolder) ---
  // Эту функцию нужно вызвать в main.js ПОСЛЕ получения ID визита
  window.uploadPendingPhotosToVisit = async function (newVisitFolderName) {
    if (!PM.pendingFiles || PM.pendingFiles.length === 0) {
      console.log("Нет фото для загрузки.");
      return;
    }

    // Здесь UI модального окна может быть уже уничтожен (addCheck делает clear),
    // поэтому мы не обновляем прогресс-бары внутри фотоблока,
    // а просто загружаем файлы асинхронно.

    // При желании можно показать глобальный лоадер.

    const promises = PM.pendingFiles.map(async (item) => {
      try {
        const file = item.file;
        // Путь сразу в папку визита
        const path = `${visitPath(
          newVisitFolderName
        )}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const ref = storage.ref(path);
        await ref.put(file);
        console.log(`Uploaded ${file.name} to ${path}`);
      } catch (e) {
        console.error("Ошибка отложенной загрузки", e);
      }
    });

    await Promise.all(promises);

    // Очищаем очередь, так как они загружены
    PM.pendingFiles = [];
    console.log("Все отложенные фото загружены.");
  };

  // --- Улучшенная Галерея (Full Screen Overlay) ---
  function openFullScreenGallery(items, currentUrl) {
    // Удаляем старую если есть
    const old = document.getElementById("fs-gallery");
    if (old) old.remove();

    let currentIndex = items.findIndex((i) => i.url === currentUrl);
    if (currentIndex === -1) currentIndex = 0;

    const overlay = document.createElement("div");
    overlay.id = "fs-gallery";
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.95);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      user-select: none;
  `;

    // Контейнер картинки
    const imgContainer = document.createElement("div");
    imgContainer.style.cssText =
      "position: relative; width: 100%; height: 80%; display: flex; justify-content: center; align-items: center;";

    const imgEl = document.createElement("img");
    imgEl.style.cssText =
      "max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.2s;";
    imgEl.src = items[currentIndex].url;

    imgContainer.appendChild(imgEl);

    // Кнопка закрытия
    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText =
      "position: absolute; top: 20px; right: 20px; color: #fff; font-size: 40px; cursor: pointer; z-index: 10002;";
    closeBtn.onclick = () => {
      document.body.removeChild(overlay);
    };

    // Обновление изображения и счетчика
    const updateImage = (newIndex) => {
      currentIndex = (newIndex + items.length) % items.length;
      imgEl.src = items[currentIndex].url;
      updateCounter();
    };

    // Навигация (стрелки)
    const createArrow = (dir) => {
      const btn = document.createElement("div");
      btn.innerHTML = dir === "prev" ? "&#10094;" : "&#10095;";
      btn.className = `gallery-arrow gallery-arrow-${dir}`;
      btn.style.cssText = `
          position: absolute; top: 50%; transform: translateY(-50%);
          ${dir === "prev" ? "left: 10px;" : "right: 10px;"}
          color: #fff; font-size: 40px; cursor: pointer; padding: 10px 15px;
          background: rgba(0,0,0,0.5); border-radius: 4px; z-index: 10001;
          transition: background 0.2s;
      `;
      btn.onmouseover = () => (btn.style.background = "rgba(0,0,0,0.8)");
      btn.onmouseout = () => (btn.style.background = "rgba(0,0,0,0.5)");

      btn.onclick = (e) => {
        e.stopPropagation(); // Важно: предотвращает закрытие оверлея по клику
        if (dir === "prev") {
          updateImage(currentIndex - 1);
        } else {
          updateImage(currentIndex + 1);
        }
      };
      return btn;
    };

    // Счетчик
    const counter = document.createElement("div");
    counter.style.cssText = "color: #ccc; margin-top: 10px; font-size: 14px;";
    const updateCounter = () =>
      (counter.textContent = `${currentIndex + 1} / ${items.length}`);

    if (items.length > 1) {
      overlay.appendChild(createArrow("prev"));
      overlay.appendChild(createArrow("next"));
    }

    overlay.appendChild(closeBtn);
    overlay.appendChild(imgContainer);
    overlay.appendChild(counter);

    // --- Логика Свайпа (для мобильных) ---
    let touchstartX = 0;
    let touchendX = 0;

    const checkDirection = () => {
      // Свайп влево (переход к следующему фото)
      if (touchendX < touchstartX - 50) {
        updateImage(currentIndex + 1);
      }
      // Свайп вправо (переход к предыдущему фото)
      if (touchendX > touchstartX + 50) {
        updateImage(currentIndex - 1);
      }
    };

    imgContainer.addEventListener("touchstart", (e) => {
      touchstartX = e.changedTouches[0].screenX;
    });

    imgContainer.addEventListener("touchend", (e) => {
      touchendX = e.changedTouches[0].screenX;
      checkDirection();
    });

    // --- Логика клавиатуры (для стационарных) ---
    const keyHandler = function (e) {
      if (!document.getElementById("fs-gallery")) {
        document.removeEventListener("keydown", keyHandler);
        return;
      }
      if (e.key === "Escape") overlay.remove();
      if (e.key === "ArrowLeft") updateImage(currentIndex - 1);
      if (e.key === "ArrowRight") updateImage(currentIndex + 1);
    };

    document.addEventListener("keydown", keyHandler);

    // Обновление счетчика при инициализации
    updateCounter();
    document.body.appendChild(overlay);
  }
})();
