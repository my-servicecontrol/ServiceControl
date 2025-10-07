// helper получения значения ячейки безопасно
const getVal = (rowIdx, col) => {
  try {
    return data.Tf[rowIdx] && data.Tf[rowIdx].c && data.Tf[rowIdx].c[col]
      ? data.Tf[rowIdx].c[col].v
      : "";
  } catch (e) {
    return "";
  }
};

// разбираем c[36] — возвращаем массив позиций для строки
function parseC36String(cell36) {
  // cell36 — строка или пусто
  if (!cell36) return [];
  const services = String(cell36)
    .split("--")
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  services.forEach((s) => {
    const cols = s.split("|").map((x) => x.trim());
    // cols indices: 0=name,1=Delta,2=priceService,3=priceItem,4=Sigma,5=article,6=costPrice,7=t,8=executor,9=norm
    out.push({
      raw: s,
      name: cols[0] || "",
      deltaRaw: cols[1] || "",
      priceServiceRaw: cols[2] || "",
      priceItemRaw: cols[3] || "",
      sigmaRaw: cols[4] || "",
      articleRaw: cols[5] || "",
      costPriceRaw: cols[6] || "",
      tRaw: cols[7] || "",
      executorsRaw: cols[8] || "",
      normRaw: cols[9] || "",
    });
  });
  return out;
}

// парсер числа (заменяем запятую на точку)
function parseNum(s) {
  if (s === null || s === undefined || s === "") return null;
  const str = String(s).replace(/\s+/g, "").replace(",", ".");
  const m = str.match(/-?\d+[.]?\d*/);
  return m ? parseFloat(m[0]) : null;
}

// --- Утилиты для разбора дат (устойчиво) ---
// Парсер формата dd.mm.yyyy -> Date (дата без времени)
function parseInputDateDMY(dateStr) {
  if (!dateStr && dateStr !== 0) return null;
  if (dateStr instanceof Date)
    return new Date(
      dateStr.getFullYear(),
      dateStr.getMonth(),
      dateStr.getDate()
    );

  const s = String(dateStr).trim();
  // dd.mm.yyyy
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (m) {
    let day = parseInt(m[1], 10);
    let month = parseInt(m[2], 10) - 1;
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }

  // пробуем ISO / другие форматы
  const parsed = Date.parse(s);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return null;
}

// Преобразует Excel/Sheets serial date (дни) в JS Date
function serialDaysToDate(serial) {
  // Google Sheets / Excel epoch: 1899-12-30 (day 0)
  const epoch = new Date(1899, 11, 30);
  // serial может быть нецелым (включая время как дробную часть)
  const ms = Math.round(serial * 24 * 60 * 60 * 1000);
  const d = new Date(epoch.getTime() + ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Универсальный парсер для значения из c[10].v
function parseCloseDateValue(value) {
  if (value === null || value === undefined || value === "") return null;

  // Если уже Date -> нормализуем (убираем время)
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  // Если объект ячейки {v: ...}
  if (typeof value === "object" && value.v !== undefined) {
    return parseCloseDateValue(value.v);
  }

  // Попытаемся привести к числу
  const num = Number(value);
  if (!isNaN(num)) {
    // Число может быть:
    //  - serial days (пример ~ 44000..47000) -> интерпретируем как serial days
    //  - timestamp ms (пример > 1e12) -> интерпретируем как ms
    //  - или маленькое число (1,2,...) — тогда скорее не дата
    if (num > 10000 && num < 1000000) {
      // считаем как serial days
      return serialDaysToDate(num);
    }
    if (num > 1000000000000) {
      // считаем как timestamp (ms)
      const d = new Date(num);
      if (!isNaN(d.getTime()))
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    // на всякий случай: если строка "45916" (в виде числа), предыдущий branch с serialDays сработает
  }

  // Если не число — пробуем распарсить строку формата dd.mm.yyyy или ISO
  return parseInputDateDMY(String(value));
}

// --- collectFilteredRows: фильтрация по датам (без учета времени), статусу, sName и client ---
function collectFilteredRows({ sdate, pdate, sName, client }) {
  // sdate / pdate ожидаются как Date объекты (или null)
  // Никаких мутирующих setHours — мы просто сравниваем 00:00 даты (без времени).
  const from = sdate
    ? new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate())
    : null;
  const to = pdate
    ? new Date(pdate.getFullYear(), pdate.getMonth(), pdate.getDate())
    : null;

  const rows = [];
  for (let i = data.Tf.length - 1; i >= 0; i--) {
    const statusRaw = getVal(i, 4);
    const status = String(statusRaw || "").toLowerCase();
    if (!(status === "виконано" || status === "factura")) continue;

    const closeRaw = getVal(i, 10);
    const closeDate = parseCloseDateValue(closeRaw);
    if (!closeDate) continue;

    // сравниваем только по датам (closeDate, from, to — все без времени)
    if (from && closeDate < from) continue;
    if (to && closeDate > to) continue;

    if (sName) {
      const rowSName = String(getVal(i, 24) || "").trim();
      if (rowSName !== String(sName).trim()) continue;
    }
    if (client) {
      const rowClient = String(getVal(i, 25) || "").trim();
      if (rowClient !== String(client).trim()) continue;
    }

    rows.push({ idx: i, closeDate });
  }
  return rows;
}

// ----------------------- Отчёты (builder functions)
// Каждый builder возвращает HTML (string) — полный документ (с <html>..)

// Общий шаблон для HTML отчёта
function buildHtmlDocument({
  title,
  logo,
  sName,
  timestamp,
  contentHtml,
  lang,
}) {
  const css = `
      body{font-family: Arial, Helvetica, sans-serif; margin:20px; color:#111}
      header{display:flex; justify-content:space-between; align-items:center}
      .brand{display:flex; align-items:center}
      .brand img{max-width:140px; max-height:140px; margin-right:12px}
      h1{font-size:18px; margin:0}
      .meta{font-size:12px; color:#555}
      table{width:100%; border-collapse:collapse; margin-top:12px}
      th,td{border:1px solid #dcdcdc; padding:6px; text-align:left; font-size:12px}
      th{background:#f7f7f7}
      .greenish{background:#E6F4EA}
      .currency-ua{background:#dff0d8}
      .currency-us{background:#d9edf7}
      .currency-eu{background:#fcf8e3}
      .small{font-size:11px; color:#666}
    `;

  return `<!doctype html><html lang="${
    lang || "ua"
  }"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>
      <header>
        <div class="brand">
          ${logo ? `<img src="${logo}" alt="logo" />` : ""}
          <div>
            <h1>${title}</h1>
            <div class="small">${sName || ""}</div>
          </div>
        </div>
        <div class="meta">${timestamp}</div>
      </header>
  
      ${contentHtml}
  
    </body></html>`;
}

// Helper: open new tab with HTML
function openHtmlInNewTab(html, filename) {
  const w = window.open("", "_blank");
  if (!w) return alert("Поп-ап заблокирован — разрешите всплывающие окна.");
  w.document.open();
  w.document.write(html);
  w.document.close();
}
function buildReportFin(rows, options) {
  const lang = options.lang || "ua";
  const startPeriod = options.startDate || "";
  const endPeriod = options.endDate || "";

  const headerCols = [
    "№",
    t("date"),
    t("visits"),
    t("cash"),
    t("cashless"),
    t("total"),
    t("salaryNorm"),
    t("purchases"),
  ];

  let dailyData = {};

  for (const r of rows) {
    const i = r.idx;

    const closeDateVal = getVal(i, 10);
    const closeDate = parseCloseDateValue(closeDateVal);
    if (!closeDate || isNaN(closeDate)) continue;

    const dateKey = closeDate.toLocaleDateString("uk-UA");

    const total = parseNum(getVal(i, 29)) || 0;
    const payType = (getVal(i, 30) || "").toLowerCase();
    const salaryNorm = parseNum(getVal(i, 28)) || 0;
    const purchases = parseNum(getVal(i, 33)) || 0;
    const currency = getVal(i, 34) || "₴";

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        visits: 0,
        cash: { "₴": 0, $: 0, "€": 0 },
        cashless: { "₴": 0, $: 0, "€": 0 },
        total: { "₴": 0, $: 0, "€": 0 },
        salaryNorm: 0,
        purchases: 0,
      };
    }

    dailyData[dateKey].visits += 1;
    dailyData[dateKey].salaryNorm += salaryNorm;
    dailyData[dateKey].purchases += purchases;

    if (payType === "cash") {
      dailyData[dateKey].cash[currency] += total;
    } else if (payType === "cashless") {
      dailyData[dateKey].cashless[currency] += total;
    }

    dailyData[dateKey].total[currency] += total;
  }

  // Сортировка по дате (возрастание)
  const sortedDates = Object.keys(dailyData).sort(
    (a, b) =>
      new Date(a.split(".").reverse().join("-")) -
      new Date(b.split(".").reverse().join("-"))
  );

  let totalCash = { "₴": 0, $: 0, "€": 0 };
  let totalCashless = { "₴": 0, $: 0, "€": 0 };

  let content = `<div class="report-header"><h2 style="text-align:center;">Вибраний період: ${startPeriod} - ${endPeriod}</h2></div>`;

  content +=
    "<table><thead><tr>" +
    headerCols.map((h) => `<th>${h}</th>`).join("") +
    "</tr></thead><tbody>";

  let counter = 1;

  for (const dateKey of sortedDates) {
    const d = dailyData[dateKey];
    const currencies = Object.keys(d.total).filter((cur) => d.total[cur] > 0);

    currencies.forEach((cur, idx) => {
      const rowClass = idx === 0 ? "day-row" : "sub-row";
      const cash = d.cash[cur].toFixed(2);
      const cashless = d.cashless[cur].toFixed(2);
      const total = d.total[cur].toFixed(2);

      totalCash[cur] += d.cash[cur];
      totalCashless[cur] += d.cashless[cur];

      content +=
        `<tr class="${rowClass}">` +
        `<td>${idx === 0 ? counter++ : ""}</td>` +
        `<td>${idx === 0 ? dateKey : ""}</td>` +
        `<td>${idx === 0 ? d.visits : ""}</td>` +
        `<td>${cash} ${cur}</td>` +
        `<td>${cashless} ${cur}</td>` +
        `<td>${total} ${cur}</td>` +
        `<td>${idx === 0 ? d.salaryNorm.toFixed(2) : ""}</td>` +
        `<td>${idx === 0 ? d.purchases.toFixed(2) : ""}</td>` +
        `</tr>`;
    });
  }

  content += "</tbody></table>";

  // Матрица итогов
  const totalsHtml = Object.keys(totalCash)
    .filter((cur) => totalCash[cur] > 0 || totalCashless[cur] > 0)
    .map(
      (cur) =>
        `<div><b>${cur}</b>: ${t("cash")} – ${totalCash[cur].toFixed(
          2
        )} ${cur}, ${t("cashless")} – ${totalCashless[cur].toFixed(
          2
        )} ${cur}, ${t("total")} – ${(
          totalCash[cur] + totalCashless[cur]
        ).toFixed(2)} ${cur}</div>`
    )
    .join("");

  content =
    `<div style="text-align:center;margin-bottom:10px;">${totalsHtml}</div>` +
    content;

  const html = buildHtmlDocument({
    title: "Фінансовий (базовий)",
    logo: options.logo,
    sName: options.sName,
    timestamp: options.timestamp,
    contentHtml: content,
    lang,
  });

  return html;
}

// --------------------------------------- REPORT: "За виконаними замовленнями"
function buildReportVal(rows, options) {
  const lang = options.lang || "ua";
  const startPeriod = options.startDate || "";
  const endPeriod = options.endDate || "";

  const headerCols = [
    "№",
    t("visitDate"),
    t("date"),
    t("visitNum"),
    t("car"),
    t("client"),
    "% " + t("services"),
    "% " + t("goods"),
    t("services"),
    t("goods"),
    t("total"),
    t("payType"),
    t("salaryNorm"),
    t("purchases"),
  ];

  let totalServices = { "₴": 0, $: 0, "€": 0 };
  let totalGoods = { "₴": 0, $: 0, "€": 0 };
  let totalAll = { "₴": 0, $: 0, "€": 0 };

  let content = `<div class="report-header"><h2 style="text-align:center;">${t(
    "period"
  )} ${startPeriod} - ${endPeriod}</h2></div>`;

  content +=
    "<table><thead><tr>" +
    headerCols.map((h) => `<th>${h}</th>`).join("") +
    "</tr></thead><tbody>";

  let counter = 1;
  for (const r of rows) {
    const i = r.idx;
    const visitCount = parseNum(getVal(i, 35)) || 0;
    const rowClass = visitCount < 2 ? "greenish" : "";

    // Парсинг дат
    const visitDateVal = getVal(i, 0);
    const closeDateVal = getVal(i, 10);

    const visitDate = parseCloseDateValue(visitDateVal);
    const closeDate = parseCloseDateValue(closeDateVal);

    const visitDateStr = visitDate ? `${visitDate.toLocaleDateString()}` : "";
    const closeDateStr = closeDate ? `${closeDate.toLocaleDateString()}` : "";

    const visitNum = getVal(i, 3) || "";
    const car = getVal(i, 20) || getVal(i, 13) || "";
    const client = getVal(i, 25) || "";

    const pctServices = getVal(i, 27) || "";
    const pctGoods = getVal(i, 37) || "";
    const servicesSum = parseNum(getVal(i, 31)) || 0;
    const goodsSum = parseNum(getVal(i, 32)) || 0;
    const total = parseNum(getVal(i, 29)) || 0;
    const payType = getVal(i, 30) || "";
    const salaryNorm = getVal(i, 28) || 0;
    const purchases = parseNum(getVal(i, 33)) || 0;
    const currency = getVal(i, 34) || "₴";
    const execCurrency = getVal(i, 38) || currency;

    totalServices[currency] = (totalServices[currency] || 0) + servicesSum;
    totalGoods[currency] = (totalGoods[currency] || 0) + goodsSum;
    totalAll[currency] = (totalAll[currency] || 0) + total;

    content +=
      `<tr class="${rowClass}">` +
      `<td>${counter++}</td>` +
      `<td>${visitDateStr}</td>` +
      `<td>${closeDateStr}</td>` +
      `<td>${visitNum}</td>` +
      `<td>${car}</td>` +
      `<td>${client}</td>` +
      `<td>${pctServices}</td>` +
      `<td>${pctGoods}</td>` +
      `<td>${servicesSum} ${currency}</td>` +
      `<td>${goodsSum} ${currency}</td>` +
      `<td>${total} ${currency}</td>` +
      `<td>${payType}</td>` +
      `<td>${salaryNorm} ${execCurrency}</td>` +
      `<td>${purchases} ${currency}</td>` +
      `</tr>`;
  }
  content += "</tbody></table>";

  // Матрица итогов
  const totalsHtml = Object.keys(totalAll)
    .filter((cur) => totalAll[cur] > 0)
    .map(
      (cur) =>
        `<div><b>${cur}</b>: ${t("services")} – ${totalServices[cur].toFixed(
          2
        )} ${cur}, ${t("goods")} – ${totalGoods[cur].toFixed(2)} ${cur}, ${t(
          "total"
        )} – ${totalAll[cur].toFixed(2)} ${cur}</div>`
    )
    .join("");

  content =
    `<div style="text-align:center;margin-bottom:10px;">${totalsHtml}</div>` +
    content;

  const html = buildHtmlDocument({
    title: t("reportTitle_val"),
    logo: options.logo,
    sName: options.sName,
    timestamp: options.timestamp,
    contentHtml: content,
    lang,
  });
  return html;
}

// --------------------------------------- REPORT: "Популярні продажі"
function buildReportServices(rows, options) {
  const map = new Map(); // key = serviceName|currency => {name, count, sumByCurrency: {₴:..., $:..., €:...}}
  for (const r of rows) {
    const i = r.idx;
    const currency = getVal(i, 34) || "";
    const positions = parseC36String(getVal(i, 36));
    positions.forEach((p) => {
      const key = (p.name || "").trim();
      if (!key) return;
      const entry = map.get(key) || { name: key, count: 0, sums: {} };
      entry.count += 1;
      const price = parseNum(p.priceServiceRaw) || 0;
      entry.sums[currency] = (entry.sums[currency] || 0) + price;
      map.set(key, entry);
    });
  }
  const arr = Array.from(map.values()).sort((a, b) => b.count - a.count);
  // build html
  let content = `<table><thead><tr><th>№</th><th>${t(
    "services"
  )}</th><th>Кількість</th><th>Сума (за валютами)</th></tr></thead><tbody>`;
  let idx = 1;
  arr.forEach((row) => {
    const sumsHtml = Object.keys(row.sums)
      .map((cur) => `${row.sums[cur].toFixed(2)} ${cur}`)
      .join("<br>");
    content += `<tr><td>${idx++}</td><td>${row.name}</td><td>${
      row.count
    }</td><td>${sumsHtml}</td></tr>`;
  });
  content += "</tbody></table>";
  return buildHtmlDocument({
    title: t("reportTitle_services"),
    logo: options.logo,
    sName: options.sName,
    timestamp: options.timestamp,
    contentHtml: content,
    lang: options.lang,
  });
}

// --------------------------------------- REPORT: "За проданими товарами"
function buildReportGoods(rows, options) {
  const goodsMap = new Map(); // article -> {article, name?, qty, sumByCurrency}
  for (const r of rows) {
    const i = r.idx;
    const currency = getVal(i, 34) || "";
    const positions = parseC36String(getVal(i, 36));
    positions.forEach((p) => {
      const articles = (p.articleRaw || "")
        .split("/")
        .map((x) => x.trim())
        .filter(Boolean);
      const sigmas = (p.sigmaRaw || "").split("/").map((x) => x.trim());
      for (let k = 0; k < articles.length; k++) {
        const art = articles[k];
        if (!art) continue;
        const qty = parseNum(sigmas[k] || sigmas[0]) || 0;
        const price = parseNum(p.priceItemRaw) || 0;
        const entry = goodsMap.get(art) || { article: art, qty: 0, sums: {} };
        entry.qty += qty;
        entry.sums[currency] = (entry.sums[currency] || 0) + price * qty;
        goodsMap.set(art, entry);
      }
    });
  }
  const arr = Array.from(goodsMap.values()).sort((a, b) => b.qty - a.qty);
  let content = `<table><thead><tr><th>№</th><th>Артикул</th><th>К-ть</th><th>Сума по валютам</th></tr></thead><tbody>`;
  let idx = 1;
  arr.forEach((r) => {
    const sumsHtml = Object.keys(r.sums)
      .map((cur) => `${r.sums[cur].toFixed(2)} ${cur}`)
      .join("<br>");
    content += `<tr><td>${idx++}</td><td>${r.article}</td><td>${
      r.qty
    }</td><td>${sumsHtml}</td></tr>`;
  });
  content += "</tbody></table>";
  return buildHtmlDocument({
    title: t("reportTitle_goods"),
    logo: options.logo,
    sName: options.sName,
    timestamp: options.timestamp,
    contentHtml: content,
    lang: options.lang,
  });
}

// --------------------------------------- REPORT: "По клієнту"
function buildReportClient(rows, options) {
  // rows already filtered by client
  let content = `<table><thead><tr><th>№</th><th>${t("date")}</th><th>${t(
    "visitNum"
  )}</th><th>${t("car")}</th><th>${t("services")}</th><th>${t(
    "total"
  )}</th></tr></thead><tbody>`;
  let idx = 1;
  for (const r of rows) {
    const i = r.idx;
    const date = r.closeDate ? r.closeDate.toLocaleString() : "";
    const visit = getVal(i, 3) || "";
    const car = getVal(i, 20) || "";
    const total = getVal(i, 29) || "";
    const currency = getVal(i, 34) || "";
    const positions = parseC36String(getVal(i, 36))
      .map((p) => `${p.name} (${p.priceServiceRaw || ""})`)
      .join("<br>");
    content += `<tr><td>${idx++}</td><td>${date}</td><td>${visit}</td><td>${car}</td><td>${positions}</td><td>${total} ${currency}</td></tr>`;
  }
  content += "</tbody></table>";
  return buildHtmlDocument({
    title: t("reportTitle_client"),
    logo: options.logo,
    sName: options.sName,
    timestamp: options.timestamp,
    contentHtml: content,
    lang: options.lang,
  });
}

// --------------------------------------- REPORT: "Отчет по исполнителям"
function buildReportExecutors(rows, options) {
  // соберём map executor -> [ {visitIdx, car, visitNum, serviceName, normForExecutor} ]
  const execMap = new Map();
  for (const r of rows) {
    const i = r.idx;
    const visitNum = getVal(i, 3);
    const car = getVal(i, 20) || getVal(i, 13);
    const positions = parseC36String(getVal(i, 36));

    positions.forEach((p) => {
      const executors = (p.executorsRaw || "")
        .split("/")
        .map((x) => x.trim())
        .filter(Boolean);
      const qTimes = (p.tRaw || "").split("/").map((x) => parseNum(x) || 0);
      const normNum = parseNum(p.normRaw) || 0;
      let shares = [];
      if (!executors.length) return;
      if (executors.length === 1 && !p.tRaw) shares = [1];
      else if (!p.tRaw)
        shares = Array(executors.length).fill(1 / executors.length);
      else if (qTimes.length === executors.length) {
        const sum = qTimes.reduce((a, b) => a + b, 0) || 1;
        shares = qTimes.map((v) => v / sum);
      } else shares = Array(executors.length).fill(1 / executors.length);

      executors.forEach((ex, idxExec) => {
        const normFor = normNum * (shares[idxExec] || 0);
        const arr = execMap.get(ex) || [];
        arr.push({ visitIdx: i, visitNum, car, service: p.name, normFor });
        execMap.set(ex, arr);
      });
    });
  }

  // build HTML: each executor block — список визитов + услуги
  let content = "";
  let idx = 1;
  execMap.forEach((items, exec) => {
    content += `<h3>${idx++}. ${exec} (${t("visits")}: ${items.length})</h3>`;
    // group by visit
    const byVisit = {};
    items.forEach((it) => {
      const k = it.visitIdx;
      byVisit[k] = byVisit[k] || {
        visitNum: it.visitNum,
        car: it.car,
        services: [],
      };
      byVisit[k].services.push({ name: it.service, norm: it.normFor });
    });
    content +=
      "<table><thead><tr><th>Візит</th><th>Авто</th><th>Послуга</th><th>" +
      t("salaryNorm") +
      "</th></tr></thead><tbody>";
    Object.keys(byVisit).forEach((k) => {
      const v = byVisit[k];
      v.services.forEach((s, si) => {
        content += `<tr><td>${v.visitNum}</td><td>${v.car}</td><td>${
          s.name
        }</td><td>${s.norm.toFixed(2)}</td></tr>`;
      });
    });
    content += "</tbody></table><br>";
  });

  return buildHtmlDocument({
    title: t("reportTitle_exec"),
    logo: options.logo,
    sName: options.sName,
    timestamp: options.timestamp,
    contentHtml: content,
    lang: options.lang,
  });
}

// универсальный генератор отчётов
function generateReport(
  typeReport,
  { sdateStr, pdateStr, client, logo, sName }
) {
  const sdate = sdateStr ? parseInputDateDMY(sdateStr) : null;
  const pdate = pdateStr ? parseInputDateDMY(pdateStr) : null;
  const rows = collectFilteredRows({ sdate, pdate, sName, client });

  // метка времени с учётом TZ пользователя
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const timestamp = new Date().toLocaleString("uk-UA", { timeZone: userTZ });
  const options = {
    logo,
    sName,
    timestamp,
    startDate: sdateStr,
    endDate: pdateStr,
    lang: localStorage.getItem("appLang") || "ua",
  };

  if (rows.length === 0) {
    const html = buildHtmlDocument({
      title: t("reportTitle_val"),
      logo,
      sName,
      timestamp,
      contentHtml: "<p>Нічого не знайдено</p>",
      lang: options.lang,
    });
    openHtmlInNewTab(html);
    return;
  }

  let html;
  switch (typeReport) {
    case "За виконаними замовленнями":
      html = buildReportVal(rows, options);
      break;
    case "Фінансовий (базовий)":
      html = buildReportFin(rows, options);
      break;
    case "Популярні продажі":
      html = buildReportServices(rows, options);
      break;
    case "За проданими товарами":
      html = buildReportGoods(rows, options);
      break;
    case "По клієнту":
      html = buildReportClient(rows, options);
      break;
    case "По виконавцям":
      html = buildReportExecutors(rows, options);
      break;
    default:
      html = buildReportVal(rows, options);
  }
  openHtmlInNewTab(html);
}
// --------------------------------------- UI glue: новая clientAddReport (замена addReport)
function clientAddReport() {
  const typeReport = document.getElementById("typeReport").value;
  const sdate = document.getElementById("sdate").value; // dd.mm.yyyy
  const pdate = document.getElementById("pdate").value;
  const client = document.getElementById("byclient")
    ? document.getElementById("byclient").value
    : "";
  const logo = window.logo || "";
  const sName = window.sName || "";

  generateReport(typeReport, {
    sdateStr: sdate,
    pdateStr: pdate,
    client,
    logo,
    sName,
  });
}

// --------------------------------------- End of code
