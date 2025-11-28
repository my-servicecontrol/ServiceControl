// fotoblock.js — Firebase (compat) version, no imports required.
// Assumes global `firebase` and `storage` are already available (compat SDK).
(function () {
  window._photoModule = window._photoModule || {};
  const PM = window._photoModule;

  // Safety: ensure storage exists
  if (typeof storage === "undefined") {
    console.error(
      "Firebase storage not found. Make sure firebase and storage are initialized in index.html."
    );
  }

  // State
  PM.sessionId = null;
  PM.mode = null; // 'new' | 'edit'
  PM.visitName = null; // when edit
  PM.filesMap = {}; // key -> { name, state, url, refPath, element }
  PM.photoCount = 0;

  // Helpers: paths
  function sessionPath(sessionId) {
    return `sessions/${sessionId}`;
  }
  function visitPath(visitName) {
    return `visits/${visitName}`;
  }

  // Create new session
  PM.createSession = function () {
    PM.sessionId = "s" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    PM.filesMap = {};
    PM.photoCount = 0;
    return PM.sessionId;
  };

  PM.resetSession = function () {
    PM.sessionId = null;
    PM.filesMap = {};
    PM.photoCount = 0;
  };

  // Public: init photo block for a modal
  // modalBodyEl: element (.modal-body), mode: 'new'|'edit', visitName: string|null
  window.initPhotoBlockForModal = async function (
    modalBodyEl,
    mode,
    visitName
  ) {
    PM.mode = mode || "new";
    PM.visitName = visitName || null;
    PM.createSession();
    await PM.renderPhotoBlock(modalBodyEl, PM.mode, PM.visitName);
  };

  // Render the UI photo block
  PM.renderPhotoBlock = async function (modalBodyEl, mode, visitName) {
    // remove existing
    const prev = modalBodyEl.querySelector("#photoBlock");
    if (prev) prev.remove();

    // build container (keeps look from previous iterations)
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
        <div id="photoInfo" style="font-size:12px;color:#666;margin-top:6px;">Добавьте фото — загрузка начнётся автоматически.</div>
      </div>
      <input type="file" id="photoInput_local" accept="image/*" multiple style="display:none">
    `;
    modalBodyEl.insertAdjacentElement("afterbegin", container);

    // elements
    const photoRow = container.querySelector("#photoRow");
    const addBtn = container.querySelector("#addFotoBtn");
    const info = container.querySelector("#photoInfo");
    const fileInput = container.querySelector("#photoInput_local");
    const photoCountEl = container.querySelector("#photoCount");

    // add button -> file input
    addBtn.addEventListener("click", () => fileInput.click());

    // update counter helper
    function updateCountUI() {
      photoCountEl.textContent = String(PM.photoCount || 0);
    }

    // create thumb UI element
    function createThumbEl(localKey, name) {
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

      const overlay = document.createElement("div");
      overlay.className = "thumb-overlay";
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.background = "rgba(255,255,255,0.45)";
      overlay.style.fontSize = "13px";
      overlay.textContent = "...";

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
      del.style.padding = "2px 6px";
      del.style.cursor = "pointer";

      t.appendChild(img);
      t.appendChild(overlay);
      t.appendChild(del);
      return t;
    }

    // show uploading overlay
    function showUploading(thumbEl, text = "Загружается…") {
      const ov = thumbEl.querySelector(".thumb-overlay");
      if (ov) {
        ov.style.display = "flex";
        ov.textContent = text;
      }
    }
    function hideOverlay(thumbEl) {
      const ov = thumbEl.querySelector(".thumb-overlay");
      if (ov) ov.style.display = "none";
    }
    function setThumbError(thumbEl, text) {
      const ov = thumbEl.querySelector(".thumb-overlay");
      if (ov) {
        ov.style.display = "flex";
        ov.textContent = text;
      }
    }

    // upload single File object to Firebase Storage under sessions/{sessionId}/filename
    async function uploadFileToSession(file, localKey, thumbEl) {
      try {
        const path = `${sessionPath(
          PM.sessionId
        )}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const ref = storage.ref(path);
        const uploadTaskSnapshot = await ref.put(file);
        const url = await uploadTaskSnapshot.ref.getDownloadURL();

        // register in filesMap
        PM.filesMap[localKey] = {
          name: file.name,
          state: "uploaded",
          url: url,
          refPath: path,
          element: thumbEl,
        };

        hideOverlay(thumbEl);
        // set thumbnail to the uploaded URL (best-effort)
        const img = thumbEl.querySelector("img");
        if (img && url) img.src = url;

        PM.photoCount++;
        updateCountUI();

        // ensure info text updated
        info.textContent = "Загрузка завершена.";
      } catch (err) {
        console.error("Upload error:", err);
        setThumbError(thumbEl, "Ошибка");
      }
    }

    // handle file input change -> auto upload
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      info.textContent = "Загрузка...";
      files.forEach((file) => {
        const localKey =
          "lf_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
        const thumbEl = createThumbEl(localKey, file.name);
        photoRow.appendChild(thumbEl);

        // quick preview
        const img = thumbEl.querySelector("img");
        const url = URL.createObjectURL(file);
        img.src = url;
        img.onload = () => URL.revokeObjectURL(url);

        showUploading(thumbEl, "Загрузка…");
        // start upload (no concurrency restriction)
        uploadFileToSession(file, localKey, thumbEl);
      });
      e.target.value = "";
    });

    // delegated delete & gallery open
    photoRow.addEventListener("click", async (ev) => {
      const delBtn = ev.target.closest(".thumb-del");
      if (delBtn) {
        const thumb = delBtn.closest(".thumb");
        if (!thumb) return;
        const localId = thumb.getAttribute("data-local-id");
        const infoObj = PM.filesMap[localId];
        if (infoObj && infoObj.refPath) {
          // delete from storage
          try {
            const ref = storage.ref(infoObj.refPath);
            await ref.delete();
            // remove UI + map
            delete PM.filesMap[localId];
            thumb.remove();
            PM.photoCount = Math.max(0, PM.photoCount - 1);
            updateCountUI();
          } catch (err) {
            console.error("Delete error:", err);
            setThumbError(thumb, "Ошибка удаления");
          }
        } else {
          // still pending or unknown - just remove
          delete PM.filesMap[localId];
          thumb.remove();
        }
        return;
      }

      // click on thumb -> open gallery modal
      const thumbEl = ev.target.closest(".thumb");
      if (thumbEl) {
        openGalleryModal(
          Object.values(PM.filesMap).map((p) => ({ url: p.url, name: p.name }))
        );
      }
    });

    // If edit mode and visitName provided -> load previously uploaded files
    if (mode === "edit" && visitName) {
      info.textContent = "Загрузка превью...";
      try {
        const listRef = storage.ref(visitPath(visitName));
        const res = await listRef.listAll();
        if (!res.items || res.items.length === 0) {
          info.textContent = "Фото отсутствуют.";
        } else {
          // iterate and add thumbs
          for (const itemRef of res.items) {
            const url = await itemRef.getDownloadURL();
            const name = itemRef.name;
            const localKey =
              "sv_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
            const thumbEl = createThumbEl(localKey, name);
            photoRow.appendChild(thumbEl);
            const img = thumbEl.querySelector("img");
            img.src = url;
            hideOverlay(thumbEl);
            PM.filesMap[localKey] = {
              name: name,
              state: "uploaded",
              url: url,
              refPath: `${visitPath(visitName)}/${name}`,
              element: thumbEl,
            };
            PM.photoCount++;
          }
          updateCountUI();
          info.textContent = `${PM.photoCount} фото`;
        }
      } catch (err) {
        console.error("List existing photos error:", err);
        info.textContent = "Не удалось загрузить превью.";
      }
    }

    // Gallery modal helper
    function openGalleryModal(items) {
      // remove existing
      const existing = document.getElementById("photoGalleryModal");
      if (existing) existing.remove();

      const modal = document.createElement("div");
      modal.className = "modal fade";
      modal.id = "photoGalleryModal";
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Галерея</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="galleryGrid" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const grid = modal.querySelector("#galleryGrid");
      items.forEach((it) => {
        const card = document.createElement("div");
        card.style.width = "320px";
        card.style.height = "200px";
        card.style.overflow = "hidden";
        card.style.borderRadius = "6px";
        card.style.boxShadow = "0 1px 6px rgba(0,0,0,0.08)";
        card.innerHTML = `<img src="${it.url}" style="width:100%;height:100%;object-fit:cover;cursor:zoom-in" alt="${it.name}">`;
        card.querySelector("img").addEventListener("click", () => {
          window.open(it.url, "_blank");
        });
        grid.appendChild(card);
      });

      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  }; // renderPhotoBlock

  // Finalize session: copy files from sessions/{sessionId} -> visits/{newFolderName}/{filename}
  // copying via fetching downloadURL bytes and re-uploading; then delete original.
  window.finalizeSessionFolder = async function (newFolderName) {
    if (!PM.sessionId) {
      console.warn("sessionId missing");
      return;
    }
    const entries = Object.values(PM.filesMap).filter(
      (x) => x.refPath && x.refPath.startsWith(sessionPath(PM.sessionId))
    );
    if (!entries.length) {
      // nothing to do — still reset session
      PM.resetSession();
      return;
    }

    // perform copy for each file
    for (const ent of entries) {
      try {
        // get download url (if missing, try from ent.url)
        let url = ent.url;
        if (!url) {
          const refOld = storage.ref(ent.refPath);
          url = await refOld.getDownloadURL();
        }
        // fetch bytes
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        const blob = new Blob([buf]);

        // upload to new location
        const newPath = `${visitPath(newFolderName)}/${ent.name}`;
        const newRef = storage.ref(newPath);
        await newRef.put(blob);

        // delete old
        const oldRef = storage.ref(ent.refPath);
        await oldRef.delete().catch((e) => {
          console.warn("Cannot delete old:", e);
        });

        // update map entry (not strictly necessary)
        ent.refPath = newPath;
        ent.url = await newRef.getDownloadURL();
      } catch (err) {
        console.error("finalize error for", ent, err);
      }
    }

    // reset session so next newOrder gets fresh session
    PM.resetSession();
    console.log("Session finalized ->", newFolderName);
  };

  // debug helper
  PM._debug = function () {
    return {
      sessionId: PM.sessionId,
      count: PM.photoCount,
      map: PM.filesMap,
    };
  };
})();
