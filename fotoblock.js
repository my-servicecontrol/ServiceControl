// client.js — фото-блок с интерфейсом на клиенте и input в глобальном iframe
// const UPLOADER_IFRAME_URL = "";

(function () {
  window._photoModule = window._photoModule || {};
  const PM = window._photoModule;

  // -------------------------
  // State
  // -------------------------
  PM.iframe = document.getElementById("uploaderFrame"); // глобальный iframe должен быть в body
  PM.ready = false;
  PM.queue = [];
  PM.sessionId = null;
  PM.mode = null;
  PM.visitName = null;
  PM.filesMap = {}; // localId -> { name, state, fileId, element }

  // -------------------------
  // IFRAME messaging
  // -------------------------
  PM.ensureIframe = function () {
    if (!PM.iframe) return null;

    window.addEventListener("message", (ev) => {
      const d = ev.data;
      if (!d || typeof d !== "object") return;
      switch (d.type) {
        case "ready":
          PM.ready = true;
          PM.flushQueue();
          break;
        case "uploaded":
          PM.onUploaded(d);
          break;
        case "finalized":
          PM.onFinalized(d);
          break;
        case "deleted":
          PM.onDeleted(d);
          break;
        case "error":
          console.error("Uploader error:", d.message || d);
          break;
      }
    });

    // ping to encourage ready
    setTimeout(() => PM.post({ type: "ping" }), 700);
    return PM.iframe;
  };

  PM.post = function (msg) {
    if (PM.ready && PM.iframe && PM.iframe.contentWindow) {
      PM.iframe.contentWindow.postMessage(msg, "*");
    } else {
      PM.queue.push(msg);
    }
  };

  PM.flushQueue = function () {
    while (PM.queue.length) {
      const m = PM.queue.shift();
      if (PM.iframe && PM.iframe.contentWindow) {
        PM.iframe.contentWindow.postMessage(m, "*");
      } else {
        PM.queue.unshift(m);
        break;
      }
    }
  };

  // -------------------------
  // Session
  // -------------------------
  PM.createSession = function () {
    PM.sessionId = "s" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    PM.filesMap = {};
    return PM.sessionId;
  };

  PM.resetSession = function () {
    PM.sessionId = null;
    PM.filesMap = {};
  };

  // -------------------------
  // Public: init photo block in modal
  // -------------------------
  window.initPhotoBlockForModal = function (modalBodyEl, mode, visitName) {
    PM.ensureIframe();
    PM.mode = mode || "new";
    PM.visitName = visitName || null;
    PM.createSession();
    PM.renderPhotoBlock(modalBodyEl, PM.mode, PM.visitName);
  };

  // -------------------------
  // Render interface
  // -------------------------
  PM.renderPhotoBlock = function (modalBodyEl, mode, visitName) {
    const prev = modalBodyEl.querySelector("#photoBlock");
    if (prev) prev.remove();

    const container = document.createElement("div");
    container.id = "photoBlock";
    container.className = "mb-3 p-2 border rounded bg-light";
    container.innerHTML = `
         <div style="margin-top:8px;">
        <div id="photoRow" style="display:flex; gap:8px; overflow-x:auto; white-space:nowrap; padding-bottom:6px;">
          <div id="addFotoBtn" title="Добавить фото" style="flex:0 0 auto; width:86px; height:86px; border:1px dashed rgba(0,0,0,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff;">
            <i class="bi bi-camera" style="font-size:28px; color:#0d6efd;"></i>
          </div>
        </div>
        <div id="photoInfo" style="font-size:12px;color:#666;margin-top:6px;">Добавьте фото — загрузка начнётся автоматически.</div>
      </div>
    `;
    modalBodyEl.insertAdjacentElement("afterbegin", container);

    const photoRow = container.querySelector("#photoRow");
    const addFotoBtn = container.querySelector("#addFotoBtn");
    const info = container.querySelector("#photoInfo");

    addFotoBtn.addEventListener("click", () => {
      // при клике делегируем событие глобальному input в iframe
      if (PM.iframe && PM.iframe.contentWindow) {
        PM.iframe.contentWindow.postMessage({ type: "triggerInput" }, "*");
      }
    });

    // Функция для добавления превью на клиенте
    PM.addThumb = function (localId, name, url) {
      const thumbEl = PM.createThumb(localId, name);
      const img = thumbEl.querySelector("img");
      img.src = url;
      photoRow.appendChild(thumbEl);
      PM.filesMap[localId] = { name, state: "pending", element: thumbEl };
      PM.showUploadingOverlay(thumbEl);
      return thumbEl;
    };

    // delete handler
    photoRow.addEventListener("click", function (ev) {
      const btn = ev.target.closest(".thumb-del");
      if (!btn) return;
      const thumb = btn.closest(".thumb");
      if (!thumb) return;
      const fileId = thumb.getAttribute("data-file-id");
      const localId = thumb.getAttribute("data-local-id");
      if (fileId) {
        PM.post({ type: "deleteFile", fileId });
      } else if (localId) {
        delete PM.filesMap[localId];
        thumb.remove();
      }
    });

    // edit mode: load previews via google.script.run
    if (mode === "edit" && visitName) {
      if (window.google && google.script && google.script.run) {
        info.textContent = "Загрузка превью...";
        google.script.run
          .withSuccessHandler((res) => {
            if (!res || !res.length) {
              info.textContent = "Фото отсутствуют.";
              return;
            }
            res.forEach((f) => {
              const id = "sv_" + f.id;
              const el = PM.createThumb(id, f.name);
              el.setAttribute("data-file-id", f.id);
              el.querySelector("img").src = f.thumb || f.url;
              el.querySelector(".thumb-overlay").style.display = "none";
              photoRow.appendChild(el);
              PM.filesMap[id] = {
                name: f.name,
                state: "uploaded",
                fileId: f.id,
                element: el,
              };
            });
            info.textContent = res.length + " фото";
          })
          .getVisitPhotos(visitName, 5);
      }
    }
  };

  // -------------------------
  // Thumb helpers (как раньше)
  // -------------------------
  PM.createThumb = function (localId, name) {
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
    t.setAttribute("data-local-id", localId);

    const img = document.createElement("img");
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.alt = name;

    const overlay = document.createElement("div");
    overlay.className = "thumb-overlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(255,255,255,0.45)";
    overlay.style.fontSize = "14px";
    overlay.textContent = "...";

    const del = document.createElement("button");
    del.className = "thumb-del";
    del.textContent = "✕";
    del.style.position = "absolute";
    del.style.top = "4px";
    del.style.right = "4px";
    del.style.background = "rgba(0,0,0,0.6)";
    del.style.color = "#fff";
    del.style.border = "none";
    del.style.borderRadius = "4px";
    del.style.padding = "2px 6px";
    del.style.cursor = "pointer";

    t.appendChild(img);
    t.appendChild(overlay);
    t.appendChild(del);
    return t;
  };

  PM.showUploadingOverlay = function (thumbEl) {
    const ov = thumbEl.querySelector(".thumb-overlay");
    if (!ov) return;
    ov.style.display = "flex";
    ov.textContent = "Загружается…";
  };

  PM.setThumbUploaded = function (thumbEl, fileId, url, thumbUrl) {
    thumbEl.setAttribute("data-file-id", fileId);
    const ov = thumbEl.querySelector(".thumb-overlay");
    if (ov) ov.style.display = "none";
    const img = thumbEl.querySelector("img");
    if (thumbUrl) img.src = thumbUrl;
    const localId = thumbEl.getAttribute("data-local-id");
    if (localId && PM.filesMap[localId]) {
      PM.filesMap[localId].state = "uploaded";
      PM.filesMap[localId].fileId = fileId;
    }
  };

  PM.setThumbError = function (thumbEl, msg) {
    const ov = thumbEl.querySelector(".thumb-overlay");
    if (ov) {
      ov.style.display = "flex";
      ov.textContent = msg;
    }
  };

  // -------------------------
  // Message handlers from iframe
  // -------------------------
  PM.onUploaded = function (d) {
    if (!d || !d.sessionId || !Array.isArray(d.data)) return;
    d.data.forEach((f) => {
      // ищем локальный по имени
      let found = null;
      for (const lid in PM.filesMap) {
        const ent = PM.filesMap[lid];
        if (ent && ent.name === f.name && ent.state === "pending") {
          found = { lid, ent };
          break;
        }
      }
      if (found) {
        const el = found.ent.element;
        PM.setThumbUploaded(el, f.id, f.url, f.thumb);
      }
    });
  };

  PM.onDeleted = function (d) {
    if (!d || !d.fileId) return;
    const el = document.querySelector('[data-file-id="' + d.fileId + '"]');
    if (el) el.remove();
    for (const k in PM.filesMap) {
      if (PM.filesMap[k] && PM.filesMap[k].fileId === d.fileId)
        delete PM.filesMap[k];
    }
  };

  PM.onFinalized = function (d) {
    // optional
  };

  // -------------------------
  // Public finalize
  // -------------------------
  window.finalizeSessionFolder = function (newFolderName) {
    if (!PM.sessionId) {
      console.warn("sessionId missing");
      return;
    }
    PM.post({
      type: "finalize",
      sessionId: PM.sessionId,
      newName: newFolderName,
    });
  };
})();
