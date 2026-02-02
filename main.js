//var wlink = window.location.search.replace("?", "");
var allLang = ["ua", "ru", "en", "de", "es"];
// язык из hash
var hashLang = window.location.hash.substr(1);
var myApp =
  "https://script.google.com/macros/s/AKfycbzPB-pJCRotIFHi2_8PUZRd6Z6tG9ybBu9mjQhJHiyyJDwl2zn8MpWDow7pFpY6SGy5/exec";
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
  const LOCAL_STORAGE_KEY = "app_version";

  // 👤 Инициализация интерфейса
  const name = localStorage.getItem("user_name");
  const userData = localStorage.getItem("user_data");
  changeLanguage(hashLang);

  if (userData) {
    document.getElementById("welcomeMessage").innerText = name;
    document.getElementById("signInButton").classList.add("d-none");
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
  "nav-invoice-tab": ["factura"],
};

var uStatus = [];

const allTriggerTabs = document.querySelectorAll(
  "#nav-tab button, #warehouse-tab button"
);

allTriggerTabs.forEach((triggerEl) => {
  triggerEl.addEventListener("click", (event) => {
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
    await googleQuery(tasks, "0", "D:AP", "SELECT *");
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

function tasksTable() {
  const tasksDiv = document.getElementById("tasksTableDiv");
  if (!tasksDiv.classList.contains("active")) {
    return; // вкладка не активна
  }

  const getVal = (row, col) =>
    data.Tf[row] && data.Tf[row].c[col] && data.Tf[row].c[col].v !== undefined
      ? data.Tf[row].c[col].v
      : "";

  const getValF = (row, col) =>
    data.Tf[row] && data.Tf[row].c[col] && data.Tf[row].c[col].f
      ? data.Tf[row].c[col].f
      : getVal(row, col);

  const currency = localStorage.getItem("user_currency") || "";
  const isStore = role === "store";

  // Меняем заголовок колонки
  const lastColHeader = isStore ? t("purchases") : t("total");

  const th = `<tr class="border-bottom border-info">
      <th class="text-secondary">№</th>
      <th class="text-secondary">${t("thDateTime")}</th>
<th class="text-secondary text-truncate" style="max-width: 70px;">${t(
    "thNumber"
  )}</th>
<th class="text-secondary text-truncate" style="max-width: 170px;">${t(
    "thCarData"
  )}</th>
<th class="text-secondary text-truncate" style="min-width: 120px; max-width: 180px;">${t(
    "thClient"
  )}</th>
<th class="text-secondary text-truncate" style="max-width: 80px;">${t(
    "thContact"
  )}</th>
<th class="text-secondary">${lastColHeader}</th></tr>`;

  let tr = "",
    trr = "";

  const startIndex = Math.max(0, data.Tf.length - 1000);

  for (let i = data.Tf.length - 1; i >= startIndex; i--) {
    // работа с data.Tf[i]
    const status = getVal(i, 4);
    const own = getVal(i, 24);
    const number = getVal(i, 3);
    const range = `${getValF(i, 0)} - ${getValF(i, 1)}`;
    const numplate = getVal(i, 13);
    const name = getVal(i, 20);
    const client = getVal(i, 25);
    const contact = getVal(i, 26);

    // sum: переводим cash/cashless через t()
    const payType = getVal(i, 30);
    const sum = `${t(payType)} ${getVal(i, 29)} ${getVal(i, 34)}`; // Общая сумма
    const costSum = ""; // `${getVal(i, 33)} ${currency}`; // Себестоимость для кладовщика

    const lastColData = isStore ? costSum : sum;

    let rowClass = "",
      rowTitle = "";
    if (status === "в роботі")
      (rowClass = "table-success"), (rowTitle = t("statusInWork"));
    else if (status === "пропозиція") rowTitle = t("statusProposal");
    const linkColor = uStatus === "в архів" ? "link-secondary" : "link-dark";

    const rowHTML = `
      <tr class="${rowClass}" title="${rowTitle}" name="${i}">
        <td><button class="send-button link-badge" name="${i}">${number}</button></td>
        <td>${range}</td>
        <td class="text-truncate" style="max-width: 70px;">${numplate}</td>
        <td class="text-truncate" style="max-width: 170px;">${name}</td>
        <td class="text-truncate" style="min-width: 120px; max-width: 180px;">${client}</td>
        <td class="text-truncate" style="max-width: 100px;">
          <a href="tel:+${contact}" class="${linkColor}">${contact}</a>
        </td>
        <td>${lastColData}</td>
      </tr>`;

    if (status == uStatus && own == sName) {
      tr += rowHTML;
    } else if (
      status == "пропозиція" &&
      uStatus == "в роботі" &&
      own == sName
    ) {
      trr += rowHTML;
    }
  }

  // Вставляем готовую таблицу
  tasksDiv.innerHTML = `
    <table id="myTable" class="table table-hover table-sm table-responsive text-truncate">
      <thead>${th}</thead>
      <tbody>${tr}${trr}</tbody>
    </table>`;
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
  <th class="text-secondary col-idx">№</th>
  <th class="text-secondary col-art">${t("article")}</th>
  <th class="text-secondary col-name">${t("name")}</th>
  <th class="text-secondary col-unit">${t("unit")}</th>
  <th class="text-secondary col-cost">${t("costPrice")}</th>
  <th class="text-secondary col-stock">${t("balance")}</th>
  <th class="text-secondary col-services">${t("servicesList")}</th>
  <th class="text-secondary col-usage">${t("usageCount")}</th>
</tr>`;

  let tr = "";
  rows.forEach((r) => {
    // Формируем список услуг: каждая услуга обернута для возможности горизонтального скролла
    const servicesHtml = r.services.length
      ? r.services.map((s) => `- ${s}`).join("</br>")
      : "";

    tr += `<tr>
      <td class="col-idx">${r.idx}</td>
      <td class="col-art">${r.article}</td>
      <td class="col-name">
        <div class="services-container">${r.name || ""}</div>
      </td>
      <td class="col-unit">${r.unit || ""}</td>
      <td class="col-cost">${r.cost !== "" ? r.cost : ""}</td>
      <td class="col-stock">${r.stock}</td>
      <td class="col-serv">
        <div class="services-container">
          ${servicesHtml}
        </div>
      </td>
      <td class="col-usage">${r.usageCount}</td>
    </tr>`;
  });

  container.innerHTML = `
    <table id="stockTableEl" class="table table-hover table-sm">
      <thead>${th}</thead>
      <tbody>${tr}</tbody>
    </table>`;
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
  <th class="text-secondary col-exec-idx">№</th>
  <th class="text-secondary col-exec-name">${t("performers")}</th>
  <th class="text-secondary col-exec-salary">${t("salaryNorm")}</th>
  <th class="text-secondary col-exec-serv">${t("servicesList")}</th>
  <th class="text-secondary col-exec-count">${t("completions")}</th>
</tr>`;

  let tr = "";
  rows.forEach((r) => {
    // Список услуг с вертикальной прокруткой
    const servicesHtml = r.services.length
      ? r.services.map((s) => `- ${s}`).join("</br>")
      : "";

    tr += `<tr>
    <td class="col-exec-idx">${r.idx}</td>
    <td class="col-exec-name">${r.executor}</td>
    <td class="col-exec-salary">${r.normSalary}</td>
    <td class="col-exec-serv"><div class="services-container">${servicesHtml}</div></td>
    <td class="col-exec-count">${r.usageCount}</td>
  </tr>`;
  });

  container.innerHTML = `
  <table id="executorsTableEl" class="table table-hover table-sm">
    <thead>${th}</thead>
    <tbody>${tr}</tbody>
  </table>`;
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
    <button type="button" class="btn btn-success" id="btn-createVisit">
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
var no;

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

document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("send-button")) {
    return;
  }
  no = e.target.getAttribute("name");
  editOrder();
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
<button type="button" class="btn btn-success" id="btn-save">${t(
    "closeModal"
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
  const comment =
    data.Tf[no].c[23] && data.Tf[no].c[23].v ? data.Tf[no].c[23].v : "";
  const keyeditClient =
    data.Tf[no].c[25] && data.Tf[no].c[25].v ? data.Tf[no].c[25].v : "";
  const dataDiscountl =
    data.Tf[no].c[27] && data.Tf[no].c[27].v ? data.Tf[no].c[27].v : "";
  const keyeditContact =
    data.Tf[no].c[26] && data.Tf[no].c[26].v ? data.Tf[no].c[26].v : "";
  const dataDiscountr =
    data.Tf[no].c[37] && data.Tf[no].c[37].v ? data.Tf[no].c[37].v : "";
  const normazp =
    data.Tf[no].c[28] && data.Tf[no].c[28].v ? data.Tf[no].c[28].v : 0;
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
        <select id="typeForm" class="form-select form-select-sm" onchange="saveChanges()">
        <option value="cash">${t("cash")}</option>
        <option value="cashless">${t("cashless")}</option>
      </select>      
      <select id="typeCurrency" class="form-select form-select-sm" onchange="saveChanges()">
  <option value="₴">${t("currencyUAH")}</option>
  <option value="$">${t("currencyUSD")}</option>
  <option value="€">${t("currencyEUR")}</option>
</select> 
        </div>
      </td>
    </tr>
    <tr>
    <td><div class="editable editable-content" data-key="editMileage" data-value="${keyeditMileage}">${keyeditMileage}</div></td>
      <td><div class="editable editable-content" data-key="editClient" data-value="${keyeditClient}">${keyeditClient}</div></td>
    </tr>
    <tr>
    <td><div class="editable editable-content" data-key="editCarInfo" data-value="${keyeditCarInfo}">${keyeditCarInfo}</div></td>
    <td><div class="editable editable-content" data-key="editContact" data-value="${keyeditContact}">${keyeditContact}</div></td>
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
  <!-- Спаренная ячейка для comment -->
  <td colspan="2" class="editable" data-key="editComment" style="text-align: left; vertical-align: top; word-wrap: break-word; width: 45%;">
    ${comment}</td>

  <!-- Δ, ₴ послуга, ₴ товар (вкладка order) -->
  <td colspan="3" class="tab-column order" style="width: 25%; text-align: right; vertical-align: top; padding-top: 20px;">
  <strong id="sumCellDisplay">${razom} ${currency}</strong>

  <!-- Σ, артикул, вартість (вкладка goods) -->
  <td colspan="3" class="tab-column goods d-none" style="width: 25%; text-align: right; vertical-align: top; padding-top: 20px;">
    <strong id="sumCostDisplay">${zakupka} ${currency}</strong></td>

  <!-- t, виконав, норма зп (вкладка work) -->
  <td colspan="3" class="tab-column work d-none" style="width: 25%; text-align: right; vertical-align: top; padding-top: 20px;">
    <strong id="sumSalaryNormDisplay">${normazp} ${currencyZp}</strong></td></tr>
</tfoot>
</table>`;

  document.querySelectorAll(".editable").forEach((td) => {
    td.addEventListener("click", function () {
      const statusValue = document.getElementById("typeStatus")?.value;
      if (
        statusValue === "виконано" ||
        statusValue === "factura" ||
        statusValue === "в архів" ||
        activated === false
      )
        return; // Блокировка редактирования
      if (td.querySelector("input")) return; // Уже редактируется

      const oldValue = td.textContent.trim();
      const input = document.createElement("input");
      input.type = "text";
      input.value = oldValue;
      input.className = "form-control form-control-sm";
      input.style.width = "100%";

      td.innerHTML = "";
      td.appendChild(input);
      input.focus();

      // Нажатие Enter = тоже blur
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
      });

      // Обработка завершения редактирования
      input.addEventListener("blur", () => {
        let newValue = input.value.trim();
        const oldValue = td.getAttribute("data-value") || "";
        const dataKey = td.getAttribute("data-key");

        newValue = normalizeEditValue(dataKey, newValue, input);

        td.textContent = newValue;

        if (newValue !== oldValue) {
          td.dataset.value = newValue;
          saveChanges();
        }
      });

      // Запуск функции обновления данных при изменении значения
      input.addEventListener("input", () => {
        //saveChanges(); // Отправляем данные на сервер
        // Изменяем вид кнопки
        const saveButton = document.getElementById("btn-save");
        saveButton.textContent = t("save");
        saveButton.classList.remove("btn-success");
        saveButton.classList.add("btn-danger");
        // Изменяем функциональность кнопки Зберегти
        saveButton.onclick = () => {
          saveChanges();
        };
      });
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
    const tr = createRow(index + 1, columns);
    tableBody.appendChild(tr);
  });

  updateRowNumbers(tableBody);
  updateAddRowButton(tableBody);

  // Обработка вкладок
  function activateTab(tab) {
    // 1. Если вкладка не передана явно, пытаемся узнать, какая открыта сейчас
    if (!tab) {
      const activeBtn = document.querySelector(
        "#nav-tabmodal .nav-link.active"
      );
      tab = activeBtn ? activeBtn.getAttribute("data-tab") : "order";
    }

    // 2. Жесткое ограничение для store (всегда только товары)
    if (role === "store") {
      tab = "goods";
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

  // Итог по сумме
  const sumCell = document.getElementById("sumCellDisplay");
  if (sumCell) {
    let originalSumHtml = "";
    if (discountl > 0 || discountr > 0) {
      const origTotal = sumLeft + sumRight;
      originalSumHtml = `<span style="color:#777;text-decoration:line-through;display:block;font-size:1em">
      ${formatNumber(origTotal)} ${currency}
    </span>`;
    }

    // Рассчитываем НДС
    const vatAmount = vat > 0 ? (sumTotal * vat) / (100 + vat) : 0;
    const vatHtml =
      vat > 0
        ? `<div style="font-size:0.9em;color:#555;">${t(
            "includingVAT"
          )}: ${formatNumber(vatAmount)} ${currency}</div>`
        : "";

    sumCell.innerHTML = `${originalSumHtml}<strong>${formatNumber(
      sumTotal
    )} ${currency}</strong>${vatHtml}`;
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
    const fixed = Number(num).toFixed(2);
    if (fixed.endsWith(".00")) return parseInt(fixed).toString();
    if (fixed.endsWith("0")) return fixed.slice(0, -1).replace(".", ",");
    return fixed.replace(".", ",");
  }
}
//---------------------------------------------------------------------------------------------------
function createRow(rowNumber, columns) {
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
      updateRowNumbers(document.getElementById("table-body"));
      updateAddRowButton(document.getElementById("table-body"));

      const saveButton = document.getElementById("btn-save");
      saveButton.textContent = t("save");
      saveButton.classList.remove("btn-success");
      saveButton.classList.add("btn-danger");
      saveButton.onclick = () => saveChanges();
    };

    numberCell.appendChild(deleteButton);
  } else {
    const addButton = document.createElement("button");
    addButton.classList.add("text-success", "btn", "p-0", "add-row-btn");
    addButton.innerHTML = `<i class="bi bi-plus-square-dotted fs-5"></i>`;
    addButton.onclick = () => {
      const targetTd = tr.querySelector("td:nth-child(2)");
      if (targetTd) switchToInput(targetTd, 0);
    };
    numberCell.appendChild(addButton);
  }

  tr.appendChild(numberCell);

  // --- Вторая колонка: всегда видимая ---
  const mainTd = document.createElement("td");
  mainTd.textContent = value0;
  mainTd.dataset.value = value0;
  mainTd.addEventListener("click", () => switchToInput(mainTd, 0));
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

  for (let i = 1; i <= 10; i++) {
    const td = document.createElement("td");
    const val = columns[i]?.trim() || "";
    td.textContent = val;
    td.dataset.value = val;

    // Вместо val = "", добавляем класс секретности
    if (role === "store" && i === 6) {
      td.classList.add("secret-cell");
    }
    td.classList.add("tab-column", colClasses[i - 1]);
    td.addEventListener("click", () => switchToInput(td, i));
    tr.appendChild(td);
  }

  return tr;
}

// Функция для переключения на поле ввода
function switchToInput(td, colIndex) {
  // 1. ГЛОБАЛЬНАЯ БЛОКИРОВКА (Статус и активация)
  const statusValue = document.getElementById("typeStatus")?.value;
  const isLockedStatus = ["виконано", "factura", "в архів"].includes(
    statusValue
  );

  if (isLockedStatus || activated === false) {
    return;
  }

  // 2. БЛОКИРОВКА ПО РОЛИ (Задание №1)
  // Блокируем "себестоимость" (индекс 7) для роли store
  if (role === "store" && colIndex === 6) {
    return;
  }

  // Запрещаем редактирование 10-й колонки в авто-режиме зп
  const payrateEl = document.querySelector('[data-key="editPayrate"]');
  const payrate =
    parseFloat(payrateEl?.textContent?.trim()?.replace(",", ".")) || 0;

  if (colIndex === 9 && payrate > 0) {
    // Авто-режим: не даём активировать input
    return;
  }
  // защита от повторного открытия: если уже внутри редактируется input или меню исполнителей
  if (td.querySelector("input")) return;

  const currentValue = td.dataset.value || "";

  // ----- Особая обработка для колонки "Виконавець" -----
  if (colIndex === 8) {
    // --- собираем список исполнителей из datalist#executor-s ---
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
      : [];

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
      if (selectedVals.includes(exec)) chk.checked = true;

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

      // высота элементов под списком (input + кнопки + отступы ≈ 90px)
      const fixedPartH = 90;

      // доступное пространство сверху/снизу
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
        updateRowNumbers(document.getElementById("table-body"));
        updateAddRowButton(document.getElementById("table-body"));
        updateSumFromTable();
        saveChanges();
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
      return chosen.filter(Boolean);
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

  // ----- стандартная логика для остальных колонок -----
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentValue;
  input.classList.add("form-control", "form-control-sm");

  if (colIndex === 0) {
    input.setAttribute("list", "service-regulation");
  } else if (colIndex === 5) {
    input.setAttribute("list", "article-s");
  } else if (colIndex === 1) {
    input.setAttribute("list", "info-s");
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

  td.innerHTML = "";
  td.appendChild(input);
  input.focus();

  input.addEventListener("change", () => input.blur());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();

      const currentRow = td.closest("tr");
      const nextRow = currentRow.nextElementSibling;

      // Проверяем если следующей строки нет ИЛИ в следующей строке находится кнопка добавления
      const isLastDataRow = !nextRow || nextRow.querySelector(".add-row-btn");

      if (isLastDataRow) {
        setTimeout(() => document.querySelector(".add-row-btn")?.focus(), 0);
      }
    }
  });

  input.addEventListener("blur", () => {
    const newValue = input.value.trim();
    const oldValue = td.getAttribute("data-value") || "";
    td.textContent = newValue;
    if (newValue !== oldValue) {
      td.dataset.value = newValue;

      // --- ЛОГИКА ПЕРЕСЧЕТА (динамические строки) ---
      if (colIndex === 4) {
        // Индекс 5 соответствует 6-й колонке (Кол-во)
        const tr = td.closest("tr");

        const oldQty = parseNumber(oldValue); // Используем старое значение из атрибута
        const newQty = parseNumber(newValue);

        // Находим ячейку себестоимости (9-я колонка, индекс 7 или nth-child(9))
        const costCell = tr.querySelector("td:nth-child(8)");

        if (costCell) {
          const currentCostRaw = costCell.textContent.trim();

          // ЗАЩИТА: Пересчитываем только если в себестоимости уже что-то есть
          if (currentCostRaw !== "" && currentCostRaw !== "0") {
            const currentTotalCost = parseNumber(currentCostRaw); // Теперь тут всегда есть текст!

            // Если старое количество было некорректным (0 или пусто), берем 1
            const validOldQty = oldQty > 0 ? oldQty : 1;

            const unitCost = currentTotalCost / validOldQty;
            const calculatedCost = unitCost * newQty;

            // Форматирование: 2 знака, но только если они не .00
            const finalValue = Number(calculatedCost.toFixed(2)).toString();

            costCell.textContent = finalValue;
            costCell.dataset.value = finalValue;
          }
        }
      }
      // --------------------------------------

      updateRowNumbers(document.getElementById("table-body"));
      updateAddRowButton(document.getElementById("table-body"));
      updateSumFromTable();
      saveChanges();
    }
  });

  input.addEventListener("input", () => {
    const saveButton = document.getElementById("btn-save");
    saveButton.textContent = t("save");
    saveButton.classList.remove("btn-success");
    saveButton.classList.add("btn-danger");
    saveButton.onclick = () => {
      saveChanges();
    };
  });
}
//---------------------------------------------------------------------------------------------------
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
function updateRowNumbers(tableBody) {
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
          statusValue === "в архів" ||
          activated === false
        )
          return; // блокировка удаления
        row.remove();
        updateSumFromTable();
        updateRowNumbers(tableBody);
        updateAddRowButton(tableBody);
        const saveButton = document.getElementById("btn-save");
        saveButton.textContent = t("save");
        saveButton.classList.remove("btn-success");
        saveButton.classList.add("btn-danger");
        // Изменяем функциональность кнопки на Зберегти
        saveButton.onclick = () => {
          saveChanges();
        };
        saveChanges();
      };

      firstCell.innerHTML = "";
      firstCell.appendChild(span);
      firstCell.appendChild(deleteButton);
    }
  });
}
//---------------------------------------------------------------------------------------------------
// === Добавление строки при необходимости ===
function updateAddRowButton(tableBody) {
  const rows = tableBody.querySelectorAll("tr");
  const hasEmptyReg = Array.from(rows).some((row) => {
    const td = row.querySelector("td:nth-child(2)");
    return td && td.textContent.trim() === "";
  });

  if (!hasEmptyReg) {
    const newRow = createRow(null, ["", "", "", ""]);
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
    const lockFields = ["factura", "виконано", "в архів"].includes(
      currentStatus
    );

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
    const editComment = getText("editComment");
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
    const rowNumber = Number(no) + 2;
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
        saveButton.classList.add("btn-success");
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
  }, 500); // debounce 500мс
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

  // find active tab (prefer clone's active state, fallback to live DOM)
  let activeBtn = clone.querySelector("#nav-tabmodal .nav-link.active");
  if (!activeBtn)
    activeBtn = document.querySelector("#nav-tabmodal .nav-link.active");
  const activeTab = (activeBtn && activeBtn.dataset.tab) || "order";
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
    body{font-family:Arial,sans-serif;padding:20px;color:#000}
    table{border-collapse:collapse;margin-bottom:20px;width:100%}
    td,th{border:1px solid #ccc;padding:6px;vertical-align:top}
    .table-header td, .table-footer td {border: none !important;}
    select,button,input{display:none!important}

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
    .editable[data-key="editComment"]::before {
      content: "Notes ✏️ ";
      opacity: 0.5;
      margin-left: 4px;
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
  <button type="button" class="btn btn-success" onclick="clientAddReport()">${t(
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
  document.getElementById("signInButton").classList.remove("d-none"); // показать кнопку входа
  document.getElementById("logoutButton").style.display = "none"; // скрыть кнопку выхода
  location.reload();
});

/**
 * Обрабатывает JWT-токен, полученный от Google после успешного входа пользователя.
 * @param {Object} response Объект ответа, содержащий JWT-токен.
 */
function handleCredentialResponse(response) {
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
    document.getElementById("signInButton").classList.add("d-none"); // скрыть кнопку входа
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
  if (vat == undefined || vat == "" || vat == null) {
    // скрываем вкладку фактуры если не используются
    const invoiceTab = document.getElementById("nav-invoice-tab");
    if (invoiceTab) invoiceTab.style.display = "none";
    // скрываем статус фактура если не используется
    const facturaOption = document.querySelector(
      '#typeStatus option[value="factura"]'
    );
    if (facturaOption) facturaOption.style.display = "none";
  }
  /*if (role == "manager" && price.trim() !== "") {
    // скрываем отчет "популярные продажи"
    const popSaleOption = document.querySelector(
      '#typeReport option[value="Популярні продажі"]'
    );
    if (popSaleOption) popSaleOption.style.display = "none";

    const warehouseTab = document.getElementById("nav-stock-tab");
    if (warehouseTab) {
      // Делаем вкладку неактивной если менеджер
      warehouseTab.classList.add("disabled");
      warehouseTab.setAttribute("tabindex", "-1");
      warehouseTab.setAttribute("aria-disabled", "true");

      // Отключаем содержимое вкладки если менеджер
      const tabContent = document.querySelector("#stockTable");
      if (tabContent) {
        tabContent.classList.remove("show", "active");
        tabContent.classList.add("disabled");
      }
    }
  }*/
  if (role === "store") {
    // 1. Скрываем ненужные вкладки в основном интерфейсе аналитики
    ["nav-price-tab", "nav-execut-tab"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    // 2. ЛОГИКА ДЛЯ МОДАЛЬНОГО ОКНА (editOrder)
    const orderTab = document.querySelector(
      '#nav-tabmodal .nav-link[data-tab="order"]'
    );
    const workTab = document.querySelector(
      '#nav-tabmodal .nav-link[data-tab="work"]'
    );
    const goodsTab = document.querySelector(
      '#nav-tabmodal .nav-link[data-tab="goods"]'
    );

    if (orderTab && workTab && goodsTab) {
      // Блокируем вкладки "Заказ" и "Работа"
      [orderTab, workTab].forEach((btn) => {
        btn.classList.add("disabled");
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.4";
        btn.setAttribute("aria-disabled", "true");
      });

      // мы перебиваем это действие кликом по нужной для store вкладке
      goodsTab.click();
    }
    // визуально прозраный текст для store
    const style = document.createElement("style");
    style.innerHTML = `
        /* Заголовок: оставляем структуру, но скрываем текст */
        #headlines th:nth-child(8) {
            color: transparent !important;
            pointer-events: none;
            user-select: none;
        }

        /* Футер: скрываем итоговую сумму себестоимости */
        #sumCostDisplay { 
            visibility: hidden !important; 
        }

        /* Ячейки тела таблицы: делаем их похожими на неактивные */
        .secret-cell {
            color: transparent !important;
            background-color: #f8f9fa !important; /* Светло-серый цвет неактивной ячейки */
            border-color: #dee2e6 !important;
            user-select: none !important;
            pointer-events: none !important;
        }

        /* Снимаем эффекты при наведении, если они есть */
        .secret-cell:hover {
            background-color: #f8f9fa !important;
        }
    `;
    document.head.appendChild(style);
    // 3. Ограничение отчетов
    const reportSelect = document.getElementById("typeReport");
    if (reportSelect) {
      Array.from(reportSelect.options).forEach((opt) => {
        if (opt.value !== "За проданими товарами") opt.disabled = true;
      });
      if (reportSelect.value !== "За проданими товарами") {
        reportSelect.value = "За проданими товарами";
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
