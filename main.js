//var wlink = window.location.search.replace("?", "");
var allLang = ["ua", "ru", "en", "de", "es"];
// язык из hash
var hashLang = window.location.hash.substr(1);
var myApp =
  "https://script.google.com/macros/s/AKfycbwAO4BEyCyk86EzScIsUHLzF-xtnZlPrFk2jJpp8K05pSeW-fsQNvblhjLvl2P17u54/exec";
var sName = "";
var tasks = "";
var price = "";
var logo = "";
var sContact = "";
var address = "";
var vfolder = "";
var rfolder = "";
var role = "";
var dataMarkup = "";
var dataPayrate = "";
var vat = "";
var recvisit = "";
var activated = "";
var userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var calendL = "";
const phoneRules = {
  UA: { code: "380", length: 9 },
  DE: { code: "49", length: 10 },
  ES: { code: "34", length: 9 },
  US: { code: "1", length: 10 },
};
const userLocale = navigator.language || "en-US";
const userRegion = new Intl.Locale(userLocale).region; // UA, DE, US, ES ...
const userPhoneRule = phoneRules[userRegion];

document.addEventListener("DOMContentLoaded", () => {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (el) {
    return new bootstrap.Tooltip(el);
  });
  const LOCAL_STORAGE_KEY = "app_version";

  // 👤 Инициализация интерфейса
  const name = localStorage.getItem("user_name");
  const userData = localStorage.getItem("user_data");
  changeLanguage(hashLang);

  if (userData) {
    document.getElementById("welcomeMessage").innerText = name;
    document.getElementById("planeButton").classList.add("d-none");
    document.getElementById("logoutButton").style.display = "block";
    try {
      const parsedUserData = JSON.parse(userData);
      getUserData(parsedUserData);
    } catch (e) {
      console.error("Ошибка при разборе сохраненных данных:", e);
    }
  } else {
    document.getElementById("landing").classList.remove("d-none");
    document.getElementById("workspace").classList.add("d-none");
    initLanding();
  }

  const switchTabs = document.querySelectorAll("#switch-tabs .nav-link");
  const visits = document.getElementById("visitsTabs");
  const warehouse = document.getElementById("analyticsTabs");

  switchTabs.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      myFunction(true);
      // снимаем active у всех
      switchTabs.forEach((l) => l.classList.remove("active"));

      // активируем выбранную
      link.classList.add("active");

      // показываем соответствующий блок
      if (link.dataset.target === "visitsTabs") {
        visits.style.display = "block";
        warehouse.style.display = "none";
      } else {
        visits.style.display = "none";
        warehouse.style.display = "block";
      }
    });
  });

  // Проверка версии приложения — сразу + каждые 5 минут
  const checkVersion = async () => {
    try {
      const res = await fetch("/version.json", { cache: "no-store" });
      const data = await res.json();
      const serverVersion = data.version;
      const localVersion = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!localVersion) {
        localStorage.setItem(LOCAL_STORAGE_KEY, serverVersion);
      } else if (localVersion !== serverVersion) {
        // получаем номер правки (последнее число после дефиса)
        const serverRevision =
          parseInt(serverVersion.split("-").pop(), 10) || 0;

        if (serverRevision > 4) {
          // удаляем данные пользователя
          localStorage.removeItem("user_data");
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          location.reload(true);
        } else {
          // просто обновляем сохранённую версию
          localStorage.setItem(LOCAL_STORAGE_KEY, serverVersion);
        }
        // перезагружаем страницу
        location.reload(true);
      }
    } catch (e) {
      console.error("Ошибка при проверке версии:", e);
    }
  };
  checkVersion();
  setInterval(checkVersion, 5 * 60 * 1000);
});

// -------------------
// Инициализация лендинга
function initLanding() {
  const visits = [
    {
      sto: "Boss CarWash",
      order: "#90231",
      car: "BMW X5",
      service: "Детейлинг салону",
      ago: "1 хв тому",
      href: "#",
    },
    {
      sto: "Fast Service",
      order: "#90230",
      car: "Audi A4",
      service: "Шиномонтаж",
      ago: "4 хв тому",
      href: "#",
    },
    {
      sto: "Detail Pro",
      order: "#90229",
      car: "Tesla Model 3",
      service: "Полірування кузова",
      ago: "7 хв тому",
      href: "#",
    },
    {
      sto: "СТО «Vector»",
      order: "#90228",
      car: "VW Tiguan",
      service: "Диагностика",
      ago: "9 хв тому",
      href: "#",
    },
    {
      sto: "Garage+",
      order: "#90227",
      car: "Toyota RAV4",
      service: "Заміна масла",
      ago: "12 хв тому",
      href: "#",
    },
  ];

  const services = [
    { name: "Комплексне миття", count: "1 245 візитів", href: "#" },
    { name: "Шиномонтаж + баланс", count: "1 018 візитів", href: "#" },
    { name: "Заміна масла", count: "842 візити", href: "#" },
    { name: "Полірування кузова", count: "560 візитів", href: "#" },
    { name: "Хімчистка салону", count: "509 візитів", href: "#" },
  ];

  const visitsFeed = document.getElementById("visitsFeed");
  const servicesFeed = document.getElementById("servicesFeed");

  if (visitsFeed) {
    visitsFeed.innerHTML = "";
    visits.slice(0, 5).forEach((v) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-start";
      li.innerHTML = `
        <div>
          <div class="fw-semibold">${v.sto} • Візит ${v.order}</div>
          <div class="small muted">${v.car} • ${v.service} • ${v.ago}</div>
        </div>
        <div class="actions d-flex gap-2">
          <a href="${v.href}" class="btn btn-sm btn-outline-secondary">Відкрити</a>
          <button class="btn btn-sm btn-outline-primary">Підписатися на СТО</button>
        </div>`;
      visitsFeed.appendChild(li);
    });
  }

  if (servicesFeed) {
    servicesFeed.innerHTML = "";
    services.slice(0, 5).forEach((s) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-start";
      li.innerHTML = `
        <div>
          <div class="fw-semibold">${s.name}</div>
          <div class="small muted">${s.count} за 30 дней</div>
        </div>
        <div class="actions d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary">Показати точки</button>
          <button class="btn btn-sm btn-outline-success" aria-pressed="false">❤ Like</button>
        </div>`;
      servicesFeed.appendChild(li);
    });
  }

  // Обработчики кнопок подписки (заглушки)
  const btnVisits = document.getElementById("btnSubscribeVisits");
  if (btnVisits) {
    btnVisits.addEventListener("click", () => {
      const sto = document.getElementById("filterSto").value.trim();
      alert(
        sto
          ? `Підписатись на візити СТО: ${sto}`
          : "Вкажіть СТО, щоб підписатися"
      );
    });
  }

  const btnServices = document.getElementById("btnSubscribeServices");
  if (btnServices) {
    btnServices.addEventListener("click", () => {
      const srv = document.getElementById("filterService").value.trim();
      alert(srv ? `Підписатися на послугу: ${srv}` : "Вкажіть послугу");
    });
  }
}
// соответствие вкладки и статусов
const tabStatusMap = {
  "nav-home-tab": ["в роботі"],
  "nav-done-tab": ["виконано"],
  "nav-delete-tab": ["в архів"],
  "calTable-tab": [], // для "Запис" статусы не нужны
  "nav-purchases-tab": ["чернетка", "надходження"], // Новая вкладка
  "nav-invoice-tab": ["factura"],
};

var uStatus = [];

const allTriggerTabs = document.querySelectorAll(
  ".tab-scroll-container button"
);

allTriggerTabs.forEach((triggerEl) => {
  triggerEl.addEventListener("click", (event) => {
    if (!triggerEl.classList.contains("nav-link")) return;
    myFunction(true);

    if (triggerEl.closest("#nav-tab")) {
      uStatus = tabStatusMap[triggerEl.id] || [];
      // Индикатор загрузки
      const tbody = document.querySelector("#myTable tbody");
      if (tbody) {
        tbody.innerHTML = `<span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>`;
      }
      loadTasks();
    }
  });
});

// дефолтный статус при загрузке
uStatus = tabStatusMap["nav-home-tab"];

var data;
setInterval(loadTasks, 10000);

async function loadTasks() {
  if (document.activeElement?.tagName === "INPUT") return;

  const filter = document.getElementById("myInput")?.value.trim();
  if (filter) return;

  try {
    await googleQuery(tasks, "0", "D:AQ", "SELECT *");
  } catch (err) {
    console.error(err);
  }
}

function googleQuery(sheet_id, sheet, range, query) {
  return new Promise((resolve, reject) => {
    google.charts.load("45", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(queryTable);

    function queryTable() {
      var opts = { sendMethod: "auto" };
      var gquery = new google.visualization.Query(
        `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?gid=${sheet}&range=${range}&headers=1&tq=${query}`,
        opts
      );
      gquery.send((e) => {
        if (e.isError()) {
          console.log(
            `Error in query: ${e.getMessage()} ${e.getDetailedMessage()}`
          );
          reject(e);
          return;
        }

        data = e.getDataTable();
        // вызываем обновления таблиц
        tasksModal();
        tasksTable();
        stockTable();
        executorsTable();
        resolve();
      });
    }
  });
}

let initialNoteText = "";
let currentOpenRow = null;

function tasksTable() {
  const tasksDiv = document.getElementById("tasksTableDiv");
  if (!tasksDiv || !tasksDiv.classList.contains("active")) return;

  const getVal = (row, col) => data.Tf[row]?.c[col]?.v ?? "";
  const getValF = (row, col) => data.Tf[row]?.c[col]?.f ?? getVal(row, col);

  const savedCurrencyZp = localStorage.getItem("user_currencyZp") || "";
  const isStore = role === "store";
  const isMaster = role === "master";
  const isLimitedView = isStore || isMaster;
  const isPurchasesTab = document
    .getElementById("nav-purchases-tab")
    ?.classList.contains("active");

  const hNumber = isPurchasesTab ? t("thDocument") : t("thNumber");
  const hDesc = isPurchasesTab ? t("thDescription") : t("thCarData");
  const hClient = isPurchasesTab ? t("thSupplier") : t("thClient");

  let trKey = "",
    trWork = "",
    trProp = "",
    trOverdue = "",
    trPause = "";

  let thContent = `<th class="text-secondary">№</th>
      <th class="text-secondary">${t("thDateTime")}</th>
      <th class="text-secondary text-truncate" style="max-width: 70px;">${hNumber}</th>
      <th class="text-secondary text-truncate" style="max-width: 170px;">${hDesc}</th>`;

  if (!isLimitedView) {
    thContent += `<th class="text-secondary text-truncate" style="min-width: 120px; max-width: 180px;">${hClient}</th>
      <th class="text-secondary text-truncate" style="max-width: 80px;">${t(
        "thContact"
      )}</th>`;
  }

  thContent += `<th class="text-secondary">${
    isPurchasesTab || isStore
      ? t("purchases")
      : isMaster
      ? t("salaryNorm")
      : t("total")
  }</th>`;
  if (!isPurchasesTab)
    thContent += `<th class="text-secondary text-center">${t(
      "noteHeader"
    )}</th>`;

  const th = `<tr class="border-bottom border-info">${thContent}</tr>`;
  const startIndex = Math.max(0, data.Tf.length - 5000);

  for (let i = data.Tf.length - 1; i >= startIndex; i--) {
    const status = getVal(i, 4);
    const own = getVal(i, 24);

    const isCurrentStatus =
      (Array.isArray(uStatus) ? uStatus.includes(status) : status == uStatus) &&
      own == sName;
    const isProposalInWork =
      status == "пропозиція" &&
      (Array.isArray(uStatus)
        ? uStatus.includes("в роботі")
        : uStatus == "в роботі") &&
      own == sName;

    if (!isCurrentStatus && !isProposalInWork) continue;

    const rawNoteData = getVal(i, 39) || "0|";
    const [state, noteText] = rawNoteData.split("|");
    const currentState = status === "в роботі" ? parseInt(state) : 0;
    const hasNote = noteText && noteText.trim().length > 0;
    const canEdit = ["в роботі", "пропозиція", "чернетка"].includes(status);

    let rowClass = "",
      rowTitle = "";
    if (status === "в роботі" || status === "чернетка") {
      if (currentState === 1) {
        rowClass = "table-warning";
        rowTitle = t("stateImportant");
      } else if (currentState === 2) {
        rowClass = "table-danger";
        rowTitle = t("stateOverdue");
      } else if (currentState === 3) {
        rowClass = "table-info";
        rowTitle = t("statePause");
      } else {
        rowClass = "table-success";
        rowTitle = t("statusInWork");
      }
      // Убрана лишняя перезапись rowTitle, которая была в вашем коде
    } else if (status === "пропозиція") {
      rowTitle = t("statusProposal");
    }

    const visitNum = getVal(i, 3);
    // Проверяем статус: если не "пропозиція" и не "в роботі", назначаем класс для бледного цвета
    const isActiveStatus = status === "пропозиція" || status === "в роботі";
    const indicatorColorClass = isActiveStatus ? "" : "note-indicator-pale";
    const noteBtn = `<div class="note-wrapper ${
      canEdit ? "" : "status-inactive"
    } ${hasNote ? "has-note" : ""}" 
                 onclick="openNoteMenu(event, ${i}, '${status}', '${visitNum}')"><i class="bi bi-card-checklist"></i><span class="note-indicator ${indicatorColorClass}"></span></div>`;

    let lastColData = "";
    if (isPurchasesTab) {
      lastColData = `<td class="text-nowrap text-end">${
        isStore ? "" : getVal(i, 33) + " " + getVal(i, 34)
      }</td>`;
    } else {
      const valCol = isMaster
        ? `${getVal(i, 28)} ${savedCurrencyZp}`
        : `${t(getVal(i, 30))} ${getVal(i, 29)} ${getVal(i, 34)}`;
      lastColData = `<td class="text-nowrap text-end">${
        isStore ? "" : valCol
      }</td><td class="text-center">${noteBtn}</td>`;
    }

    const contact = getVal(i, 26);
    const linkColor = (
      Array.isArray(uStatus)
        ? uStatus.includes("в архив")
        : uStatus === "в архив"
    )
      ? "link-secondary"
      : "link-dark";

    const rowHTML = `<tr class="${rowClass}" title="${rowTitle}" name="${i}">
        <td class="text-nowrap"><button class="send-button link-badge" name="${i}">${visitNum}</button></td>
        <td class="text-nowrap">${getValF(i, 0)} - ${getValF(i, 1)}</td>
        <td class="text-truncate" style="max-width: 70px;">${getVal(i, 13)}</td>
        <td class="text-truncate" style="max-width: 170px;">${getVal(
          i,
          20
        )}</td>
        ${
          !isLimitedView
            ? `<td class="text-truncate" style="max-width: 170px;">${getVal(
                i,
                25
              )}</td><td class="text-truncate" style="max-width: 100px;"><a href="tel:+${contact}" class="${linkColor}">${contact}</a></td>`
            : ""
        }
        ${lastColData}
    </tr>`;

    if (status === "пропозиція") trProp += rowHTML;
    else if (status === "в роботі") {
      if (currentState === 1) trKey += rowHTML;
      else if (currentState === 2) trOverdue += rowHTML;
      else if (currentState === 3) trPause += rowHTML;
      else trWork += rowHTML;
    } else trWork += rowHTML;
  }

  tasksDiv.innerHTML = `<table id="myTable" class="table table-hover table-sm"><thead>${th}</thead><tbody>${trKey}${trWork}${trProp}${trOverdue}${trPause}</tbody></table>`;
}

// Управление меню
function openNoteMenu(event, rowIndex, status, visitNum) {
  event.stopPropagation();
  currentOpenRow = rowIndex;
  const menu = document.getElementById("noteMenu");
  const stateIcons = document.getElementById("stateIcons");
  const textarea = document.getElementById("noteTextarea");
  const saveBtn = document.getElementById("saveNoteBtn");

  document.getElementById("menuVisitNum").innerText = visitNum;

  const rawData = getVal(rowIndex, 39) || "0|";
  const [state, text] = rawData.split("|");
  initialNoteText = text || "";

  // 3. Отображаем иконки состояний только для "в роботі"
  stateIcons.style.display = status === "в роботі" ? "flex" : "none";
  selectState(parseInt(state), false);

  // 2. Блокируем ввод и фокус для нередактируемых статусов
  const canEdit = ["в роботі", "пропозиція", "чернетка"].includes(status);
  textarea.value = initialNoteText;
  textarea.disabled = !canEdit;

  // 4. Оживляем кнопку и сбрасываем состояние
  saveBtn.disabled = false;
  checkNoteChange();

  menu.style.display = "block";
  menu.style.top = `${event.pageY + 10}px`;
  menu.style.left = `${Math.min(event.pageX - 100, window.innerWidth - 300)}px`;

  setTimeout(() => document.addEventListener("click", outsideClickClose), 10);
}

// 5. Функция выбора состояния с Bootstrap Icons
function selectState(state, triggerSave) {
  // 1. Визуальное переключение иконок в меню
  document.querySelectorAll(".state-dot").forEach((dot) => {
    dot.classList.toggle("active", parseInt(dot.dataset.state) === state);
  });
  document.getElementById("noteMenu").dataset.selectedState = state;

  // 2. Мгновенное изменение цвета — ТОЛЬКО если статус "в роботі"
  // Достаем статус из таблицы или из логики openNoteMenu
  const row = document.querySelector(`#myTable tr[name="${currentOpenRow}"]`);
  if (row) {
    const status = getVal(currentOpenRow, 4); // Индекс столбца со статусом (например, 4)
    if (status === "в роботі") {
      updateRowColorImmediately(currentOpenRow, state);
    }
  }

  // 3. Сохранение на сервер
  if (triggerSave) saveNoteData();
}

function updateRowColorImmediately(rowIndex, state) {
  // Поиск строки по атрибуту name, который уже есть в tasksTable
  const row = document.querySelector(`#myTable tr[name="${rowIndex}"]`);
  if (!row) return;

  // Список стандартных классов Bootstrap для очистки
  const colorClasses = [
    "table-success",
    "table-danger",
    "table-warning",
    "table-info",
  ];
  row.classList.remove(...colorClasses);

  // Установка нового класса в зависимости от состояния
  switch (state) {
    case 1: // Ключевой
      row.classList.add("table-warning");
      break;
    case 2: // Просрочено
      row.classList.add("table-danger");
      break;
    case 3: // Пауза
      row.classList.add("table-info");
      break;
    default: // В работе
      row.classList.add("table-success");
  }
}

function checkNoteChange() {
  const text = document.getElementById("noteTextarea").value;
  const btn = document.getElementById("saveNoteBtn");
  const changed = text !== initialNoteText;
  if (btn.disabled) return;
  btn.innerText = changed ? t("save") : t("close");
  btn.className = `btn btn-sm ${changed ? "btn-danger" : "btn-primary"}`;
}

function handleSaveClick() {
  const btn = document.getElementById("saveNoteBtn");
  // Если кнопка красная (btn-danger), значит текст изменен и нужно сохранить
  if (btn.classList.contains("btn-danger")) {
    saveNoteData();
  } else {
    closeNoteMenu();
  }
}

async function saveNoteData() {
  const menu = document.getElementById("noteMenu");
  const saveButton = document.getElementById("saveNoteBtn");
  const state = menu.dataset.selectedState || "0";
  const text = document.getElementById("noteTextarea").value.replace(/\|/g, "");

  const body = new URLSearchParams({
    action: "updateNote",
    tasks: tasks,
    rowNumber: Number(currentOpenRow) + 2,
    noteContent: `${state}|${text}`,
  }).toString();

  saveButton.disabled = true;
  saveButton.innerText = t("saving");
  saveButton.className = "btn btn-sm btn-warning";

  try {
    const response = await fetch(myApp, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    });

    const result = await response.json();

    if (result.success) {
      saveButton.innerText = t("doned");
      saveButton.className = "btn btn-sm btn-success";
      initialNoteText = text;
      setTimeout(() => {
        closeNoteMenu();
        loadTasks();
      }, 500);
    } else {
      throw new Error(result.error || "Server error");
    }
  } catch (e) {
    console.error("Ошибка сохранения:", e);
    saveButton.disabled = false;
    saveButton.innerText = t("save"); // Возвращаем возможность повтора
    saveButton.className = "btn btn-sm btn-danger";
    alert("Ошибка: " + e.message);
  }
}

function closeNoteMenu() {
  document.getElementById("noteMenu").style.display = "none";
  document.removeEventListener("click", outsideClickClose);
}

function outsideClickClose(e) {
  if (!document.getElementById("noteMenu").contains(e.target)) closeNoteMenu();
}

function stockTable() {
  const containerId = "stockTable";
  const container = document.getElementById(containerId);
  if (!container.classList.contains("active")) {
    return; // вкладка не активна
  }

  const toNumber = (s) => {
    if (s === undefined || s === null) return null;
    const str = String(s).trim();
    const m = str.match(/-?\d+[.,]?\d*/);
    if (!m) return null;
    return parseFloat(m[0].replace(",", "."));
  };

  const parseQtyUnit = (s) => {
    if (!s) return { qty: null, unit: null };
    const str = String(s).trim();
    const numMatch = str.match(/-?\d+[.,]?\d*/);
    const qty = numMatch ? parseFloat(numMatch[0].replace(",", ".")) : null;
    let unit = null;
    if (numMatch) unit = str.replace(numMatch[0], "").trim() || null;
    else unit = str || null;
    return { qty, unit };
  };

  const parsedEntries = [];
  const allArticlesSet = new Set();

  for (let i = 0; i < data.Tf.length; i++) {
    const cellData = data.Tf[i]?.c?.[36]?.v;
    if (!cellData) continue;

    const status = String(data.Tf[i]?.c?.[4]?.v || "")
      .trim()
      .toLowerCase();
    if (status !== "надходження" && status !== "виконано") continue;

    const services = String(cellData)
      .split("--")
      .map((s) => s.trim())
      .filter(Boolean);
    services.forEach((serviceStr) => {
      const cols = serviceStr.split("|").map((c) => c.trim());
      const serviceName = cols[0] || "";
      const deltaRaw = cols[1] || "";
      const sigmaRaw = cols[4] || "";
      const articleRaw = cols[5] || "";
      const costRaw = cols[6] || "";

      if (!articleRaw) return;

      const articles = articleRaw
        .split("/")
        .map((a) => a.trim())
        .filter(Boolean);
      const sigmas = sigmaRaw ? sigmaRaw.split("/").map((s) => s.trim()) : [];
      const deltas = deltaRaw ? deltaRaw.split("/").map((s) => s.trim()) : [];
      const costs = costRaw ? costRaw.split("/").map((s) => s.trim()) : [];

      for (let j = 0; j < articles.length; j++) {
        const article = articles[j];
        if (!article) continue;
        allArticlesSet.add(article);

        const sigmaPart = sigmas[j] ?? sigmas[0] ?? "";
        const deltaPart = deltas[j] ?? deltas[0] ?? "";
        const costPart = costs[j] ?? costs[0] ?? "";

        parsedEntries.push({
          rowIndex: i,
          status,
          serviceName,
          article,
          sigmaRaw: sigmaPart,
          deltaRaw: deltaPart,
          costRaw: costPart,
        });
      }
    });
  }

  const agg = new Map();
  const ensure = (art) => {
    if (!agg.has(art)) {
      agg.set(art, {
        article: art,
        name: "",
        unitCounts: new Map(),
        costValues: [],
        incoming: 0,
        outgoing: 0,
        services: new Set(),
        usageCount: 0,
      });
    }
    return agg.get(art);
  };

  parsedEntries.forEach((e) => {
    const rec = ensure(e.article);
    const { qty: sigmaQty, unit: sigmaUnit } = parseQtyUnit(e.sigmaRaw);
    const deltaNum = toNumber(e.deltaRaw);
    const costNum = toNumber(e.costRaw);

    if (e.serviceName) rec.services.add(e.serviceName);
    if (sigmaUnit)
      rec.unitCounts.set(
        sigmaUnit,
        (rec.unitCounts.get(sigmaUnit) || 0) + (sigmaQty || 0)
      );
    if (typeof costNum === "number" && !isNaN(costNum))
      rec.costValues.push(costNum);

    if (e.status === "надходження") {
      rec.incoming += sigmaQty || 0;
    } else if (e.status === "виконано") {
      if (deltaNum !== null) rec.outgoing += deltaNum;
      else rec.outgoing += sigmaQty || 0;
    }

    rec.usageCount++;
  });

  allArticlesSet.forEach((art) => {
    ensure(art);
  });

  let rows = [];
  agg.forEach((r) => {
    let unit = "";
    if (r.unitCounts.size)
      unit = Array.from(r.unitCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
    const avgCost = r.costValues.length
      ? r.costValues.reduce((a, b) => a + b, 0) / r.costValues.length
      : "";
    const stock = (r.incoming || 0) - (r.outgoing || 0);

    rows.push({
      article: r.article,
      name: r.name || "",
      unit: unit || "",
      cost: avgCost !== "" ? Number(avgCost.toFixed(3)) : "",
      stock: Number(
        (Math.round((stock + Number.EPSILON) * 1000) / 1000).toFixed(3)
      ),
      services: Array.from(r.services).sort(),
      usageCount: r.usageCount,
    });
  });

  // сортируем по количеству использований (по убыванию)
  rows.sort((a, b) => b.usageCount - a.usageCount);

  // добавляем индексацию после сортировки
  rows = rows.map((r, idx) => ({ ...r, idx: idx + 1 }));

  const th = `<tr class="border-bottom border-info">
  <th class="text-secondary" style="width: 40px;">№</th>
  <th class="text-secondary text-truncate" style="max-width: 100px;">${t(
    "article"
  )}</th>
  <th class="text-secondary text-truncate" style="min-width: 150px; max-width: 250px;">${t(
    "name"
  )}</th>
  <th class="text-secondary" style="width: 60px;">${t("unit")}</th>
  <th class="text-secondary" style="width: 90px;">${t("costPrice")}</th>
  <th class="text-secondary" style="width: 80px;">${t("balance")}</th>
  <th class="text-secondary text-truncate" style="min-width: 200px; max-width: 400px;">${t(
    "servicesList"
  )}</th>
  <th class="text-secondary" style="width: 80px;">${t("usageCount")}</th>
</tr>`;

  let tr = "";
  rows.forEach((r) => {
    // Формируем список услуг: каждая услуга обернута для возможности горизонтального скролла
    const servicesHtml = r.services.length
      ? r.services.map((s) => `- ${s}`).join("</br>")
      : "";

    tr += `<tr>
    <td>${r.idx}</td>
    <td class="text-truncate" style="max-width: 100px;">${r.article}</td>
    <td class="text-truncate" style="min-width: 150px; max-width: 250px;"><div class="services-container">${
      r.name || ""
    }<div></td>
    <td>${r.unit || ""}</td>
    <td>${r.cost !== "" ? r.cost : ""}</td>
    <td>${r.stock}</td>
    <td class="text-truncate" style="min-width: 200px; max-width: 400px;"><div class="services-container">${servicesHtml}<div></td>
    <td>${r.usageCount}</td>
  </tr>`;
  });

  // 1. Формируем новую строку таблицы
  const newTableHTML = `
  <table id="stockTableEl" class="table table-striped table-hover table-sm text-truncate">
    <thead>${th}</thead>
    <tbody>${tr}</tbody>
  </table>`;

  // 2. Способ 2: Проверка на изменения (Оптимизация)
  // Используем dataset для хранения предыдущего состояния прямо в контейнере
  if (container.dataset.lastHtml === newTableHTML) {
    return; // Данные не менялись, выходим из функции
  }

  // 3. Способ 1: Сохранение скролла (если данные всё же изменились)
  const scrollMap = [];
  container.querySelectorAll(".services-container").forEach((el) => {
    scrollMap.push({ t: el.scrollTop, l: el.scrollLeft });
  });

  // 4. Обновление DOM
  container.innerHTML = `<div class="table-responsive">${newTableHTML}</div>`;
  container.dataset.lastHtml = newTableHTML; // Сохраняем состояние для следующей проверки

  // 5. Восстановление скролла
  container.querySelectorAll(".services-container").forEach((el, i) => {
    if (scrollMap[i]) {
      el.scrollTop = scrollMap[i].t;
      el.scrollLeft = scrollMap[i].l;
    }
  });
}

function executorsTable() {
  const containerId = "executorsTable";
  const container = document.getElementById(containerId);
  if (!container) return;

  const toNumber = (s) => {
    if (s === undefined || s === null) return null;
    const str = String(s).trim();
    const m = str.match(/-?\d+[.,]?\d*/);
    if (!m) return null;
    return parseFloat(m[0].replace(",", "."));
  };

  const parsedEntries = [];
  const allExecSet = new Set();

  for (let i = 0; i < data.Tf.length; i++) {
    const cellData = data.Tf[i]?.c?.[36]?.v;
    if (!cellData) continue;

    const status = String(data.Tf[i]?.c?.[4]?.v || "")
      .trim()
      .toLowerCase();
    if (status !== "надходження" && status !== "виконано") continue;

    const services = String(cellData)
      .split("--")
      .map((s) => s.trim())
      .filter(Boolean);
    services.forEach((serviceStr) => {
      const cols = serviceStr.split("|").map((c) => c.trim());
      const serviceName = cols[0] || "";
      const qTimeRaw = cols[7] || "";
      const executorsRaw = cols[8] || "";
      const normSalaryRaw = cols[9] || "";

      if (!executorsRaw) return;

      const executors = executorsRaw
        .split("/")
        .map((e) => e.trim())
        .filter(Boolean);
      const qTimes = qTimeRaw ? qTimeRaw.split("/").map((t) => t.trim()) : [];
      const normSalary = toNumber(normSalaryRaw) || 0;

      let shares = [];
      if (executors.length === 1 && !qTimeRaw) {
        shares = [1];
      } else if (executors.length > 1 && !qTimeRaw) {
        const part = 1 / executors.length;
        shares = Array(executors.length).fill(part);
      } else if (qTimes.length === executors.length) {
        const nums = qTimes.map(toNumber);
        const total = nums.reduce((a, b) => a + (b || 0), 0);
        shares = nums.map((v) => (total > 0 ? v / total : 0));
      } else {
        const part = 1 / executors.length;
        shares = Array(executors.length).fill(part);
      }

      executors.forEach((exec, idx) => {
        const salaryPart = normSalary * (shares[idx] || 0);
        parsedEntries.push({
          rowIndex: i,
          status,
          serviceName,
          executor: exec,
          salary: salaryPart,
        });
        allExecSet.add(exec);
      });
    });
  }

  const agg = new Map();
  const ensure = (exec) => {
    if (!agg.has(exec)) {
      agg.set(exec, {
        executor: exec,
        normSalarySum: 0,
        services: new Set(),
        usageCount: 0,
      });
    }
    return agg.get(exec);
  };

  parsedEntries.forEach((e) => {
    const rec = ensure(e.executor);
    rec.normSalarySum += e.salary;
    if (e.serviceName) rec.services.add(e.serviceName);
    rec.usageCount++;
  });

  allExecSet.forEach((ex) => {
    ensure(ex);
  });

  let rows = [];
  agg.forEach((r) => {
    rows.push({
      executor: r.executor,
      normSalary: Number(r.normSalarySum.toFixed(3)),
      services: Array.from(r.services).sort(),
      usageCount: r.usageCount,
    });
  });

  rows.sort((a, b) => b.usageCount - a.usageCount);
  rows = rows.map((r, idx) => ({ ...r, idx: idx + 1 }));

  const th = `<tr class="border-bottom border-info">
  <th class="text-secondary" style="width: 40px;">№</th>
  <th class="text-secondary text-truncate" style="min-width: 150px; max-width: 200px;">${t(
    "performers"
  )}</th>
  <th class="text-secondary" style="width: 100px;">${t("salaryNorm")}</th>
  <th class="text-secondary text-truncate" style="min-width: 250px; max-width: 450px;">${t(
    "servicesList"
  )}</th>
  <th class="text-secondary" style="width: 90px;">${t("completions")}</th>
</tr>`;

  let tr = "";
  rows.forEach((r) => {
    // Список услуг с вертикальной прокруткой
    const servicesHtml = r.services.length
      ? r.services.map((s) => `- ${s}`).join("</br>")
      : "";

    tr += `<tr>
      <td>${r.idx}</td>
      <td class="text-truncate" style="min-width: 150px; max-width: 200px;">${r.executor}</td>
      <td>${r.normSalary}</td>
      <td class="text-truncate" style="min-width: 250px; max-width: 450px;"><div class="services-container">${servicesHtml}</div></td>
      <td>${r.usageCount}</td>
    </tr>`;
  });

  // 1. Формируем новую строку таблицы
  const newTableHTML = `
  <table id="executorsTableEl" class="table table-striped table-hover table-sm text-truncate">
    <thead>${th}</thead>
    <tbody>${tr}</tbody>
  </table>`;

  // 2. Способ 2: Проверка на изменения (Оптимизация)
  // Используем dataset для хранения предыдущего состояния прямо в контейнере
  if (container.dataset.lastHtml === newTableHTML) {
    return; // Данные не менялись, выходим из функции
  }

  // 3. Способ 1: Сохранение скролла (если данные всё же изменились)
  const scrollMap = [];
  container.querySelectorAll(".services-container").forEach((el) => {
    scrollMap.push({ t: el.scrollTop, l: el.scrollLeft });
  });

  // 4. Обновление DOM
  container.innerHTML = `<div class="table-responsive">${newTableHTML}</div>`;
  container.dataset.lastHtml = newTableHTML; // Сохраняем состояние для следующей проверки

  // 5. Восстановление скролла
  container.querySelectorAll(".services-container").forEach((el, i) => {
    if (scrollMap[i]) {
      el.scrollTop = scrollMap[i].t;
      el.scrollLeft = scrollMap[i].l;
    }
  });
}

function myFunction(reset = false) {
  const input = document.getElementById("myInput");
  const filter = reset ? "" : input.value.toUpperCase();

  if (reset && input) {
    input.value = ""; // очищаем поле при сбросе
  }

  const tableIds = ["myTable", "stockTableEl", "executorsTableEl"];

  tableIds.forEach((tableId) => {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
      // ✅ пропускаем строку с заголовками (thead)
      if (tr[i].parentNode.tagName === "THEAD") {
        tr[i].style.display = "";
        continue;
      }

      let tds = tr[i].getElementsByTagName("td");
      let show = false;

      for (let j = 0; j < tds.length; j++) {
        if (tds[j] && tds[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
          show = true;
          break;
        }
      }
      tr[i].style.display = show ? "" : "none";
    }
  });
}

var servicesData;
function tasksModal() {
  autoNum.length = 0;
  autoMake.length = 0;
  autoModel.length = 0;
  autoColor.length = 0;
  autoYear.length = 0;
  autoVin.length = 0;
  autoMileage.length = 0;
  autoClient.length = 0;
  autoPhone.length = 0;
  dataArray.length = 0;

  for (var i = data.Tf.length - 1; i >= 0; i--) {
    const num =
      data.Tf[i].c[13] && data.Tf[i].c[13].v ? data.Tf[i].c[13].v : "";
    const make =
      data.Tf[i].c[14] && data.Tf[i].c[14].v ? data.Tf[i].c[14].v : "";
    const model =
      data.Tf[i].c[15] && data.Tf[i].c[15].v ? data.Tf[i].c[15].v : "";
    const color =
      data.Tf[i].c[16] && data.Tf[i].c[16].v ? data.Tf[i].c[16].v : "";
    const year =
      data.Tf[i].c[17] && data.Tf[i].c[17].v ? data.Tf[i].c[17].v : "";
    const vin =
      data.Tf[i].c[18] && data.Tf[i].c[18].v ? data.Tf[i].c[18].v : "";
    const mileage =
      data.Tf[i].c[12] && data.Tf[i].c[12].v ? data.Tf[i].c[12].v : "";
    const client =
      data.Tf[i].c[25] && data.Tf[i].c[25].v ? data.Tf[i].c[25].v : "";
    const phone =
      data.Tf[i].c[26] && data.Tf[i].c[26].v ? data.Tf[i].c[26].v : "";

    autoNum.push(num);
    autoMake.push(make);
    autoModel.push(model);
    autoColor.push(color);
    autoYear.push(year);
    autoVin.push(vin);
    autoMileage.push(mileage);
    autoClient.push(client);
    autoPhone.push(phone);
  }

  opcMake.length = 0;
  opcModel.length = 0;
  opcColor.length = 0;
  opcYear.length = 0;

  var autoMakeUniq = [];
  for (var i = 0; i < autoMake.length; i++) {
    var swap = 0;
    var str = autoMake[i];
    for (var j = i; j < autoMake.length; j++) {
      if (autoMake[j] == str) {
        swap++;
      }
    }
    if (swap == 1 && autoMake[i] != "?") {
      autoMakeUniq.push(autoMake[i]);
    }
  }
  var autoMakeUniqSort = autoMakeUniq.sort();
  for (i = 0; i < autoMakeUniqSort.length; i++) {
    opcMake.push(`<option>${autoMakeUniqSort[i]}</option>`);
  }
  tempMake.length = 0;
  tempModel.length = 0;
  for (var i = 0; i < data.Tf.length; i++) {
    var swap = 0;
    var str = data.Tf[i].c[15] && data.Tf[i].c[15].v ? data.Tf[i].c[15].v : "";

    for (var j = i; j < data.Tf.length; j++) {
      var model2 =
        data.Tf[j].c[15] && data.Tf[j].c[15].v ? data.Tf[j].c[15].v : "";
      if (model2 == str) {
        swap++;
      }
    }
    if (swap == 1 && str != "") {
      const make2 =
        data.Tf[i].c[14] && data.Tf[i].c[14].v ? data.Tf[i].c[14].v : "";
      tempMake.push(make2);
      tempModel.push(str);
    }
  }

  for (var i = 0; i < tempModel.length; i++) {
    opcModel.push(`<option>${tempModel[i]}</option>`);
  }

  var autoColorUniq = [];
  for (var i = 0; i < autoColor.length; i++) {
    var swap = 0;
    var str = autoColor[i];
    for (var j = i; j < autoColor.length; j++) {
      if (autoColor[j] == str) {
        swap++;
      }
    }
    if (swap == 1 && autoColor[i] != "?") {
      autoColorUniq.push(autoColor[i]);
    }
  }
  var autoColorUniqSort = autoColorUniq.sort();
  for (i = 0; i < autoColorUniqSort.length; i++) {
    opcColor.push(`<option>${autoColorUniqSort[i]}</option>`);
  }

  var autoYearUniq = [];
  for (var i = 0; i < autoYear.length; i++) {
    var swap = 0;
    var str = autoYear[i];
    for (var j = i; j < autoYear.length; j++) {
      if (autoYear[j] == str) {
        swap++;
      }
    }
    if (swap == 1 && autoYear[i] != "0") {
      autoYearUniq.push(autoYear[i]);
    }
  }
  var autoYearUniqSort = autoYearUniq.sort();
  for (i = 0; i < autoYearUniqSort.length; i++) {
    opcYear.push(`<option>${autoYearUniqSort[i]}</option>`);
  }

  // Собираем подсказки регламент
  for (let i = data.Tf.length - 1; i >= 0; i--) {
    const cellData = data.Tf[i]?.c[36]?.v ?? "";
    if (cellData) {
      dataArray.push(cellData);
    }
  }
  // После получения dataArray (массив строк из регламентов)
  const servicesSet = new Set();

  dataArray.forEach((dataString) => {
    const services = dataString.split("--");
    services.forEach((service) => {
      const columns = service.split("|");
      const serviceName = columns[0]?.trim();
      if (serviceName) {
        servicesSet.add(
          JSON.stringify({
            serviceName,
            quantity: columns[1]?.trim() || "",
            servicePrice: columns[2]?.trim() || "",
            itemPrice: columns[3]?.trim() || "",
            quantity2: columns[4]?.trim() || "",
            article: columns[5]?.trim() || "",
            costPrice: columns[6]?.trim() || "",
            qTime: columns[7]?.trim() || "",
            executor: columns[8]?.trim() || "",
            normSalary: columns[9]?.trim() || "",
          })
        );
      }
    });
  });

  servicesData = Array.from(servicesSet).map((service) => JSON.parse(service));
  var serviceNames = [],
    info = [],
    articles = [],
    executors = [];
  servicesData.forEach((service) => {
    serviceNames.push(service.serviceName);
    info.push(service.quantity);
    articles.push(service.article);
    executors.push(service.executor);
  });
  createDatalist("service-regulation", serviceNames);
  createDatalist("info-s", info);
  createDatalist("article-s", articles);
  createDatalist("executor-s", executors);
  // Создаем datalist
  function createDatalist(id, values) {
    let datalist = document.getElementById(id);
    if (datalist) datalist.remove(); // удалить старый

    datalist = document.createElement("datalist");
    datalist.id = id;

    [...new Set(values.filter(Boolean))].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      datalist.appendChild(option);
    });

    document.body.appendChild(datalist);
  }
}

var autoNum = [],
  autoMake = [],
  autoModel = [],
  autoColor = [],
  autoYear = [],
  autoVin = [],
  autoMileage = [],
  autoClient = [],
  autoPhone = [],
  dataArray = [];

function normalizeLatinUpper(str) {
  const map = {
    А: "A",
    В: "B",
    Е: "E",
    И: "I",
    К: "K",
    М: "M",
    Н: "H",
    О: "O",
    Р: "P",
    С: "C",
    Т: "T",
    У: "Y",
    Х: "X",
    а: "A",
    в: "B",
    е: "E",
    и: "I",
    к: "K",
    м: "M",
    н: "H",
    о: "O",
    р: "P",
    с: "C",
    т: "T",
    у: "Y",
    х: "X",
  };

  return (str || "")
    .replace(/[А-Яа-я]/g, (ch) => map[ch] || ch)
    .toUpperCase()
    .trim();
}

function validatePhoneByRules(digits) {
  for (const { code, length } of Object.values(phoneRules)) {
    if (digits.startsWith(code)) {
      return digits.slice(code.length).length === length;
    }
  }
  return false;
}

function formatPhone(value) {
  if (!value) return "";

  let raw = value.replace(/[^\d+]/g, "");

  // если пользователь ввёл +
  if (raw.startsWith("+")) {
    const digits = raw.slice(1);
    return validatePhoneByRules(digits) ? "+" + digits : value;
  }

  // если нет правил страны
  if (!userPhoneRule) return value;

  const { code, length } = userPhoneRule;

  // пользователь ввёл код без +
  if (raw.startsWith(code)) {
    const local = raw.slice(code.length);
    return local.length === length ? "+" + raw : value;
  }

  // пользователь ввёл локальный номер
  let local = raw.startsWith("0") ? raw.slice(1) : raw;

  if (local.length !== length) return value;

  return "+" + code + local;
}

function calculateVisits({ num, vin }) {
  if (num && num !== "?") {
    return autoNum.filter((v) => v === num).length + 1;
  }
  if (vin && vin !== "?") {
    return autoVin.filter((v) => v === vin).length + 1;
  }
  return 1;
}

function updateVisits() {
  const num = document.getElementById("num")?.value || "";
  const vin = document.getElementById("vin")?.value || "";

  const visits = calculateVisits({ num, vin });
  const el = document.getElementById("allnum");
  if (el) el.textContent = `${visits} -й візит`;
}

function rebuildDatalist(listId, source) {
  const list = document.getElementById(listId);
  if (!list || !source.length) return;

  list.innerHTML = "";
  [...new Set(source)]
    .filter((v) => v && v !== "?")
    .forEach((v) =>
      list.insertAdjacentHTML("beforeend", `<option value="${v}">`)
    );
}

function rebuildNumDatalist() {
  rebuildDatalist("character", autoNum);
}
function rebuildVinDatalist() {
  rebuildDatalist("character8", autoVin);
}
function rebuildClientDatalist() {
  rebuildDatalist("character7", autoClient);
}
function rebuildPhoneDatalist() {
  rebuildDatalist("character9", autoPhone);
}

function setIfEmpty(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.value && el.value !== "?") return;
  if (!value || value === "?") return;
  el.value = value;
}

function fillFromStorage({ field, value }) {
  for (let i = 0; i < autoNum.length; i++) {
    if (
      (field === "num" && autoNum[i] === value) ||
      (field === "vin" && autoVin[i] === value) ||
      (field === "client" && autoClient[i] === value) ||
      (field === "phone" && autoPhone[i] === value)
    ) {
      setIfEmpty("num", autoNum[i]);
      setIfEmpty("vin", autoVin[i]);
      setIfEmpty("client", autoClient[i]);
      setIfEmpty("phone", autoPhone[i]);
      setIfEmpty("model", autoModel[i]);
      setIfEmpty("make", autoMake[i]);
      setIfEmpty("color", autoColor[i]);
      setIfEmpty("year", autoYear[i]);
      setIfEmpty("mileage", autoMileage[i]);
      return; // ❗ только первый (последний визит)
    }
  }
}

const optionConfig = new Map([
  ["num", { normalize: normalizeLatinUpper }],
  ["vin", { normalize: normalizeLatinUpper }],
  ["client", { normalize: (v) => v.trim() }],
  ["phone", { normalize: formatPhone }],
]);

function option(event) {
  const input = event.target;
  const field = input.id;
  const config = optionConfig.get(field);
  if (!config) return;

  // 1️⃣ нормализация
  const value = config.normalize(input.value);
  input.value = value;

  // 2️⃣ автозаполнение (ВСЕГДА, если есть значение)
  if (value && value !== "?") {
    fillFromStorage({ field, value });
  }

  // 3️⃣ подсчёт визитов ПОСЛЕ автозаполнения
  updateVisits();
}

function normalizeEditValue(dataKey, value, input) {
  switch (dataKey) {
    case "editNumplate":
    case "editVin":
      value = normalizeLatinUpper(value);
      input.value = value;
      break;

    case "editContact":
      value = formatPhone(value);
      input.value = value;
      break;

    case "editClient":
      value = value.trim();
      input.value = value;
      break;
  }
  return value;
}

var tempMake = [],
  tempModel = [];
function findModel() {
  var marka = $("#make").val();
  var model = document.getElementById("character2");
  model.innerHTML = "";
  var tempModelUniq = [];
  for (i = 0; i < tempMake.length; i++) {
    if (tempMake[i] == marka) {
      tempModelUniq.push(tempModel[i]);
    }
  }
  var tempModelUniqSort = tempModelUniq.sort();
  for (i = 0; i < tempModelUniqSort.length; i++) {
    model.insertAdjacentHTML(
      "beforeend",
      "<option>" + tempModelUniqSort[i] + "</option>"
    );
  }
}
var opcMake = [],
  opcModel = [],
  opcColor = [],
  opcYear = [];

// Создание нового визита
// ==========================================================
function newOrder() {
  const currentTime = moment();
  const vHour = currentTime.format("HH");
  const vMinutes = currentTime.format("mm");
  const vYear = currentTime.format("YYYY");
  const vMonth = currentTime.format("MM");
  const vDay = currentTime.format("DD");

  var title = t("createVisit");
  var buttons = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
      ${t("cancelBtn")}
    </button>
    <button type="button" class="btn btn-outline-primary" id="btn-createVisit">
      ${t("createBtn")}
    </button>`;

  document.querySelector("#commonModal .modal-title").innerHTML = title;

  document.querySelector("#commonModal .modal-body").innerHTML = `
    <div class="row">
      <div class="col-6" id="allnum" name="allnum" 
           style="color: blue; font-size: 14px; text-align: center;"></div>

      <div class="col-6" style="color: red; font-size: 12px; text-align: right;">
        <i class="fas fa-pen"></i> ${t("record")}
      </div>
    </div>

    <div class="row">
      <div class="col-6">
        <form class="form-floating">
          <input class="form-control" id="num" placeholder="${t("carNumber")}" 
                 value="" oninput="option(event)" list="character">
          <label for="num">${t("carNumber")}</label>
        </form>
        <datalist id="character"></datalist>
      </div>

      <div class="col-6">
        <form class="form-floating">
          <input type="datetime-local" id="datetime-local" class="form-control"
                 min="${vYear}-${vMonth}-${vDay}T${vHour}:${vMinutes}"
                 value="${vYear}-${vMonth}-${vDay}T${vHour}:${vMinutes}">
          <label for="datetime-local">${t("visitTime")}</label>
        </form>
      </div>
    </div>

    <div class="row text-bg-light p-2">
      <div class="col-6">
        <label for="make">${t("make")}</label>
        <input id="make" class="form-control form-control-sm" 
               onchange="findModel()" list="character1">
        <datalist id="character1">${opcMake}</datalist>
      </div>

      <div class="col-6">
        <label for="model">${t("model")}</label>
        <input id="model" class="form-control form-control-sm" 
               list="character2">
        <datalist id="character2">${opcModel}</datalist>
      </div>
    </div>

    <div class="row text-bg-light">
      <div class="col-6">
        <label for="color">${t("color")}</label>
        <input id="color" class="form-control form-control-sm" 
               list="character3">
        <datalist id="character3">${opcColor}</datalist>
      </div>

      <div class="col-6">
        <label for="year">${t("year")}</label>
        <input id="year" class="form-control form-control-sm" 
               list="character4">
        <datalist id="character4">${opcYear}</datalist>
      </div>
    </div>

    <div class="row text-bg-light p-2">
      <div class="col-6">
        <label for="vin">${t("vin")}</label>
        <input id="vin" class="form-control form-control-sm"
        oninput="option(event)" list="character8">
        <datalist id="character8"></datalist>
      </div>

      <div class="col-6">
        <label for="mileage">${t("mileage")}</label>
        <input id="mileage" class="form-control form-control-sm">
      </div>
    </div>

    <div class="row">
      <div class="col-6">
        <label for="client">${t("client")}</label>
        <input id="client" class="form-control form-control-sm" 
               onchange="option(event)" list="character7">
        <datalist id="character7"></datalist>
      </div>

      <div class="col-6">
        <label for="phone">${t("clientPhone")}</label>
        <input id="phone" class="form-control form-control-sm"
        onchange="option(event)" list="character9">
        <datalist id="character9"></datalist>
      </div>
    </div>
  `;

  const modalBody = document.querySelector("#commonModal .modal-body");
  initPhotoBlockForModal(modalBody, "new", null);
  // ==========================================================

  document.querySelector("#commonModal .modal-footer").innerHTML = buttons;

  // Кнопка "Создать"
  document
    .getElementById("btn-createVisit")
    .addEventListener("click", addCheck);

  const modalEl = document.getElementById("commonModal");
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
  rebuildNumDatalist();
  rebuildVinDatalist();
  rebuildClientDatalist();
  rebuildPhoneDatalist();
}

// ==========================================================
let no;

function addCheck() {
  const tabEl = document.getElementById("nav-home-tab");
  if (tabEl && !tabEl.classList.contains("active")) {
    tabEl.click();
  } else {
    const input = document.getElementById("myInput");
    if (input) input.value = "";
  }

  const savedCurrency = localStorage.getItem("user_currency");
  const savedCurrencyZp =
    localStorage.getItem("user_currencyZp") || savedCurrency;

  const nomer = document.getElementById("num")?.value || "";
  const visitnumText = document.getElementById("allnum")?.textContent || "0";
  const visitnum = visitnumText.match(/\d+/)?.[0] || "0";
  const record = document.getElementById("datetime-local")?.value || "";
  const make = document.getElementById("make")?.value || "";
  const model = document.getElementById("model")?.value || "";
  const color = document.getElementById("color")?.value || "";
  const year = document.getElementById("year")?.value || "";
  const vin = document.getElementById("vin")?.value || "";
  const mileage = document.getElementById("mileage")?.value || "";
  const client = document.getElementById("client")?.value || "";
  const phone = document.getElementById("phone")?.value || "";
  const action = "addCheck";

  const body = `sName=${encodeURIComponent(
    sName
  )}&userTimeZone=${encodeURIComponent(
    userTimeZone
  )}&tasks=${encodeURIComponent(tasks)}&nomer=${encodeURIComponent(
    nomer
  )}&visitnum=${encodeURIComponent(visitnum)}&record=${encodeURIComponent(
    record
  )}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(
    model
  )}&color=${encodeURIComponent(color)}&year=${encodeURIComponent(
    year
  )}&vin=${encodeURIComponent(vin)}&mileage=${encodeURIComponent(
    mileage
  )}&client=${encodeURIComponent(client)}&phone=${encodeURIComponent(
    phone
  )}&savedCurrency=${encodeURIComponent(
    savedCurrency
  )}&savedCurrencyZp=${encodeURIComponent(
    savedCurrencyZp
  )}&action=${encodeURIComponent(action)}`;

  const modalEl = document.getElementById("commonModal");
  modalEl.querySelector(".modal-body").innerHTML = "";
  modalEl.querySelector(".modal-footer").innerHTML = "";

  const alertArea = modalEl.querySelector(".alert-area");
  if (alertArea) {
    alertArea.innerHTML = `
      <div class="alert alert-success d-flex align-items-center" role="alert">
        <div class="spinner-border text-success me-2" role="status" 
             style="width: 1rem; height: 1rem;"></div>
        ${t("inProgress")}
      </div>`;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", myApp, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = async function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      no = Number(xhr.responseText) - 2;

      await loadTasks();

      const visitFolderName = data.Tf[no].c[3].v;
      await window.uploadPendingPhotosToVisit(visitFolderName);

      if (alertArea) {
        alertArea.innerHTML = `<div class="alert alert-success">${t(
          "doned"
        )}</div>`;
      }

      // 3. Подсветка строки
      const checkRow = setInterval(() => {
        const newString = document.querySelector(`tr[name="${no}"]`);
        if (newString) {
          clearInterval(checkRow);

          newString.classList.remove("flash-success");
          void newString.offsetWidth;
          newString.classList.add("flash-success");

          if (alertArea) alertArea.innerHTML = "";
          editOrder();
        }
      }, 200);
    }
  };

  try {
    xhr.send(body);
  } catch (err) {
    console.error(err);
  }
}

// Универсальный диспетчер кликов
document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("send-button")) return;

  no = e.target.getAttribute("name");
  const status = data.Tf[no]?.c[4]?.v;

  // Если статус относится к закупкам — открываем incomeModal, иначе — editOrder
  if (["чернетка", "надходження"].includes(status)) {
    incomeModal();
  } else {
    editOrder();
  }
});

function editOrder() {
  // Заголовок модального окна
  const title = `
  <div class="d-flex justify-content-between w-100 fs-6 fst-italic">
    <div class="text-start" id="visitNumberCell">${data.Tf[no].c[3].v}</div>
    <div class="text-end">${data.Tf[no].c[0].f} - ${data.Tf[no].c[1].f}</div>
  </div>`;

  // Кнопки модального окна
  const buttons = `<button class="btn btn-outline-secondary" onclick="printVisitFromModal()">${t(
    "printPDF"
  )}</button>
<button type="button" class="btn btn-primary" id="btn-save">${t(
    "close"
  )}</button>`;
  const savedCurrency = localStorage.getItem("user_currency");
  const savedCurrencyZp =
    localStorage.getItem("user_currencyZp") || savedCurrency;

  const dataMarkupSet =
    data.Tf[no].c[7] && data.Tf[no].c[7].v ? data.Tf[no].c[7].v : dataMarkup;
  const dataPayrateSet =
    data.Tf[no].c[8] && data.Tf[no].c[8].v ? data.Tf[no].c[8].v : dataPayrate;
  const keyeditMileage =
    data.Tf[no].c[12] && data.Tf[no].c[12].v ? data.Tf[no].c[12].v : "";
  const keyeditNum =
    data.Tf[no].c[13] && data.Tf[no].c[13].v ? data.Tf[no].c[13].v : "";
  const keyeditCarInfo =
    data.Tf[no].c[20] && data.Tf[no].c[20].v ? data.Tf[no].c[20].v : "";
  const keyeditVin =
    data.Tf[no].c[21] && data.Tf[no].c[21].v ? data.Tf[no].c[21].v : "";

  const rawComment =
    data.Tf[no].c[23] && data.Tf[no].c[23].v ? data.Tf[no].c[23].v : "";
  let cParts = rawComment.split("||").map((s) => s.trim());
  // Гарантируем наличие 4 элементов, чтобы избежать undefined в ячейках
  while (cParts.length < 4) cParts.push("");
  // 3. Распределяем для удобства вставки в верстку
  const vClient = cParts[0]; // Для нижней строки editComment
  const vOrder = cParts[1]; // Для div.tab-column.order
  const vGoods = cParts[2]; // Для div.tab-column.goods
  const vWork = cParts[3]; // Для div.tab-column.work

  const keyeditClient =
    data.Tf[no].c[25] && data.Tf[no].c[25].v ? data.Tf[no].c[25].v : "";
  const keyeditContact =
    data.Tf[no].c[26] && data.Tf[no].c[26].v ? data.Tf[no].c[26].v : "";
  const normazp =
    data.Tf[no].c[28] && data.Tf[no].c[28].v ? data.Tf[no].c[28].v : 0;
  const dataDiscountl =
    data.Tf[no].c[27] && data.Tf[no].c[27].v ? data.Tf[no].c[27].v : "";
  const dataDiscountr =
    data.Tf[no].c[37] && data.Tf[no].c[37].v ? data.Tf[no].c[37].v : "";
  const razom =
    data.Tf[no].c[29] && data.Tf[no].c[29].v ? data.Tf[no].c[29].v : 0;
  const zakupka =
    data.Tf[no].c[33] && data.Tf[no].c[33].v ? data.Tf[no].c[33].v : 0;
  const currency =
    data.Tf[no].c[34] && data.Tf[no].c[34].v
      ? data.Tf[no].c[34].v
      : savedCurrency;
  const currencyZp =
    data.Tf[no].c[38] && data.Tf[no].c[38].v
      ? data.Tf[no].c[38].v
      : savedCurrencyZp;

  // Основная часть модального окна
  document.querySelector("#commonModal .modal-title").innerHTML = title;
  document.querySelector(
    "#commonModal .modal-body"
  ).innerHTML = `<table style="width: 100%; margin-bottom: 20px; table-layout: fixed;"><tr>
    <td style="width: 60%;"><div class="editable editable-content" data-key="editNumplate" data-value="${keyeditNum}">${keyeditNum}</div></td><td style="min-width: 35%; max-width: 60%; width: 40%;">
    <select id="typeStatus" class="form-select form-select-sm" onchange="updateFieldsLockState(); saveChanges();">
  <option value="пропозиція">${t("statusProposal")}</option>
  <option value="в роботі">${t("statusInWork")}</option>
  <option value="виконано">${t("statusDone")}</option>
  <option value="в архів">${t("statusArchived")}</option>
  <option value="factura">${t("statusFactura")}</option>
</select>
  </td></tr><tr><td><div class="editable editable-content" data-key="editVin" data-value="${keyeditVin}">${keyeditVin}</div></td><td>
        <div style="display: flex; gap: 10px;">
        <select id="typeForm" class="form-select form-select-sm" onchange="saveChanges();">
        <option value="cash">${t("cash")}</option>
        <option value="cashless">${t("cashless")}</option>
      </select>      
      <select id="typeCurrency" class="form-select form-select-sm" onchange="saveChanges();">
  <option value="₴">${t("currencyUAH")}</option>
  <option value="$">${t("currencyUSD")}</option>
  <option value="€">${t("currencyEUR")}</option>
</select> 
        </div>
      </td>
    </tr>
    <tr>
    <td><div class="editable editable-content" data-key="editMileage" data-value="${keyeditMileage}">${keyeditMileage}</div></td>
      <td><div class="editable editable-content js-client-data" data-key="editClient" data-value="${keyeditClient}">${keyeditClient}</div></td>
    </tr>
    <tr>
    <td><div class="editable editable-content" data-key="editCarInfo" data-value="${keyeditCarInfo}">${keyeditCarInfo}</div></td>
    <td><div class="editable editable-content js-client-data" data-key="editContact" data-value="${keyeditContact}">${keyeditContact}</div></td>
    </tr>
  </table>

  <table style="width: 100%;">
  <tr class="table-header" style="border-color: transparent;">
  <td colspan="1" style="text-align: left; width: 40%;"></td>
  <td colspan="2" class="tab-column order" style="width: 15%; text-align: right;"><div class="editable editable-content" data-key="editdiscountl" data-value="${dataDiscountl}">${dataDiscountl}</div></td><td colspan="2" class="tab-column order" style="width: 15%; text-align: right;"><div class="editable editable-content" data-key="editdiscountr" data-value="${dataDiscountr}">${dataDiscountr}</div></td>
  <td colspan="3" class="tab-column goods d-none" style="width: 25%; text-align: right;"><div class="editable editable-content" data-key="editMarkup" data-value="${dataMarkupSet}">${dataMarkupSet}</div></td>
  <td colspan="3" class="tab-column work d-none" style="width: 25%; text-align: right;"><div class="editable editable-content" data-key="editPayrate" data-value="${dataPayrateSet}">${dataPayrateSet}</div></td>
  </tr>
  <tr class="table-header" style="border-color: transparent;">
  <td colspan="5" style="text-align: left; width: 45%;">
  <div class="tab-cell" style="display:flex;flex-direction:column;gap:4px;">
    <nav class="mb-0 tab-controls" aria-hidden="false">
<div class="nav nav-tabmodals nav-pills nav-sm" id="nav-tabmodal" role="tablist">
  <button class="nav-link active text-uppercase text-dark" data-tab="order" type="button" role="tab">${t(
    "orderTab"
  )}</button>
  <button class="nav-link text-uppercase text-secondary" data-tab="goods" type="button" role="tab">${t(
    "goodsTab"
  )}</button>
  <button class="nav-link text-uppercase text-secondary" data-tab="work" type="button" role="tab">${t(
    "workTab"
  )}</button>
</div>
    </nav>
    <!-- Этот блок хранит название активной вкладки. По умолчанию скрыт в UI, нужен для печати и (опционально) для простого отображения имени -->
    <div class="active-tab-name d-none" aria-hidden="true" style="font-weight:700; font-size:0.95rem;"></div>
  </div></td></tr></table>

<table id="headlines" class="table table-bordered table-sm mt-0">
  <thead><tr>
  <th style="width: 5%;">№</th>
  <th style="width: 40%;">${t("service")}</th>
  <th class="tab-column order" style="width: 7%;">info</th>
  <th class="tab-column order" style="width: 14%;">${t("priceService")}</th>
  <th class="tab-column order" style="width: 14%;">${t("priceGoods")}</th>
  <th class="tab-column goods d-none" style="width: 10%;">${t(
    "quantityShort"
  )}</th>
  <th class="tab-column goods d-none" style="width: 15%;">${t("article")}</th>
  <th class="tab-column goods d-none" style="width: 10%;">${t("cost")}</th>
  <th class="tab-column work d-none" style="width: 10%;">${t(
    "percentdone"
  )}</th>
  <th class="tab-column work d-none" style="width: 15%;">${t("executor")}</th>
  <th class="tab-column work d-none" style="width: 10%;">${t(
    "salaryNorm"
  )}</th>      
    </tr></thead>
  <tbody id="table-body"></tbody>
  <tfoot>
  <tr class="table-footer" style="border-color: transparent;">

    <td colspan="2" class="print-hide-value" style="text-align: left; vertical-align: top; word-wrap: break-word; width: 45%;">
    <div class="tab-column order editable" style="display: inline-block; width: 100%;" data-key="commentOrder" data-field="contextComment" data-value="${vOrder}">${
    vOrder || ""
  }</div>
    <div class="tab-column goods editable" style="display: inline-block; width: 100%;" data-key="commentGoods" data-field="contextComment" data-value="${vGoods}">${
    vGoods || ""
  }</div>
    <div class="tab-column work editable" style="display: inline-block; width: 100%;" data-key="commentWork" data-field="contextComment" data-value="${vWork}">${
    vWork || ""
  }</div>
    </td>

    <td colspan="9" style="text-align: right; vertical-align: top; padding-top: 12px; width: 55%;">
    <div class="tab-column order" style="display: inline-block; width: 100%;">
    <div id="sumCellDisplay"><strong>${razom} ${currency}</strong></div>
    </div>
    <div class="tab-column goods d-none" style="display: inline-block; width: 100%;">
    <div id="sumCostDisplay"><strong>${zakupka} ${currency}</strong></div>
    </div>
    <div class="tab-column work d-none" style="display: inline-block; width: 100%;">
    <div id="sumSalaryNormDisplay"><strong>${normazp} ${currencyZp}</strong></div>
    </div>
  </td>
  </tr>

  <tr class="client-comment-row" style="border-top: 1px solid #dee2e6;">
  <td colspan="2" class="text-end fw-bold" style="vertical-align: top; text-align: right; padding: 17px 10px 10px 10px;">
  <span style="font-size: 0.75em; color: #a0a0a0; line-height: 1;">${t(
    "ClientNotes"
  )}</span></td>
  <td colspan="9" class="editable" 
      data-key="editComment" 
      data-field="clientComment" 
      data-value="${vClient}"
      style="padding: 15px 10px 5px 10px;">
      ${vClient || ""}
  </td>
</tr>
  </tfoot>
</table>`;

  // 4. Обработка кликов через единую функцию switchToInput
  document.querySelectorAll(".editable").forEach((td) => {
    td.addEventListener("click", function () {
      // Получаем индекс ячейки (cellIndex)
      const cellIndex = td.cellIndex;

      // Вызываем общую функцию, передавая ячейку и её индекс
      switchToInput(td, cellIndex, saveChanges);
    });
  });

  const selectedStatus = (data.Tf[no].c[4]?.v || "пропозиція").toLowerCase();
  const selectedForm = data.Tf[no].c[30]?.v || "готів.";
  const selectedCurrency = data.Tf[no].c[34]?.v || "₴";
  document.getElementById("typeStatus").value = selectedStatus;
  document.getElementById("typeForm").value = selectedForm;
  document.getElementById("typeCurrency").value = selectedCurrency;

  document
    .getElementById("typeCurrency")
    .addEventListener("change", function () {
      document.querySelectorAll("[data-sum]").forEach((cell) => {
        const sumValue = cell.getAttribute("data-sum") || "";
        cell.textContent = `${sumValue} ${this.value}`;
      });
    });

  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = ""; // Очищаем тело таблицы
  //---------------------------------------------------------------------------------------------------
  // Если данных нет, создаем одну пустую строку
  const dataReg = data.Tf[no]?.c[36]?.v ?? "";

  const rows = dataReg ? dataReg.split("--") : ["| | | | | | | | |"];

  rows.forEach((row, index) => {
    const columns = row.split("|");
    const tr = createRow(index + 1, columns, saveChanges);
    tableBody.appendChild(tr);
  });

  updateRowNumbers(tableBody, saveChanges);
  updateAddRowButton(tableBody, saveChanges);

  // Обработка вкладок
  function activateTab(tab) {
    // 1. Если вкладка не передана явно, пытаемся узнать, какая открыта сейчас
    if (!tab) {
      const activeBtn = document.querySelector(
        "#nav-tabmodal .nav-link.active"
      );
      tab = activeBtn ? activeBtn.getAttribute("data-tab") : "order";
    }

    // Жесткие ограничения для ролей
    if (role === "store") {
      tab = "goods"; // Склад видит только товары
    } else if (role === "master") {
      tab = "work"; // Мастер видит только рабочий лист (услуги)
    }
    // nav links
    const navLinks = document.querySelectorAll(
      "#nav-tabmodal .nav-link[data-tab]"
    );
    navLinks.forEach((btn) => {
      btn.classList.remove(
        "active",
        "bg-success-subtle",
        "bg-warning-subtle",
        "bg-danger-subtle",
        "text-dark",
        "text-uppercase",
        "fw-bold"
      );
      btn.classList.add("text-secondary");
    });

    // Цвет для текущей вкладки
    let colorClass;
    if (tab === "order") colorClass = "bg-success-subtle";
    else if (tab === "goods") colorClass = "bg-warning-subtle";
    else if (tab === "work") colorClass = "bg-danger-subtle";

    const currentTabBtn = document.querySelector(
      `#nav-tabmodal .nav-link[data-tab="${tab}"]`
    );
    if (currentTabBtn) {
      currentTabBtn.classList.remove("text-secondary");
      currentTabBtn.classList.add(
        colorClass,
        "active",
        "text-dark",
        "text-uppercase",
        "fw-bold"
      );
    }

    // show/hide tab-column cells (works for th, td, tfoot td) by class presence
    document.querySelectorAll(".tab-column").forEach((col) => {
      const isVisible = col.classList.contains(tab);
      col.classList.toggle("d-none", !isVisible);
    });

    // color header <th> & footer <td> appropriately (base columns + visible tab columns)
    document.querySelectorAll("#headlines thead th").forEach((th) => {
      th.classList.remove(
        "bg-success-subtle",
        "bg-warning-subtle",
        "bg-danger-subtle"
      );
      const isBase = !th.classList.contains("tab-column");
      const isVisibleForTab = th.classList.contains(tab);

      if (tab === "order" && (isBase || isVisibleForTab))
        th.classList.add("bg-success-subtle");
      if (tab === "goods" && (isBase || isVisibleForTab))
        th.classList.add("bg-warning-subtle");
      if (tab === "work" && (isBase || isVisibleForTab))
        th.classList.add("bg-danger-subtle");
    });

    // footer coloring
    document.querySelectorAll("#headlines tfoot td").forEach((td) => {
      td.classList.remove(
        "bg-success-subtle",
        "bg-warning-subtle",
        "bg-danger-subtle"
      );
      const isBase = !td.classList.contains("tab-column");
      const isVisibleForTab = td.classList.contains(tab);

      if (tab === "order" && (isBase || isVisibleForTab))
        td.classList.add("bg-success-subtle");
      if (tab === "goods" && (isBase || isVisibleForTab))
        td.classList.add("bg-warning-subtle");
      if (tab === "work" && (isBase || isVisibleForTab))
        td.classList.add("bg-danger-subtle");
    });

    // update active-tab-name element (keeps nav intact in UI)
    const activeNameEl = document.querySelector(".tab-cell .active-tab-name");
    if (activeNameEl && currentTabBtn) {
      activeNameEl.textContent = currentTabBtn.textContent.trim();
      // keep it hidden during normal UI, but available for print function
      activeNameEl.classList.add("d-none");
    }
    // В самом конце функции activateTab
    const modalEl = document.querySelector("#commonModal");
    if (modalEl) {
      modalEl.setAttribute("data-active-tab", tab);
    }
  }

  // wire nav buttons (call once after modal HTML inserted)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest("#nav-tabmodal .nav-link");
    if (!btn) return;
    const tab = btn.dataset.tab;
    if (tab) activateTab(tab);
  });

  document.querySelectorAll("#nav-tabmodal .nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      activateTab(tab);
    });
  });

  const observer = new MutationObserver(() => {
    const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
    activateTab(activeTab); // применяем текущую вкладку к новой строке
  });
  observer.observe(tableBody, { childList: true });

  // вставляем кнопки в футер
  document.querySelector("#commonModal .modal-footer").innerHTML = buttons;
  document.getElementById("btn-save").onclick = function () {
    $("#commonModal").modal("hide");
  };

  // при рендере editOrder вызывай:
  const visitFolderName = data.Tf[no].c[3].v;
  const modalBody = document.querySelector("#commonModal .modal-body");
  initPhotoBlockForModal(modalBody, "edit", visitFolderName);

  updateFieldsLockState(); // Принудительно проверяем заблокированные поля и кнопки при открытии

  // показываем модалку
  const modalEl = document.getElementById("commonModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalEl.dataset.currentNo = no !== undefined && no !== null ? no : "";
  modal.show();
  updateSumFromTable(); // Автоматический пересчёт при открытии
  userSetup(); // скрываем опцию фактура если нет белого учета
  // Определяем стартовую вкладку в зависимости от роли
  let defaultTab;
  if (role === "store") {
    defaultTab = "goods";
  } else if (role === "master") {
    defaultTab = "work";
  } else {
    defaultTab = "order"; // Для менеджера и всех остальных
  }

  // Запускаем активацию нужной вкладки
  activateTab(defaultTab);
}

function getCombinedComments() {
  const getCleanText = (key) => {
    // Ищем элемент по data-key (commentOrder, editComment и т.д.)
    const el = document.querySelector(`[data-key="${key}"]`);
    if (!el) return "";

    // Приоритет: 1. Значение в открытом input, 2. Атрибут data-value, 3. textContent
    const activeInput = el.querySelector("input");
    let txt = activeInput
      ? activeInput.value
      : el.getAttribute("data-value") || el.textContent.trim();

    // Экранирование: удаляем разделители, чтобы не сломать структуру БД
    return txt.replace(/\|\|/g, "").replace(/^\?$/, "").trim();
  };

  // Собираем все 4 части в строгом порядке
  const vClient = getCleanText("editComment");
  const vOrder = getCleanText("commentOrder");
  const vGoods = getCleanText("commentGoods");
  const vWork = getCleanText("commentWork");

  // Формируем итоговую строку для колонки 23
  return `${vClient} || ${vOrder} || ${vGoods} || ${vWork}`;
}

function incomeModal() {
  const isExisting = no !== null && no !== undefined && data.Tf[no];
  const savedCurrency = localStorage.getItem("user_currency") || "₴";

  // 1. Извлечение данных из БД (data.Tf) по индексам колонок
  const visitNum = isExisting ? data.Tf[no].c[3]?.v : t("newPurchase");
  const dateF = isExisting
    ? `${data.Tf[no].c[0]?.f || ""} - ${data.Tf[no].c[1]?.f || ""}`
    : "";

  const keyDocNum =
    isExisting && data.Tf[no].c[13]?.v ? data.Tf[no].c[13].v : "";
  const keyDocDate =
    isExisting && data.Tf[no].c[5]?.f ? data.Tf[no].c[5].f : "";
  const keyDescription =
    isExisting && data.Tf[no].c[20]?.v ? data.Tf[no].c[20].v : "";
  const keySupplier =
    isExisting && data.Tf[no].c[25]?.v ? data.Tf[no].c[25].v : "";
  const keyContact =
    isExisting && data.Tf[no].c[26]?.v ? data.Tf[no].c[26].v : "";
  const keyComment =
    isExisting && data.Tf[no].c[23]?.v ? data.Tf[no].c[23].v : "";
  const zakupkaSum =
    isExisting && data.Tf[no].c[33]?.v ? data.Tf[no].c[33].v : 0;
  const currency =
    isExisting && data.Tf[no].c[34]?.v ? data.Tf[no].c[34].v : savedCurrency;

  // Формирование заголовка
  const title = `
  <div class="d-flex justify-content-between w-100 fs-6 fst-italic">
    <div class="text-start" id="visitNumberCell">${visitNum}</div>
    <div class="text-end">${dateF}</div>
  </div>`;

  // 1. Формируем дату для input/атрибута (ГГГГ-ММ-ДД)
  const isoDate = keyDocDate.includes(".")
    ? keyDocDate.split(".").reverse().join("-")
    : moment().format("YYYY-MM-DD");

  // 2. Формируем дату для отображения пользователю (ДД.ММ.ГГГГ)
  const displayDate = isoDate.split("-").reverse().join(".");

  // Отрисовка Modal Header & Body
  document.querySelector("#commonModal .modal-title").innerHTML = title;
  document.querySelector("#commonModal .modal-body").innerHTML = `
  <table style="width: 100%; margin-bottom: 20px; table-layout: fixed;">
    <tr>
      <td class="editable editable-content" data-key="docDate" data-value="${isoDate}">${displayDate}</td>
      <td style="width: 40%;">
        <select id="typeStatus" class="form-select form-select-sm" onchange="updateFieldsLockState(); saveIncomeChanges();">
          <option value="чернетка">${t("statusDraft")}</option>
          <option value="надходження">${t("statusIntake")}</option>
          <option value="в архив">${t("statusArchived")}</option>
        </select>
      </td>
    </tr>
    <tr>
      <td style="width: 60%;"><div class="editable editable-content" data-key="docNum" data-value="${keyDocNum}">${keyDocNum}</div></td>
      <td>
        <select id="typeCurrency" class="form-select form-select-sm" onchange="saveIncomeChanges();">
          <option value="₴">${t("currencyUAH")}</option>
          <option value="$">${t("currencyUSD")}</option>
          <option value="€">${t("currencyEUR")}</option>      
        </select> 
      </td>
    </tr>
    <tr>
      <td><div class="editable editable-content" data-key="description" data-value="${keyDescription}">${keyDescription}</div></td>
      <td><div class="editable editable-content" data-key="supplier" data-value="${keySupplier}">${keySupplier}</div></td>
    </tr>
    <tr>
      <td></td>
      <td><div class="editable editable-content" data-key="editContact" data-value="${keyContact}">${keyContact}</div></td>
    </tr>
  </table>

  <table style="width: 100%;">
    <tr class="table-header" style="border-color: transparent;">
      <td colspan="5" style="text-align: left; width: 45%;">
        <nav class="mb-0 tab-controls">
          <div class="nav nav-tabmodals nav-pills nav-sm" id="nav-tabmodal" role="tablist">
            <button class="nav-link d-none" data-tab="order" type="button" role="tab">${t(
              "orderTab"
            )}</button>
            <button class="nav-link active text-uppercase text-dark fw-bold" data-tab="goods" type="button" role="tab">${t(
              "goodsTab"
            )}</button>
            <button class="nav-link d-none" data-tab="work" type="button" role="tab">${t(
              "workTab"
            )}</button>
          </div>
        </nav>
      </td>
    </tr>
  </table>

  <table id="headlines" class="table table-bordered table-sm mt-0">
    <thead>
      <tr>
        <th style="width: 5%;">№</th>
        <th style="width: 40%;">${t("goods")}</th>
        <th class="tab-column goods" style="width: 10%;">${t(
          "quantityShort"
        )}</th>
        <th class="tab-column goods" style="width: 15%;">${t("article")}</th>
        <th class="tab-column goods" style="width: 10%;">${t("cost")}</th>
        <th class="tab-column order d-none"></th><th class="tab-column order d-none"></th>
        <th class="tab-column work d-none"></th><th class="tab-column work d-none"></th><th class="tab-column work d-none"></th>
      </tr>
    </thead>
    <tbody id="table-body"></tbody>
    <tfoot>
      <tr class="table-footer" style="border-color: transparent;">
        <td colspan="2" class="editable" data-key="editComment" style="text-align: left; vertical-align: top; width: 45%;">
          ${keyComment}
        </td>
        <td colspan="9" class="tab-column goods" style="text-align: right; vertical-align: top; padding-top: 20px;">
          <strong id="sumCostDisplay" style="display: block; width: 100%;">${zakupkaSum} ${currency}</strong>
        </td>
      </tr>
    </tfoot>
  </table>`;

  // 3. Заполнение таблицы из колонки 36
  const tableBody = document.getElementById("table-body");
  const dataReg = isExisting ? data.Tf[no].c[36]?.v || "" : "";
  const rowsData = dataReg ? dataReg.split("--") : ["| | | | | | | | |"];

  rowsData.forEach((rowStr, index) => {
    tableBody.appendChild(
      createRow(index + 1, rowStr.split("|"), saveIncomeChanges)
    );
  });

  updateRowNumbers(tableBody, saveIncomeChanges);
  updateAddRowButton(tableBody, saveIncomeChanges);

  // Логика вкладок
  function activateTab(tab) {
    if (!tab) tab = "goods";
    document
      .querySelectorAll("#nav-tabmodal .nav-link")
      .forEach((btn) =>
        btn.classList.toggle("active", btn.dataset.tab === tab)
      );
    document.querySelectorAll(".tab-column").forEach((col) => {
      col.classList.toggle("d-none", !col.classList.contains(tab));
    });
    document
      .querySelectorAll("#headlines thead th, #headlines tfoot td")
      .forEach((el) => {
        el.classList.remove(
          "bg-success-subtle",
          "bg-warning-subtle",
          "bg-danger-subtle"
        );
        if (tab === "goods") el.classList.add("bg-warning-subtle");
      });
  }

  // MutationObserver для авто-нумерации и кнопок
  const observer = new MutationObserver(() => {
    activateTab("goods");
    updateRowNumbers(tableBody, saveIncomeChanges);
    updateAddRowButton(tableBody, saveIncomeChanges);
  });
  observer.observe(tableBody, { childList: true });

  // 4. Инициализация кликов (switchToInput)
  document.querySelectorAll(".editable").forEach((td) => {
    td.addEventListener("click", function () {
      switchToInput(td, td.cellIndex, saveIncomeChanges);
    });
  });

  // Установка значений Select-ов
  document.getElementById("typeStatus").value = isExisting
    ? data.Tf[no].c[4]?.v || "чернетка"
    : "чернетка";
  document.getElementById("typeCurrency").value = currency;

  // 5. Кнопки футера модального окна
  document.querySelector("#commonModal .modal-footer").innerHTML = `
    <button type="button" class="btn ${
      isExisting ? "btn-primary" : "btn-outline-primary"
    }" id="btn-save">
      ${isExisting ? t("close") : t("createBtn")}
    </button>`;

  const saveBtn = document.getElementById("btn-save");

  saveBtn.onclick = function () {
    if (!isExisting) {
      // Блокируем кнопку СРАЗУ, чтобы исключить повторный клик до срабатывания таймаута
      saveBtn.disabled = true;
      saveIncomeChanges(true);
    } else {
      $("#commonModal").modal("hide");
    }
  };

  activateTab("goods");
  const modalElement = document.getElementById("commonModal");
  // Сохраняем: если это создание нового (no undefined), запишем пустую строку
  modalElement.dataset.currentNo = no !== undefined && no !== null ? no : "";
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

function collectIncomeData() {
  const getText = (key) => {
    const el = document.querySelector(`[data-key="${key}"]`);
    if (!el) return "";
    return el.textContent.trim() || el.getAttribute("data-value") || "";
  };

  // 1. Исправляем ключи: в модалке у вас "supplier" и "description"
  const supplierName = getText("supplier");

  // 2. Очистка суммы (totalSum). Убираем валюту и пробелы
  let rawSum = document.getElementById("sumCostDisplay")?.textContent || "0";
  // Регулярное выражение оставит только цифры и точку/запятую
  const totalSum = rawSum.replace(/[^\d.,]/g, "").replace(",", ".");

  // Расчет количества
  // Проверяем на undefined или null
  const isNewDoc = no === undefined || no === null;

  const purchaseCount =
    data.Tf.filter((row) => row.c[25]?.v === supplierName).length +
    (isNewDoc ? 1 : 0);

  const tableBody = document.getElementById("table-body");
  const updatedData = [];
  tableBody.querySelectorAll("tr").forEach((row) => {
    const firstCell = row.querySelector("td:first-child");
    if (firstCell?.querySelector("button")?.textContent !== "×") return;
    const cells = row.querySelectorAll("td");
    const rowData = [];
    for (let i = 1; i <= 10; i++) {
      rowData.push(cells[i]?.textContent?.trim() || "");
    }
    updatedData.push(rowData.join("|"));
  });

  return {
    docDate: getText("docDate"), // Ключ совпадает
    docNum: getText("docNum"), // Ключ совпадает
    status: document.getElementById("typeStatus")?.value || "чернетка",
    description: getText("description"), // БЫЛО "editCarInfo" -> СТАЛО "description"
    editComment: getText("editComment"),
    supplier: supplierName, // БЫЛО "editClient" -> СТАЛО "supplier"
    contact: getText("editContact"), // Ключ совпадает
    totalSum: totalSum,
    currency: document.getElementById("typeCurrency")?.value || "USD",
    purchaseCount: purchaseCount,
    tableData: updatedData.join("--"),
    editor: localStorage.getItem("user_email") || "",
    sName: sName,
    tasks: typeof tasks !== "undefined" ? tasks : "",
    userTimeZone: typeof userTimeZone !== "undefined" ? userTimeZone : "",
  };
}

function updateSumFromTable() {
  const tableBody = document.getElementById("table-body");
  const discountInl = document.querySelector('[data-key="editdiscountl"]');
  const discountInR = document.querySelector('[data-key="editdiscountr"]');
  const dataMarkupInEl = document.querySelector('[data-key="editMarkup"]');
  const dataPayrateInEl = document.querySelector('[data-key="editPayrate"]');

  if (!tableBody)
    return {
      sumLeft: 0,
      sumRight: 0,
      sumTotal: 0,
    };

  let sumLeft = 0; // цена услуги
  let sumRight = 0; // цена товара
  let sumCost = 0; // себестоимость
  let sumSalaryNorm = 0; // норма ЗП

  // Значения редактируемых полей
  let markup =
    parseFloat(dataMarkupInEl?.textContent?.trim()?.replace(",", ".")) || "";
  let payrate =
    parseFloat(dataPayrateInEl?.textContent?.trim()?.replace(",", ".")) || "";

  // Скидка услуга
  let discountl =
    parseFloat(discountInl?.textContent?.trim()?.replace(",", ".")) || "";
  if (discountl > 100) discountl = 100;
  if (discountl < 0) discountl = 0;
  if (discountInl)
    discountInl.textContent = discountl.toString().replace(".", ",");

  // Скидка товар
  let discountr =
    parseFloat(discountInR?.textContent?.trim()?.replace(",", ".")) || "";
  if (discountr > 100) discountr = 100;
  if (discountr < 0) discountr = 0;
  if (discountInR)
    discountInR.textContent = discountr.toString().replace(".", ",");

  const discountMultiplierL = 1 - discountl / 100;
  const discountMultiplierR = 1 - discountr / 100;

  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    const parseCell = (index) => {
      const cell = cells[index];
      if (!cell) return 0;
      const val = parseFloat(cell.textContent.trim().replace(",", "."));
      return isNaN(val) ? 0 : val;
    };

    // Себестоимость и расчет цены товара при пустой ячейке
    const costVal = parseCell(7);
    const productCell = cells[4];

    if (
      !isNaN(costVal) &&
      costVal > 0 &&
      !productCell.textContent.trim() &&
      markup != ""
    ) {
      const productPrice = costVal * (1 + markup / 100);
      productCell.textContent = formatNumber(productPrice);
    }

    // Цена услуги и расчет нормы ЗП
    const serviceVal = parseCell(3);
    const salaryNormCell = cells[10];

    if (payrate > 0) {
      if (!isNaN(serviceVal) && serviceVal > 0) {
        const serviceDiscounted = serviceVal * discountMultiplierL;
        const salaryNormPrice = serviceDiscounted * (payrate / 100);
        salaryNormCell.textContent = formatNumber(salaryNormPrice);
        sumSalaryNorm += salaryNormPrice;
      } else {
        // если значение услуги пустое или равно 0 → очищаем ячейку нормы ЗП
        salaryNormCell.textContent = "";
      }
    } else {
      // Ручной ввод: берём то, что в ячейке
      sumSalaryNorm += parseCell(10);
    }

    sumLeft += serviceVal;
    sumRight += parseCell(4);
    sumCost += parseCell(7);
  });

  const sumLeftDiscounted = sumLeft * discountMultiplierL;
  const sumRightDiscounted = sumRight * discountMultiplierR;
  const sumTotal = sumLeftDiscounted + sumRightDiscounted;

  const currency = document.getElementById("typeCurrency").value;
  const savedCurrencyZp = localStorage.getItem("user_currencyZp") || currency;

  // 1. Обновляем промежуточные итоги под колонками (без скидок)
  /*const subLeftCell = document.getElementById("subTotalLeftDisplay");
  const subRightCell = document.getElementById("subTotalRightDisplay");
  if (subLeftCell)
    subLeftCell.textContent = `${formatNumber(sumLeft)} ${currency}`;
  if (subRightCell)
    subRightCell.textContent = `${formatNumber(sumRight)} ${currency}`;*/

  // 2. Формируем расширенный блок итоговой суммы
  const sumCell = document.getElementById("sumCellDisplay");
  if (sumCell) {
    let htmlContent = "";

    // Если есть хоть какая-то скидка, показываем общую сумму ДО скидки
    if (discountl > 0 || discountr > 0) {
      const totalBeforeDiscount = sumLeft + sumRight;
      htmlContent += `
            <div style="color: #777;">
            ${t("total")}: ${formatNumber(totalBeforeDiscount)} ${currency}
            </div>`;
    }

    // Детализация скидки на услуги
    if (discountl > 0) {
      const savedL = sumLeft - sumLeftDiscounted;
      htmlContent += `<div style="color: #777; font-size: 0.8em;">${t(
        "services"
      )} - ${discountl}%: -${formatNumber(savedL)} ${currency}</div>`;
    }

    // Детализация скидки на товары
    if (discountr > 0) {
      const savedR = sumRight - sumRightDiscounted;
      htmlContent += `<div style="color: #777; font-size: 0.8em;">${t(
        "goods"
      )} - ${discountr}%: -${formatNumber(savedR)} ${currency}</div>`;
    }

    // Финальная сумма (razom)
    htmlContent += `
        <div>
            <span>${t("amountDue")}:</span> 
            <strong>${formatNumber(sumTotal)} ${currency}</strong>
        </div>`;

    // НДС (если есть)
    if (typeof vat !== "undefined" && vat > 0) {
      const vatAmount = (sumTotal * vat) / (100 + vat);
      htmlContent += `<div style="font-size:0.85em; color:#555; font-style: italic;">
            ${t("includingVAT")}: ${formatNumber(vatAmount)} ${currency}
        </div>`;
    }

    sumCell.innerHTML = htmlContent;
    sumCell.setAttribute("data-sum", formatNumber(sumTotal));
  }

  // Себестоимость
  const sumcostCell = document.getElementById("sumCostDisplay");
  if (sumcostCell) {
    sumcostCell.setAttribute("data-sum", formatNumber(sumCost));
    sumcostCell.textContent = `${formatNumber(sumCost)} ${currency}`;
  }

  // Норма ЗП
  const sumsalaryNormCell = document.getElementById("sumSalaryNormDisplay");
  if (sumsalaryNormCell) {
    sumsalaryNormCell.setAttribute("data-sum", formatNumber(sumSalaryNorm));
    sumsalaryNormCell.textContent = `${formatNumber(
      sumSalaryNorm
    )} ${savedCurrencyZp}`;
  }

  return {
    sumLeft: formatNumber(sumLeftDiscounted),
    sumRight: formatNumber(sumRightDiscounted),
    sumTotal: formatNumber(sumTotal),
    sumCost: formatNumber(sumCost),
    sumSalaryNorm: formatNumber(sumSalaryNorm),
  };

  function formatNumber(num) {
    let n = parseFloat(num);
    if (isNaN(n)) return "";
    let cleanNum = parseFloat(n.toFixed(2));
    return cleanNum.toString().replace(".", ",");
  }
}
//---------------------------------------------------------------------------------------------------
function createRow(rowNumber, columns, saveCallback = saveChanges) {
  const tr = document.createElement("tr");

  // --- Первая колонка: № + кнопка удаления/добавления ---
  const numberCell = document.createElement("td");
  const value0 = columns[0]?.trim() || "";

  if (value0) {
    const spanNumber = document.createElement("span");
    spanNumber.textContent = rowNumber;
    numberCell.appendChild(spanNumber);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "p-0", "text-danger", "ms-2");
    deleteButton.textContent = "×";
    deleteButton.onclick = () => {
      tr.remove();
      updateRowNumbers(document.getElementById("table-body"), saveCallback);
      updateAddRowButton(document.getElementById("table-body"), saveCallback);

      const saveButton = document.getElementById("btn-save");
      saveButton.textContent = t("save");
      saveButton.classList.remove("btn-primary");
      saveButton.classList.add("btn-danger");
      saveButton.onclick = () => saveCallback(true);
    };

    numberCell.appendChild(deleteButton);
  } else {
    const addButton = document.createElement("button");
    addButton.classList.add("text-success", "btn", "p-0", "add-row-btn");
    addButton.innerHTML = `<i class="bi bi-plus-square-dotted fs-5"></i>`;
    addButton.onclick = () => {
      const targetTd = tr.querySelector("td:nth-child(2)");
      if (targetTd) switchToInput(targetTd, 0, saveCallback);
    };
    numberCell.appendChild(addButton);
  }

  tr.appendChild(numberCell);

  // --- Вторая колонка: всегда видимая ---
  const mainTd = document.createElement("td");
  mainTd.textContent = value0;
  mainTd.dataset.value = value0;
  mainTd.addEventListener("click", () =>
    switchToInput(mainTd, 0, saveCallback)
  );
  tr.appendChild(mainTd);

  // --- Остальные 10 колонок (вкладки) ---
  const colClasses = [
    "order",
    "order",
    "order", // 3-5: Δ, ціна послуги, ціна товару
    "goods",
    "goods",
    "goods", // 6-8: Кіл-ть, Артикул, Собівартість
    "work",
    "work",
    "work", // 9-11: t, Виконавець, Норма з/п
  ];

  for (let i = 1; i <= 9; i++) {
    const td = document.createElement("td");
    const val = columns[i]?.trim() || "";
    td.textContent = val;
    td.dataset.value = val;

    // === НОВЫЙ БЛОК: КЛАСС ДЛЯ СКРЫТИЯ ПРИ ПЕЧАТИ ===
    if (i === 6 || i === 9) {
      td.classList.add("print-hide-value");
    }
    // ===============================================

    if (role === "store" && i === 6) {
      td.classList.add("cell-store-hidden");
    } else if (role === "master" && i === 9) {
      td.classList.add("cell-master-readonly");
    }

    td.classList.add("tab-column", colClasses[i - 1]);
    td.addEventListener("click", () => switchToInput(td, i, saveCallback));
    tr.appendChild(td);
  }

  return tr;
}

// Функция для переключения на поле ввода
function switchToInput(td, colIndex, saveCallback = saveChanges) {
  // 1. БЛОКИРОВКИ
  const statusValue = document.getElementById("typeStatus")?.value;
  const isLockedStatus = [
    "виконано",
    "factura",
    "надходження",
    "в архів",
  ].includes(statusValue);
  if (isLockedStatus || activated === false) return;
  if (
    (role === "store" && ![4, 5].includes(colIndex)) ||
    (role === "master" && ![7, 8].includes(colIndex))
  )
    return;

  const payrateEl = document.querySelector('[data-key="editPayrate"]');
  const payrate =
    parseFloat(payrateEl?.textContent?.trim()?.replace(",", ".")) || 0;
  if (colIndex === 9 && payrate > 0) return;
  if (td.querySelector("input")) return;

  // Данные
  const dataKey = td.getAttribute("data-key");
  const currentValue =
    td.getAttribute("data-value") || td.textContent.trim() || "";

  // ----- Особая обработка для колонк


  if (colIndex === 8) {
    // ---
    const datalist = document.getElementById("executor-s");
    let executors = [];
    if (datalist) {
      executors = Array.from(datalist.options)
        .map((opt) => (opt.value || opt.textContent || "").trim())
        .filter(Boolean)
        .flatMap((val) => val.split("/"))
        .map((s) => s.trim())
        .filter(Boolean);
    }
    executors = [...new Set(executors)];

    const originalText = td.textContent || "";
    const selectedVals = currentValue
      ? currentValue
          .split("/")
          .map((s) => s.trim())
          .filter(Boolean)
.filter((name) => !name.startsWith("__"));
      : [];

const archivedInCell = selectedVals.filter((v) => v.startsWith("__"));
const activeSelectedInCell = selectedVals.filter((v) => !v.startsWith("__"));

    // --- создаём меню ---
    const menu = document.createElement("div");
    menu.className = "executor-menu border rounded p-2 bg-white shadow-sm";
    menu.style.position = "absolute";
    menu.style.zIndex = "2000";
    menu.style.minWidth = "220px";
    menu.style.visibility = "hidden"; // сначала скрыто

    // контейнер со списком чекбоксов
    const listContainer = document.createElement("div");
    listContainer.style.overflowY = "auto";

    const baseTs = Date.now().toString(36);
    function addExecutorOption(exec) {
      if (!exec) return;
      const item = document.createElement("div");
      item.className = "form-check d-flex align-items-center gap-2 mb-1";

      const chk = document.createElement("input");
      chk.className = "form-check-input";
      chk.type = "checkbox";
      chk.value = exec;
      chk.id = `executor_chk_${baseTs}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
if (activeSelectedInCell.includes(exec)) chk.checked = true;

      const lbl = document.createElement("label");
      lbl.className = "form-check-label ms-2 mb-0";
      lbl.setAttribute("for", chk.id);
      lbl.textContent = exec;

      item.appendChild(chk);
      item.appendChild(lbl);
      listContainer.appendChild(item);
    }
    executors.forEach(addExecutorOption);
    menu.appendChild(listContainer);

    if (executors.length) {
      const hr = document.createElement("hr");
      hr.className = "my-2";
      menu.appendChild(hr);
    }

    // поле ввода + кнопка "+"
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group input-group-sm mb-2";

    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.placeholder = t("addItemPlaceholder");
    customInput.className = "form-control";

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "btn btn-outline-secondary";
    plusBtn.textContent = "+";

    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = customInput.value.trim();
      if (!val) return;
      addExecutorOption(val);
      customInput.value = "";
    });

    inputGroup.appendChild(customInput);
    inputGroup.appendChild(plusBtn);
    menu.appendChild(inputGroup);

    // кнопки управления
    const btnRow = document.createElement("div");
    btnRow.className = "d-flex gap-2 justify-content-end";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-sm btn-secondary";
    cancelBtn.textContent = t("cancelBtn");

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-sm btn-primary";
    addBtn.textContent = t("addButton");

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(addBtn);
    menu.appendChild(btnRow);

    // --- вставляем меню в modal-body ---
    const modal = td.closest(".modal");
    const modalBody = modal ? modal.querySelector(".modal-body") : null;
    if (!modalBody) {
      td.appendChild(menu); // fallback
    } else {
      if (!modalBody.classList.contains("position-relative")) {
        modalBody.classList.add("position-relative");
      }
      modalBody.appendChild(menu);

      // вычисляем позицию
      const tdRect = td.getBoundingClientRect();
      const bodyRect = modalBody.getBoundingClientRect();
      const tdOffsetTop = tdRect.top - bodyRect.top + modalBody.scrollTop;
      const tdOffsetLeft = tdRect.left - bodyRect.left + modalBody.scrollLeft;

      // высота элементов под спис
      const fixedPartH = 90;

      // доступное пространство свер
      const spaceBelow = bodyRect.height - (tdRect.bottom - bodyRect.top);
      const spaceAbove = tdRect.top - bodyRect.top;

      let maxListH;
      let topPx;

      if (spaceBelow >= spaceAbove) {
        maxListH = Math.max(spaceBelow - fixedPartH - 16, 40);
        topPx = tdOffsetTop + td.offsetHeight;
      } else {
        maxListH = Math.max(spaceAbove - fixedPartH - 16, 40);
        topPx = tdOffsetTop - (maxListH + fixedPartH);
      }

      listContainer.style.maxHeight = `${maxListH}px`;
      listContainer.style.overflowY = "auto";

      // корректировка по горизонтали
      let leftPx = tdOffsetLeft;
      const menuRect = menu.getBoundingClientRect();
      const rightOverflow = leftPx + menuRect.width - modalBody.clientWidth;
      if (rightOverflow > 0) leftPx = Math.max(8, leftPx - rightOverflow - 8);
      if (leftPx < 8) leftPx = 8;

      // финальные координаты
      menu.style.top = `${Math.round(topPx)}px`;
      menu.style.left = `${Math.round(leftPx)}px`;
      menu.style.visibility = "visible";
    }

    // --- логика закрытия ---
    const closeMenu = (commit, newValue) => {
      document.removeEventListener("click", outsideClickHandler, true);
      document.removeEventListener("keydown", escHandler);
      if (menu.parentNode) menu.parentNode.removeChild(menu);

      if (commit) {
        const finalValue = newValue || "";
        td.textContent = finalValue;
        td.dataset.value = finalValue;
        td.setAttribute("data-value", finalValue);
        updateRowNumbers(document.getElementById("table-body"), saveCallback);
        updateAddRowButton(document.getElementById("table-body"), saveCallback);
        updateSumFromTable();
        saveCallback();
      } else {
        td.textContent = originalText || "";
      }
    };

    const collectChosen = () => {
      const chosen = Array.from(
        listContainer.querySelectorAll("input[type=checkbox]:checked")
      ).map((c) => c.value);
      const manualVal = customInput.value.trim();
      if (manualVal) chosen.push(manualVal);
        const finalArray = [...new Set([...archivedInCell, ...chosen])];
  return finalArray.filter(Boolean);
    };

    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const newValue = collectChosen().join(" / ");
      closeMenu(true, newValue);
    });

    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMenu(false);
    });

    const outsideClickHandler = (e) => {
      if (menu.contains(e.target) || td.contains(e.target)) return;
      closeMenu(false);
    };
    const escHandler = (e) => {
      if (e.key === "Escape") closeMenu(false);
    };

    setTimeout(() => {
      document.addEventListener("click", outsideClickHandler, true);
      document.addEventListener("keydown", escHandler);
    }, 0);

    return;
  }



  // ----- стандартная логика дл
  const input = document.createElement("input");
  input.classList.add("form-control", "form-control-sm");

  input.type = dataKey === "docDate" ? "date" : "text";

  if (dataKey === "docDate") {
    input.style.width = "150px";
    // Конвертируем ДД.ММ.ГГГГ -> ГГГГ-ММ-ДД для input type="date"
    input.value = currentValue.includes(".")
      ? currentValue.split(".").reverse().join("-")
      : currentValue;
  } else {
    input.value = currentValue;
    input.style.width = "100%";
  }
  td.innerHTML = "";
  td.appendChild(input);

  // 6. АКТИВАЦИЯ И КАЛЕНДАРЬ
  setTimeout(() => {
    input.focus();
    if (dataKey !== "docDate") input.select();

    if (input.type === "date" && input.showPicker) {
      try {
        input.showPicker();
      } catch (e) {}
    }
  }, 50);

  if (dataKey !== "editComment") {
    if (colIndex === 0) {
      input.setAttribute("list", "service-regulation");
    } else if (colIndex === 5) {
      input.setAttribute("list", "article-s");
    } else if (colIndex === 1) {
      input.setAttribute("list", "info-s");
    }
  }
  if (colIndex === 0) {
    input.addEventListener("input", () => {
      const selected = servicesData.find(
        (service) => service.serviceName === input.value.trim()
      );
      if (selected) {
        const tr = td.closest("tr");
        const cells = tr.querySelectorAll("td");
        if (price) {
          cells[2].textContent = selected.quantity || "";
          cells[3].textContent = selected.servicePrice || "";
          cells[4].textContent = selected.itemPrice || "";
          cells[5].textContent = selected.quantity2 || "";
          cells[6].textContent = selected.article || "";
          cells[7].textContent = selected.costPrice || "";
          cells[8].textContent = selected.qTime || "";
          cells[9].textContent = selected.executor || "";
          cells[10].textContent = selected.normSalary || "";
        } else {
          cells[2].textContent = selected.quantity || "";
          cells[3].textContent = selected.servicePrice || "";
          cells[4].textContent = selected.itemPrice || "";
          cells[8].textContent = selected.qTime || "";
          cells[9].textContent = selected.executor || "";
          cells[10].textContent = selected.normSalary || "";
        }
      }
    });
  }
  // --- articul ---
  if (colIndex === 5) {
    input.addEventListener("input", () => {
      const articleVal = input.value.trim();
      if (!articleVal) return;

      // Ищем данные по артикулу в глобальном массиве
      const selected = servicesData.find((s) => s.article === articleVal);

      if (selected) {
        const tr = td.closest("tr");
        const cells = tr.querySelectorAll("td");

        // 1. Заполняем "Услуга / Товар" (cells[1]), только если там ПУСТО
        const serviceCell = cells[1];
        if (!serviceCell.textContent.trim()) {
          const name = selected.serviceName || "";
          serviceCell.textContent = name;
          serviceCell.dataset.value = name;
        }

        // 2. Расчет и заполнение "Себестоимости" (cells[7] соответствует td:nth-child(8))
        const costCell = cells[7];
        const qtyCell = cells[5]; // Колонка "Количество" (index 4)

        if (costCell) {
          // Данные из базы
          const dbTotalCost = parseNumber(selected.costPrice);
          const dbTotalQty = parseNumber(selected.quantity2); // За сколько штук цена в базе

          // Текущее количество в таблице (если пусто, parseNumber вернет 1)
          const currentQty = parseNumber(qtyCell.textContent);

          // Вычисляем цену за единицу (1 шт)
          const unitPrice =
            dbTotalQty > 0 ? dbTotalCost / dbTotalQty : dbTotalCost;

          // Итоговая сумма: цена за 1 шт * текущее количество
          const finalCalculatedCost = unitPrice * currentQty;
          const finalValue = Number(finalCalculatedCost.toFixed(2)).toString();

          // Сохраняем данные
          costCell.dataset.value = finalValue;

          costCell.textContent = finalValue;
        }
      }
    });
  }

  input.addEventListener("change", () => input.blur());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();

      const tableBody = document.getElementById("table-body");
      const currentRow = td.closest("tr");

      // ПРОВЕРКА: Находимся ли мы внутри основной таблицы с позициями
      const isInMainTable = tableBody && tableBody.contains(td);
      if (isInMainTable) {
        const nextRow = currentRow.nextElementSibling;
        // Проверяем если следующей строки нет ИЛИ в следующей строке находится кнопка добавления
        const isLastDataRow = !nextRow || nextRow.querySelector(".add-row-btn");

        if (isLastDataRow) {
          setTimeout(() => document.querySelector(".add-row-btn")?.focus(), 0);
        }
      }
    }
  });

  input.addEventListener("blur", () => {
    // 1. ИСПОЛЬЗУЕМ let, чтобы иметь возможность изменить формат даты
    let newValue = input.value.trim();
    const oldValue = td.getAttribute("data-value") || "";

    // Обрабатываем Контакт и Имя клиента только при выходе из ячейки
    if (dataKey === "editContact" || dataKey === "editClient") {
      newValue = normalizeEditValue(dataKey, newValue, input);
    }

    // 2. Конвертируем дату из ГГГГ-ММ-ДД (от input) в ДД.ММ.ГГГГ (для таблицы)
    if (dataKey === "docDate" && newValue.includes("-")) {
      newValue = newValue.split("-").reverse().join(".");
    }

    // 3. Сравниваем и сохраняем
    if (newValue !== oldValue) {
      td.textContent = newValue; // Теперь в ячейке будет текст с точками
      td.setAttribute("data-value", newValue);
      td.dataset.value = newValue;

      // --- ТВОЯ ЛОГИКА ПЕРЕСЧЕТА (динамические строки) ---
      if (colIndex === 4) {
        const tr = td.closest("tr");
        const oldQty = parseNumber(oldValue);
        const newQty = parseNumber(newValue);
        const costCell = tr.querySelector("td:nth-child(8)");

        if (costCell) {
          const currentCostRaw = costCell.textContent.trim();
          if (currentCostRaw !== "" && currentCostRaw !== "0") {
            const currentTotalCost = parseNumber(currentCostRaw);
            const validOldQty = oldQty > 0 ? oldQty : 1;
            const unitCost = currentTotalCost / validOldQty;
            const calculatedCost = unitCost * newQty;
            const finalValue = Number(calculatedCost.toFixed(2)).toString();

            costCell.textContent = finalValue;
            costCell.dataset.value = finalValue;
          }
        }
      }
      // --------------------------------------

      // 4. ТВОИ ФУНКЦИИ ОБНОВЛЕНИЯ
      updateRowNumbers(document.getElementById("table-body"), saveCallback);
      updateAddRowButton(document.getElementById("table-body"), saveCallback);
      updateSumFromTable();
      // ПРЕДОХРАНИТЕЛЬ: автосохранение заблокировано
      if (!no) {
        return;
      } // ВЫХОДИМ, не вызывая saveIncomeChanges

      saveCallback(); // Вызываем сохранение в БД
    } else {
      // Если ничего не изменилось, просто возвращаем старое значение в текст
      td.textContent = oldValue;
    }
  });

  input.addEventListener("input", () => {
    // Форматируем только номер авто и VIN в реальном времени
    if (dataKey === "editNumplate" || dataKey === "editVin") {
      normalizeEditValue(dataKey, input.value, input);
    }
    const saveButton = document.getElementById("btn-save");
    saveButton.textContent = t("save");
    saveButton.classList.remove("btn-primary");
    saveButton.classList.add("btn-danger");
    saveButton.onclick = () => {
      saveCallback(true);
    };
  });
}
//---------------------------------------------------------------------------------------------------
// Очистка при закрытии модального окна
document
  .getElementById("commonModal")
  .addEventListener("hide.bs.modal", function (event) {
    if (event.target.id === "commonModal") {
      no = undefined;
      delete event.target.dataset.currentNo;
    }
  });
// Вспомогательная функция для получения числа из строки (напр. "2 шт" -> 2)
function parseNumber(val) {
  const num = parseFloat(
    String(val)
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );
  return isNaN(num) ? 1 : num;
}

// === Перенумерация строк ===
function updateRowNumbers(tableBody, saveCallback = saveChanges) {
  let counter = 1;
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    const regulationCell = row.querySelector("td:nth-child(2)");
    const firstCell = row.querySelector("td:first-child");
    if (regulationCell && regulationCell.textContent.trim()) {
      const span = document.createElement("span");
      span.textContent = counter++;

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("btn", "p-0", "text-danger");
      deleteButton.textContent = "×";
      deleteButton.onclick = () => {
        const statusValue = document.getElementById("typeStatus")?.value;
        if (
          statusValue === "виконано" ||
          statusValue === "factura" ||
          statusValue === "надходження" ||
          statusValue === "в архів" ||
          activated === false
        )
          return; // блокировка удаления
        row.remove();
        updateSumFromTable();
        updateRowNumbers(tableBody, saveCallback);
        updateAddRowButton(tableBody, saveCallback);
        const saveButton = document.getElementById("btn-save");
        saveButton.textContent = t("save");
        saveButton.classList.remove("btn-primary");
        saveButton.classList.add("btn-danger");
        // Изменяем функциональность кнопки на Зберегти
        saveButton.onclick = () => {
          saveCallback(true);
        };
        saveCallback();
      };

      firstCell.innerHTML = "";
      firstCell.appendChild(span);
      firstCell.appendChild(deleteButton);
    }
  });
}
//---------------------------------------------------------------------------------------------------
// === Добавление строки при необходимости ===
function updateAddRowButton(tableBody, saveCallback = saveChanges) {
  const rows = tableBody.querySelectorAll("tr");
  const hasEmptyReg = Array.from(rows).some((row) => {
    const td = row.querySelector("td:nth-child(2)");
    return td && td.textContent.trim() === "";
  });

  if (!hasEmptyReg) {
    const newRow = createRow(null, ["", "", "", ""], saveCallback);
    tableBody.appendChild(newRow);
  }
}

//---------------------------------------------------------------------------------------------------
// срааботка при изменении селектов
function updateFieldsLockState() {
  const statusSelect = document.getElementById("typeStatus");
  const typeForm = document.getElementById("typeForm");
  const typeCurrency = document.getElementById("typeCurrency");

  if (statusSelect) {
    const currentStatus = statusSelect.value;

    // Условие блокировки (на тех же условиях, что и для фото)
    const lockFields = [
      "factura",
      "виконано",
      "надходження",
      "в архів",
    ].includes(currentStatus);

    if (typeForm) typeForm.disabled = lockFields;
    if (typeCurrency) typeCurrency.disabled = lockFields;

    // Статус блокируется только на factura
    statusSelect.disabled = currentStatus === "factura";

    // СИНХРОНИЗАЦИЯ С ФОТО-БЛОКОМ
    // Вызываем render(), чтобы кнопки добавления и удаления обновились мгновенно
    if (typeof render === "function") {
      render();
    }
  }
}
// Функция для сохранения изменений
// Глобальные флаги
let isSaving = false;
let pendingChanges = false;
let saveTimeout = null;

function saveChanges() {
  // Отложенный запуск (debounce)
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (isSaving) {
      pendingChanges = true;
      return;
    }

    isSaving = true;
    pendingChanges = false;

    const getText = (key) =>
      document.querySelector(`[data-key="${key}"]`)?.textContent.trim() || "";

    const editor = localStorage.getItem("user_email") || "";
    const { sumLeft, sumRight, sumTotal, sumCost, sumSalaryNorm } =
      updateSumFromTable();

    const discountl = getText("editdiscountl");
    const discountr = getText("editdiscountr");
    const markup = getText("editMarkup");
    const payrate = getText("editPayrate");
    const editComment = getCombinedComments();
    const editClient = getText("editClient");
    const editContact = getText("editContact");
    const editCarInfo = getText("editCarInfo");
    const editNumplate = getText("editNumplate");
    const editVin = getText("editVin");
    const editMileage = getText("editMileage");

    const status = document.getElementById("typeStatus")?.value || "";
    const form = document.getElementById("typeForm")?.value || "";
    const currency = document.getElementById("typeCurrency")?.value || "";
    const currencyZp = localStorage.getItem("user_currencyZp") || currency;

    const tableBody = document.getElementById("table-body");
    const rows = tableBody.querySelectorAll("tr");
    const updatedData = [];

    rows.forEach((row) => {
      const firstCell = row.querySelector("td:first-child");
      const isAddRow = firstCell?.querySelector("button")?.textContent !== "×";
      if (isAddRow) return;

      const cells = row.querySelectorAll("td");
      const rowData = [];
      for (let i = 1; i < Math.min(cells.length, 11); i++) {
        rowData.push(cells[i]?.textContent?.trim() || "");
      }
      updatedData.push(rowData.join("|"));
    });

    const newDataString = updatedData
      .filter((row) => row.trim() !== "")
      .join("--");

    const modal = document.getElementById("commonModal");
    const activeNo = modal.dataset.currentNo; // Берем индекс из окна

    const rowNumber = Number(activeNo) + 2;
    const action = "updateVisit";

    const body = `editor=${encodeURIComponent(
      editor
    )}&sName=${encodeURIComponent(sName)}&editComment=${encodeURIComponent(
      editComment
    )}&editClient=${encodeURIComponent(
      editClient
    )}&editContact=${encodeURIComponent(
      editContact
    )}&editCarInfo=${encodeURIComponent(
      editCarInfo
    )}&editNumplate=${encodeURIComponent(
      editNumplate
    )}&editVin=${encodeURIComponent(editVin)}&editMileage=${encodeURIComponent(
      editMileage
    )}&sumLeft=${encodeURIComponent(sumLeft)}&sumRight=${encodeURIComponent(
      sumRight
    )}&sumTotal=${encodeURIComponent(sumTotal)}&sumCost=${encodeURIComponent(
      sumCost
    )}&sumSalaryNorm=${encodeURIComponent(
      sumSalaryNorm
    )}&discountl=${encodeURIComponent(
      discountl
    )}&discountr=${encodeURIComponent(discountr)}&markup=${encodeURIComponent(
      markup
    )}&payrate=${encodeURIComponent(payrate)}&status=${encodeURIComponent(
      status
    )}&form=${encodeURIComponent(form)}&currency=${encodeURIComponent(
      currency
    )}&currencyZp=${encodeURIComponent(currencyZp)}&tasks=${encodeURIComponent(
      tasks
    )}&userTimeZone=${encodeURIComponent(
      userTimeZone
    )}&rowNumber=${encodeURIComponent(rowNumber)}&value=${encodeURIComponent(
      newDataString
    )}&action=${encodeURIComponent(action)}`;

    const saveButton = document.getElementById("btn-save");
    saveButton.textContent = t("saving");
    saveButton.classList.remove("btn-danger");
    saveButton.classList.add("btn-warning");
    saveButton.onclick = () => {};

    fetch(myApp, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    })
      .then((response) => {
        if (!response.ok)
          throw new Error("Ошибка при обновлении данных на сервере");
        return response.json();
      })
      .then((result) => {
        // Простая замена текста в ячейке
        if (result.visitNumber) {
          const visitCell = document.getElementById("visitNumberCell");
          if (visitCell) visitCell.textContent = result.visitNumber;
        }
        saveButton.textContent = t("close");
        saveButton.classList.remove("btn-warning");
        saveButton.classList.remove("btn-info");
        saveButton.classList.add("btn-primary");
        saveButton.onclick = () => $("#commonModal").modal("hide");
        loadTasks();
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        saveButton.textContent = t("error");
        saveButton.classList.remove("btn-warning");
        saveButton.classList.add("btn-info");
        saveButton.onclick = () => saveChanges();
      })
      .finally(() => {
        isSaving = false;
        if (pendingChanges) saveChanges();
      });
  }, 100); // debounce 500мс
}

function saveIncomeChanges(isManual = false) {
  const modal = document.getElementById("commonModal");
  const activeNo = modal.dataset.currentNo; // Берем индекс из памяти модалки
  // Если номера нет И это не ручной клик по кнопке — блокируем отправку
  if (!no && !isManual) return;
  const saveButton = document.getElementById("btn-save");
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (isSaving) {
      pendingChanges = true;
      return;
    }

    isSaving = true;
    pendingChanges = false;

    const info = collectIncomeData(); // Наша функция сбора данных
    const rowToSend =
      activeNo !== undefined && activeNo !== "" ? Number(activeNo) + 2 : "";

    // Формируем тело запроса
    const body = new URLSearchParams({
      action: "addIncome", // ВСЕГДА addIncome для срабатывания свитча в doPost
      rowNumber: rowToSend, // Если no есть — это обновление
      docDate: info.docDate,
      docNum: info.docNum,
      status: info.status,
      description: info.description,
      editComment: info.editComment,
      supplier: info.supplier,
      contact: info.contact,
      totalSum: info.totalSum,
      currency: info.currency,
      purchaseCount: info.purchaseCount,
      tableData: info.tableData,
      editor: info.editor,
      sName: info.sName,
      tasks: info.tasks,
      userTimeZone: info.userTimeZone,
    }).toString();

    if (saveButton) {
      saveButton.textContent = t("saving");
      saveButton.classList.remove("btn-primary", "btn-danger", "btn-info");
      saveButton.classList.add("btn-warning");
      saveButton.disabled = true;
    }

    fetch(myApp, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          // Синхронизируем локальный индекс 'no' с сервером
          no = result.no;
          document.getElementById("commonModal").dataset.currentNo = result.no; // обновляем dataset
          // Обновляем визуальный номер документа в модалке
          if (result.visitNumber) {
            const visitCell = document.getElementById("visitNumberCell");
            if (visitCell) visitCell.textContent = result.visitNumber;
          }

          saveButton.textContent = t("close");
          saveButton.classList.remove("btn-warning", "btn-danger");
          saveButton.classList.add("btn-primary");
          saveButton.disabled = false;
          saveButton.onclick = () => $("#commonModal").modal("hide");

          loadTasks(); // Фоновое обновление таблицы
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        saveButton.textContent = t("error");
        saveButton.classList.remove("btn-warning", "btn-primary");
        saveButton.classList.add("btn-danger");
        saveButton.disabled = false;
        saveButton.onclick = () => saveIncomeChanges();
      })
      .finally(() => {
        isSaving = false;
        if (pendingChanges) saveIncomeChanges();
      });
  }, 100);
}

function printVisitFromModal() {
  const modal = document.querySelector("#commonModal .modal-body");
  if (!modal) {
    console.error("Модальное содержимое не найдено.");
    return;
  }
  // обновить в дом значения селект
  modal.querySelectorAll("select").forEach((sel) => {
    [...sel.options].forEach((opt) => opt.removeAttribute("selected"));
    if (sel.selectedIndex >= 0) {
      sel.options[sel.selectedIndex].setAttribute("selected", "selected");
    }
  });

  // клонируем
  const clone = modal.cloneNode(true);
  let activeBtn = clone.querySelector("#nav-tabmodal .nav-link.active");
  const activeTab = (activeBtn && activeBtn.dataset.tab) || "order";

  if (activeTab === "goods" || activeTab === "work") {
    clone.querySelectorAll(".js-client-data").forEach((el) => {
      el.style.display = "none";
      // Скрываем и родительскую ячейку, чтобы не было пустых рамок
      const parentTd = el.closest("td");
      if (parentTd) parentTd.style.display = "none";
    });
  }
  // Удаляем последнюю строку только в таблице с перечнем работ/товаров
  clone.querySelector("#table-body tr:last-child")?.remove();
  // убрать фотоблок
  clone.querySelector("#photoBlock").style.display = "none";

  // === ДОБАВЛЕНИЕ КЛАССА К ТАБЛИЦЕ ИНФОРМАЦИИ ===
  // Ищем первую таблицу, которая не является .table-header (обычно это таблица с данными авто/клиента)
  const infoTable = clone.querySelector("table:not(.table-header)");
  if (infoTable) {
    infoTable.classList.add("no-border-info");
  }
  // =================================================
  // replace selects with text
  clone.querySelectorAll("select").forEach((selectEl) => {
    const text = selectEl.options[selectEl.selectedIndex]?.text || "";
    const span = document.createElement("span");
    span.textContent = text;
    selectEl.replaceWith(span);
  });

  // replace inputs with text
  clone.querySelectorAll("input").forEach((inputEl) => {
    const span = document.createElement("span");
    if (inputEl.type === "checkbox" || inputEl.type === "radio") {
      span.textContent = inputEl.checked ? "✓" : "";
    } else {
      span.textContent = inputEl.value;
    }
    inputEl.replaceWith(span);
  });

  // remove interactive buttons
  clone.querySelectorAll("button").forEach((btn) => btn.remove());

  if (!activeBtn)
    activeBtn = document.querySelector("#nav-tabmodal .nav-link.active");

  const activeTabName =
    (activeBtn && activeBtn.textContent && activeBtn.textContent.trim()) ||
    activeTab;

  // replace the nav cell content with the tab name (so in print result tabs aren't shown)
  const tabCell = clone.querySelector(
    '.table-header td[colspan="5"] .tab-cell'
  );
  if (tabCell) {
    tabCell.innerHTML = `<div style="font-weight:700;">${activeTabName}</div>`;
  } else {
    // fallback: try to find first .table-header td
    const firstCell = clone.querySelector(".table-header td");
    if (firstCell)
      firstCell.innerHTML = `<div style="font-weight:700;">${activeTabName}</div>`;
  }

  // Show only columns that belong to active tab: remove other .tab-column elements
  clone.querySelectorAll(".tab-column").forEach((el) => {
    if (!el.classList.contains(activeTab)) el.remove();
    else el.classList.remove("d-none");
  });

  // remove any remaining tab controls/tooling
  clone
    .querySelectorAll(".tab-controls, #nav-tabmodal")
    .forEach((n) => n.remove());

  // Header with company info (keeps original variables from your scope)
  const headerHTML = `
    <table style="width: 100%; margin-bottom: 20px; border: none;">
      <tr style="border: none;">
        <td style="width: 120px; vertical-align: top; border: none;">
          ${
            typeof logo !== "undefined" && logo
              ? `<img src="${logo}" alt="Logo" style="max-width: 100px;">`
              : ""
          }
        </td>
        <td style="text-align: left; padding-left: 20px; border: none;">
          <div style="font-weight: bold; font-size: 1.2em;">${
            typeof sName !== "undefined" ? sName : ""
          }</div>
          <div>${typeof address !== "undefined" ? address : ""}</div>
          <div>${typeof sContact !== "undefined" ? sContact : ""}</div>
        </td>
        <td style="text-align: right; vertical-align: top; border: none;">
          <div><strong>№ ${data?.Tf?.[no]?.c?.[3]?.v ?? ""}</strong></div>
          <div>${data?.Tf?.[no]?.c?.[0]?.f ?? ""} – ${
    data?.Tf?.[no]?.c?.[1]?.f ?? ""
  }</div>
        </td>
      </tr>
    </table>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = headerHTML + clone.innerHTML;

  // Добавляем реквизиты только если вкладка "замовлення"
  if (activeBtn && activeBtn.dataset.tab === "order" && recvisit) {
    const recDiv = document.createElement("div");
    recDiv.style.cssText =
      "margin-top:20px; text-align:right; font-size:1em; color:#333; white-space:pre-line; border-top:1px solid #ccc; padding-top:4px;";
    recDiv.textContent = recvisit.replace(/;/g, "\n");

    wrapper.appendChild(recDiv);
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return console.error("Не удалось открыть новое окно.");

  const styles = `
  <style>
  .print-hide-value { color: transparent !important; }
  #sumCostDisplay, #sumSalaryNormDisplay { display: none !important; }
    body{font-family:Arial,sans-serif;padding:20px;color:#000}
    table{border-collapse:collapse;margin-bottom:20px;width:100%}
    td,th{border:1px solid #ccc;padding:6px;vertical-align:top}
    .table-header td, .table-footer td {border: none !important;}
    .table-header td, .client-comment-row td {border: none !important;}
    select,button,input{display:none!important}

    /* Выравнивание по центру для всех колонок начиная с 3-й */
#table-body td:nth-child(n+3) { 
    text-align: center !important; 
}

    /* === НОВЫЕ СТИЛИ ДЛЯ ИНФОРМАЦИОННОЙ ТАБЛИЦЫ === */
 .no-border-info td { 
 border: none !important; /* Убираем границы у всех ячеек */
 padding: 4px 6px; 
}

 /* Делаем текст в левых ячейках жирным */
 .no-border-info tr td:nth-child(1) { 
 font-weight: bold; 
 width: 80px; /* Фиксируем ширину для лучшего вида */
 }
 .no-border-info tr td:nth-child(3) { 
 font-weight: bold; 
 width: 80px; /* Фиксируем ширину для лучшего вида */
 }
 /* =================================================== */
  
    .editable:hover {
      background-color: #e9f5ff;
      cursor: pointer;
    }
    .editable-content {
      display: inline-flex;
      gap: 4px;
      box-sizing: border-box;
    }
    .editable-content[data-key="editdiscountl"]::before {
      content: "service ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editdiscountl"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editdiscountr"]::before {
      content: "product ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editdiscountr"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editMarkup"]::before {
      content: "add ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editMarkup"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editPayrate"]::before {
      content: "salary ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editPayrate"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editCarInfo"]::before {
      content: "car: ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editNumplate"]::before {
      content: "num: ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editVin"]::before {
      content: "vin: ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editMileage"]::before {
      content: "m/km: ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editContact"]::before {
      content: "tel: ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editClient"]::before {
      content: "name: ";
      opacity: 0.5;
      font-size: 0.9em;
    }
  </style>
  `;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head><title>${t("visitDocument")}</title>${styles}</head>
      <body>
        ${wrapper.innerHTML}
        <script>window.onload = function(){ window.print(); }</script>
      </body>
    </html>`);
  printWindow.document.close();
}
//---------------------------------------------------------------------------------------------------
function addReportModal() {
  var title = t("createReport");
  var buttons = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${t(
    "cancelBtn"
  )}</button>
  <button type="button" class="btn btn-primary" onclick="clientAddReport()">${t(
    "createBtn"
  )}</button>`;

  $("#commonReport .modal-header .modal-title").html(title);
  $("#commonReport .modal-body").html(function () {
    return `<label for="typeReport" class="form-label">${t(
      "reportType"
    )}</label>
    <select id="typeReport" name="typeReport" class="form-select" onchange="addInputClient()" list="characterR">
    <option value="За виконаними замовленнями">${t(
      "reportCompletedOrders"
    )}</option>
    <option value="Фінансовий (базовий)">${t("reportFinancial")}</option>
    <option value="Популярні продажі">${t("reportPopularSales")}</option>
    <option value="За проданими товарами">${t("reportSoldGoods")}</option>
    <option value="По клієнту">${t("reportByClient")}</option>
    <option value="По виконавцям">${t("reportByExecutors")}</option>

  </select>  
<br><div id="addInput"></div><br>
<div class="row"><div class="col">
<label for="sdate" class="form-label">${t("startDate")}</label>
<input id="sdate" name="sdate" class="form-control" type="date" placeholder="" onchange="">
</div><div class="col">
<label for="pdate" class="form-label">${t("endDate")}</label>
<input id="pdate" name="pdate" class="form-control" type="date" placeholder="" onchange="">
</div></div>`;
  });
  $("#commonReport .modal-footer").html(buttons);
  // показываем модалку
  const modal = new bootstrap.Modal(document.getElementById("commonReport"));
  modal.show();
  userSetup();
}

function addInputClient() {
  var inClient = `<div class="form-control"><label for="byclient" class="form-label">${t(
    "enterClientName"
  )}</label>
<input id="byclient" name="byclient" class="form-control form-control-sm" type="text" value="" onchange="" list="character7">
<datalist id="character7"></datalist></div>`;
  var typeReport = $("#typeReport").val();
  if (typeReport == "По клієнту") {
    $("#addInput").html(inClient);
  } else {
    $("#addInput").html("");
  }
  rebuildClientDatalist();
}

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_picture");
  localStorage.removeItem("user_data");
  document.getElementById("planeButton").classList.remove("d-none"); // показать кнопку входа
  document.getElementById("logoutButton").style.display = "none"; // скрыть кнопку выхода
  location.reload();
});

/**
 * Обрабатывает JWT-токен, полученный от Google после успешного входа пользователя.
 * @param {Object} response Объект ответа, содержащий JWT-токен.
 */
function handleCredentialResponse(response) {
  // 1. Вызываем фиксацию конверсии в Google Ads
  if (typeof gtag_report_conversion === "function") {
    gtag_report_conversion();
  }
  // `response.credential` содержит JWT-токен (JSON Web Token).
  // Этот токен нужно отправить на ваш сервер для верификации и аутентификации.
  const idToken = response.credential;
  console.log("Получен ID Token:", idToken);

  // --- НОВЫЙ БЛОК: Связываем Google с Firebase ---
  const credential = firebase.auth.GoogleAuthProvider.credential(idToken);

  firebase
    .auth()
    .signInWithCredential(credential)
    .then((result) => {
      console.log("Firebase Auth синхронизирован успешно!", result.user);
      // Теперь request.auth != null в правилах Storage будет работать!
    })
    .catch((error) => {
      console.error("Ошибка синхронизации с Firebase Auth:", error);
    });
  // ----------------------------------------------

  var userName = "";
  var userEmail = "";
  var userPicture = "";
  try {
    // пользователь авторизован в Google но пока не в Service Control
    const decodedToken = parseJwt(idToken);
    console.log("Декодированный токен (сторона клиента):", decodedToken);

    // Пример извлечения данных пользователя:
    userName = decodedToken.name;
    userEmail = decodedToken.email;
    userPicture = decodedToken.picture;

    console.log(`Имя пользователя: ${userName}`);
    console.log(`Email пользователя: ${userEmail}`);
    console.log(`Фото пользователя: ${userPicture}`);

    // Здесь вы можете обновить UI, чтобы показать, что пользователь вошел в систему
    document.getElementById("welcomeMessage").innerText = userName;
    document.getElementById("planeButton").classList.add("d-none"); // скрыть кнопку входа
    document.getElementById("logoutButton").style.display = "block"; // показат кнопку выхода
  } catch (error) {
    // ответ от Google есть но нет обработки
    console.error("Ошибка при декодировании токена на клиенте:", error);
  }
  $("#offcanvasNavbar").offcanvas("show");
  document.getElementById(
    "offcanvasNavbarLabel"
  ).innerHTML = `<span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>`;
  // 2. ОТПРАВКА JWT-токена на ваш сервер для верификации и создания сессии
  sendTokenToServer(userName, userEmail, userPicture)
    .then((serverResponse) => {
      console.log("Ответ от сервера после отправки токена:", serverResponse);
      // с сервера
      const defaultlang = serverResponse?.defaultlang;
      // Если сервер успешно аутентифицировал пользователя и создал сессию,
      // вы можете перенаправить пользователя или обновить страницу.
      // Сохраняем в localStorage
      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_email", userEmail);
      localStorage.setItem("user_picture", userPicture);
      localStorage.setItem("user_data", JSON.stringify(serverResponse));
      // вызов функции
      changeLanguage(defaultlang);
      getUserData(serverResponse);
    })
    .catch((error) => {
      console.error("Ошибка при отправке токена на сервер:", error);
      // Обработка ошибок, например, отображение сообщения пользователю
    });
}

/**
 * Вспомогательная функция для декодирования JWT-токена на стороне клиента.
 * ВНИМАНИЕ: Не используйте для верификации безопасности! Только для отображения.
 * @param {string} token JWT-токен
 * @returns {Object} Декодированный payload токена
 */
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

/**
 * Функция для отправки JWT-токена на ваш сервер.
 * @param {string} idToken JWT-токен, полученный от Google.
 * @returns {Promise<Object>} Promise, который разрешается с ответом от сервера.
 */
//
async function sendTokenToServer(userName, userEmail, userPicture) {
  var action = "getUser";
  const body = `userName=${encodeURIComponent(
    userName
  )}&userEmail=${encodeURIComponent(
    userEmail
  )}&userPicture=${encodeURIComponent(
    userPicture
  )}&userTimeZone=${encodeURIComponent(
    userTimeZone
  )}&action=${encodeURIComponent(action)}`;

  const response = await fetch(myApp, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Ошибка аутентификации на сервере.");
  }
  return response.json();
}

function renderEmailGroup(element, title, emailString) {
  if (!emailString || emailString.trim() === "") return;

  const emails = emailString
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e);
  if (emails.length === 0) return;

  // Заголовок
  const header = document.createElement("strong");
  header.textContent = title + ": ";
  element.appendChild(header);

  // Список email'ов
  emails.forEach((email, index) => {
    const name = email.split("@")[0];
    const link = document.createElement("a");
    link.href = `mailto:${email}`;
    link.textContent = name;
    link.style.marginRight = "6px";

    element.appendChild(link);

    // Добавить запятую, если не последний
    if (index < emails.length - 1) {
      element.appendChild(document.createTextNode(", "));
    }
  });

  // Перенос строки после группы
  element.appendChild(document.createElement("br"));
}

function getUserData(serverResponse) {
  if (serverResponse.status === "success") {
    document.getElementById("authButtons").classList.remove("d-none"); // показать кнопки действия
    document.getElementById("landing").classList.add("d-none");
    document.getElementById("workspace").classList.remove("d-none"); // показать рабочую область
    document.getElementById("phoneBlock").classList.remove("d-none"); // показать телефон поддержки
    document.getElementById("youUsers").classList.remove("d-none"); // показать телефон поддержки
    // Обрабатываем ответ
    var usersDiv = document.getElementById("users-email");

    renderEmailGroup(usersDiv, "manager", serverResponse.managerUsers);
    renderEmailGroup(usersDiv, "master", serverResponse.masterUsers);
    renderEmailGroup(usersDiv, "store", serverResponse.storeUsers);
    renderEmailGroup(usersDiv, "admin", serverResponse.adminUsers);
    role = serverResponse.role;
    sName = serverResponse.sName;
    vat = serverResponse.vat;
    activated = serverResponse.activated;
    //var toDate = serverResponse.toDate;
    // 🔹 Отключаем кнопку если аккаунт запрещён
    if (activated == false) {
      const btn = document.getElementById("btn-startVisit");
      if (btn) {
        btn.disabled = true;
      }
      $("#dateend").html(
        `<div class="alert alert-danger" role="alert">Зверніться до технічної підтримки для активації вашого облікового запису.</div>`
      );
      $("#offcanvasNavbar").offcanvas("show");
    }
    tasks = serverResponse.tasks;
    price = serverResponse.price;
    address = serverResponse.address;
    sContact = serverResponse.sContact;
    logo = serverResponse.logo;
    localStorage.setItem("user_currency", serverResponse.currency);
    localStorage.setItem("user_currencyZp", serverResponse.currencyZp);
    calendL = serverResponse.calendL;
    vfolder = serverResponse.vfolder;
    rfolder = serverResponse.rfolder;
    dataMarkup = serverResponse.dataMarkup;
    dataPayrate = serverResponse.dataPayrate;
    recvisit = serverResponse.recvisit;
    document.getElementById("offcanvasNavbarLabel").innerHTML = sName; // Отображаем sName
    // Нормализуем вход
    const normRole = (role || "").toString().trim().toLowerCase();
    // Словарь соответствий
    const ROLE_MAP = {
      manager: "Manager",
      master: "Master",
      store: "Store",
      admin: "admin",
    };
    // Результат
    const roleText =
      ROLE_MAP[normRole] ??
      (normRole ? normRole[0].toUpperCase() + normRole.slice(1) : "");
    document.getElementById("role").innerText = roleText;
    var priceLink = document.getElementById("price-link");
    if (price && price.trim() !== "") {
      priceLink.href = price;
      priceLink.classList.remove("d-none");
      priceLink.style.display = "inline"; // на случай если элемент скрыт
    } else {
      priceLink.textContent = "";
      priceLink.removeAttribute("href");
      priceLink.style.display = "none"; // скрыть, если ссылки нет
    }
    loadTasks();
    hideOffcanvas();
    userSetup();
  } else {
    document.getElementById("authButtons").classList.add("d-none"); // скрыть кнопки действия
    // Обрабатываем ошибочный ответ

    $("#dateend").html(
      `<div class="alert alert-danger" role="alert">${serverResponse.message}</div>`
    );
    document.getElementById("offcanvasNavbarLabel").innerHTML = ``;
    document.getElementById("landing").classList.remove("d-none");
    document.getElementById("workspace").classList.add("d-none");
    initLanding();
  }
  if (serverResponse.success) {
  }
}

function userSetup() {
  // 1. Скрытие функционала фактур
  if (!vat) {
    document
      .getElementById("nav-invoice-tab")
      ?.style.setProperty("display", "none");
    document
      .querySelector('#typeStatus option[value="factura"]')
      ?.style.setProperty("display", "none");
  }

  // 2. Внедрение CSS (Разделение логики по классам)
  const style = document.createElement("style");
  style.innerHTML = `
      /* СТИЛЬ ДЛЯ STORE (Полное скрытие данных) */
      .cell-store-hidden {
          background-color: #f8f9fa !important;
          color: transparent !important;
          user-select: none !important;
          pointer-events: none !important;
      }

      /* СТИЛЬ ДЛЯ MASTER (Данные видны, но редактирование запрещено) */
      .cell-master-readonly {
          background-color: #f8f9fa !important;
          color: #6c757d !important; /* Серый текст, показывающий неактивность */
          pointer-events: none !important;
          user-select: all; /* Позволяем мастеру хотя бы скопировать текст, если нужно */
      }

      /* Специфические элементы store */
      .is-store #sumCostDisplay { 
          visibility: hidden !important; 
      }
  `;
  document.head.appendChild(style);

  // Добавим класс к body для управления CSS через контекст (опционально, для чистоты)
  if (role === "store") document.body.classList.add("is-store");

  // 3. Управление вкладками аналитики
  if (role === "store") {
    ["nav-price-tab", "nav-execut-tab"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  } else if (role === "master") {
    ["nav-stock-tab", "nav-price-tab"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    // Переключение на "Исполнители"
    document.getElementById("nav-stock-tab")?.classList.remove("active");
    document.getElementById("stockTable")?.classList.remove("show", "active");

    const execBtn = document.getElementById("nav-execut-tab");
    const execCont = document.getElementById("executorsTable");
    if (execBtn && execCont) {
      execBtn.classList.add("active");
      execCont.classList.add("show", "active");
    }
  }

  // 4. Ограничение отчетов
  const reportSelect = document.getElementById("typeReport");
  if (reportSelect) {
    const mapping = { store: "За проданими товарами", master: "По виконавцям" };
    const allowed = mapping[role];
    if (allowed) {
      Array.from(reportSelect.options).forEach(
        (opt) => (opt.disabled = opt.value !== allowed)
      );
      if (reportSelect.value !== allowed) {
        reportSelect.value = allowed;
        reportSelect.dispatchEvent(new Event("change"));
      }
    }
  }
}
function hideOffcanvas() {
  const offcanvasEl = document.getElementById("offcanvasNavbar");
  if (!offcanvasEl) return;

  const offcanvas =
    bootstrap.Offcanvas.getInstance(offcanvasEl) ||
    new bootstrap.Offcanvas(offcanvasEl);
  setTimeout(() => {
    //$("#offcanvasNavbar").offcanvas("hide");
    offcanvas.hide();
  }, 1000);
}
