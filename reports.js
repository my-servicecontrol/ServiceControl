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
      .actions-panel{display:flex; gap:10px; margin:10px 0 20px auto; justify-content: flex-end;}
      .print-btn, .excel-btn{
        padding:8px 16px;
        font-size:13px;
        color:#fff;
        border:none;
        border-radius:4px;
        cursor:pointer;
        font-weight: bold;
      }
      .print-btn{background:#1976d2;}
      .excel-btn{background:#2e7d32;}
      @media print { .actions-panel {display: none;} }
    `;

  return `<!doctype html>
  <html lang="${lang || "ua"}">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>${css}</style>
      <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
    </head>
    <body>
      <header id="excel-header">
        <div class="brand">
          ${logo ? `<img src="${logo}" alt="logo" id="logo-img" />` : ""}
          <div>
            <h1 id="excel-title">${title}</h1>
            <div class="small" id="excel-sname">${sName || ""}</div>
          </div>
        </div>
        <div class="meta" id="excel-timestamp">${timestamp}</div>
      </header>

      <div class="actions-panel">
        <button class="print-btn" onclick="window.print()">${t(
          "printPDF"
        )}</button>
        <button class="excel-btn" onclick="exportToExcel()">${t(
          "exportExcel"
        )}</button>
      </div>

      <div id="report-content">
        ${contentHtml}
      </div>

      <script>
        function exportToExcel() {
          const wb = XLSX.utils.book_new();
          const content = document.getElementById('report-content');
          
          // 1. Создаем массив данных для формирования листа
          // Добавляем заголовок и мета-данные
          const dataRows = [
            ["${title}", null, null, null, null, "${timestamp}"],
            ["${sName || ""}"],
            [] // Пустая строка (аналог линии кнопок)
          ];

          // 2. Парсим содержимое contentHtml
          // Проходимся по всем элементам (P, DIV, TABLE), чтобы сохранить порядок как на экране
          const elements = content.querySelectorAll('*');
          let processedTables = new Set();

          content.childNodes.forEach(node => {
            if (node.nodeName === 'TABLE') {
              // Если таблица — конвертируем ее в массив строк
              const sheet = XLSX.utils.table_to_sheet(node);
              const tableArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });
              tableArray.forEach(row => dataRows.push(row));
              dataRows.push([]); // Пробел после таблицы
            } else if (node.innerText && node.innerText.trim() !== "" && node.children.length === 0) {
              // Если это просто текст (период или матрица итогов в тегах p/div)
              dataRows.push([node.innerText.trim()]);
            } else if (node.nodeType === 1 && node.innerText.trim() !== "") {
               // Для вложенных структур, если это не таблица (например центрированный текст)
               if (!node.querySelector('table')) {
                 dataRows.push([node.innerText.trim()]);
               }
            }
          });

          // 3. Создаем лист из собранного массива
          const ws = XLSX.utils.aoa_to_sheet(dataRows);

          // Настройка ширины колонок (примерная)
          ws['!cols'] = [{wch: 5}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 15}, {wch: 15}];

          XLSX.utils.book_append_sheet(wb, ws, "Report");

          // 4. Сохранение файла
          const fileName = ("${title}_" + "${timestamp}").replace(/[/\\?%*:|"<>]/g, '-') + ".xlsx";
          XLSX.writeFile(wb, fileName);
        }
      </script>
    </body>
  </html>`;
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

  let content = `<div class="report-header"><h2 style="text-align:center;">${t(
    "selectedPeriod"
  )}: ${startPeriod} - ${endPeriod}</h2></div>`;

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
    title: t("reportFinancial"),
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
    t("carNumber"),
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
    const gosNum = getVal(i, 13);
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
      `<td>${gosNum}</td>` +
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
    .map((cur) => {
      const vatAmount = vat > 0 ? (totalAll[cur] * vat) / (100 + vat) : 0;
      const vatLine =
        vat > 0
          ? `<div class="small">${t("includingVAT")}: ${vatAmount.toFixed(
              2
            )} ${cur}</div>`
          : "";
      return `<div>
        <b>${cur}</b>: 
        ${t("services")} – ${totalServices[cur].toFixed(2)} ${cur}, 
        ${t("goods")} – ${totalGoods[cur].toFixed(2)} ${cur}, 
        ${t("total")} – ${totalAll[cur].toFixed(2)} ${cur}
        ${vatLine}
      </div>`;
    })
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
function buildReportServices(rows, options = {}) {
  const { logo, sName, lang = "ua", startDate, endDate } = options;
  const now = new Date();
  const timestamp = now.toLocaleString("uk-UA");

  // агрегаторы по валютам
  const currencyMap = {
    "₴": { visits: 0, service: 0, item: 0 },
    $: { visits: 0, service: 0, item: 0 },
    "€": { visits: 0, service: 0, item: 0 },
  };

  // агрегатор по услугам/товарам
  const serviceMap = new Map();

  rows.forEach(({ idx }) => {
    const c36 = getVal(idx, 36);
    const parsed = parseC36String(c36);
    const currency = getVal(idx, 34) || "₴";
    const discountService = parseNum(getVal(idx, 27)) || 0; // скидка %
    const discountItem = parseNum(getVal(idx, 37)) || 0;
    const normZp = parseNum(getVal(idx, 38)) || 0;
    const cost = parseNum(getVal(idx, 34)) || 0; // закупка (?)

    if (!currencyMap[currency]) return; // пропускаем неизвестную валюту
    currencyMap[currency].visits++;

    parsed.forEach((p) => {
      const name = p.name || "(без назви)";
      const priceService = parseNum(p.priceServiceRaw) || 0;
      const priceItem = parseNum(p.priceItemRaw) || 0;
      const norm = parseNum(p.normRaw) || 0;
      const costPrice = parseNum(p.costPriceRaw) || 0;

      // применяем скидки
      const serviceTotal = priceService * (1 - discountService / 100);
      const itemTotal = priceItem * (1 - discountItem / 100);

      // общие суммы по валюте
      currencyMap[currency].service += serviceTotal;
      currencyMap[currency].item += itemTotal;

      // группируем по наименованию
      const key = name;
      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          name,
          qty: 0,
          sumService: 0,
          sumItem: 0,
          normSum: 0,
          costSum: 0,
        });
      }
      const r = serviceMap.get(key);
      r.qty++;
      r.sumService += serviceTotal;
      r.sumItem += itemTotal;
      r.normSum += norm;
      r.costSum += costPrice;
    });
  });

  // сортировка
  // сортировка по количеству (qty) по убыванию
  const items = Array.from(serviceMap.values()).sort((a, b) => b.qty - a.qty);

  // таблица отчета
  const rowsHtml = items
    .map(
      (r, i) => `<tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.qty}</td>
        <td>${r.sumService.toFixed(2)}</td>
        <td>${r.sumItem.toFixed(2)}</td>
        <td>${r.normSum.toFixed(2)}</td>
        <td>${r.costSum.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const tableHtml = `
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>${t("service")}</th>
          <th>${t("salesCount")}</th>
          <th>${t("services")}</th>
          <th>${t("goods")}</th>
          <th>${t("salaryNorm")}</th>
          <th>${t("purchases")}</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;

  // матрица визитов по валютам
  const visitMatrixHtml = `
    <table style="margin-top:15px; width:auto;">
      <tr>
        <th>${t("visits")}:</th><td>${currencyMap["₴"].visits}</td>
        <th>${t("services")} ₴</th><td>${currencyMap["₴"].service.toFixed(
    2
  )}</td>
        <th>${t("goods")} ₴</th><td>${currencyMap["₴"].item.toFixed(2)}</td>
      </tr>
      <tr>
        <th>${t("visits")}:</th><td>${currencyMap["$"].visits}</td>
        <th>${t("services")} $</th><td>${currencyMap["$"].service.toFixed(
    2
  )}</td>
        <th>${t("goods")} $</th><td>${currencyMap["$"].item.toFixed(2)}</td>
      </tr>
      <tr>
        <th>${t("visits")}:</th><td>${currencyMap["€"].visits}</td>
        <th>${t("services")} €</th><td>${currencyMap["€"].service.toFixed(
    2
  )}</td>
        <th>${t("goods")} €</th><td>${currencyMap["€"].item.toFixed(2)}</td>
      </tr>
    </table>`;

  // блок справа — Норма/ЗП и Закупівля
  const rightMatrixHtml = `
    <table style="margin-top:15px; width:auto;">
      <tr><th>${t("norm")}</th><td>${items
    .reduce((a, b) => a + b.normSum, 0)
    .toFixed(2)}</td></tr>
      <tr><th>${t("purchases")}</th><td>${items
    .reduce((a, b) => a + b.costSum, 0)
    .toFixed(2)}</td></tr>
    </table>`;

  // общий итог по всем валютам
  const totalAllVisits =
    currencyMap["₴"].visits + currencyMap["$"].visits + currencyMap["€"].visits;
  const totalAllUAH = currencyMap["₴"].service + currencyMap["₴"].item;
  const totalAllUSD = currencyMap["$"].service + currencyMap["$"].item;
  const totalAllEUR = currencyMap["€"].service + currencyMap["€"].item;

  const totalRow = `
    <div style="margin-top:10px; font-weight:bold;">
      ${t("visits")}: ${totalAllVisits} | 
      ₴ ${totalAllUAH.toFixed(2)} | 
      $ ${totalAllUSD.toFixed(2)} | 
      € ${totalAllEUR.toFixed(2)}
    </div>`;

  const titleHtml = `
    <div style="text-align:center; margin-top:10px; font-weight:bold; font-size:14px;">
     ${t("period")}
    </div>
    <div style="text-align:center; font-size:16px; margin-bottom:10px;">
      ${startDate || ""} — ${endDate || ""}
    </div>`;

  // итоговый контент
  const contentHtml = `
    ${titleHtml}
    <div style="display:flex; justify-content:space-between; gap:20px;">
      <div>${visitMatrixHtml}</div>
      <div>${rightMatrixHtml}</div>
    </div>
    ${totalRow}
    ${tableHtml}`;

  return buildHtmlDocument({
    title: t("reportPopularSales"),
    logo,
    sName,
    timestamp,
    contentHtml,
    lang,
  });
}

// --------------------------------------- REPORT: "За проданими товарами"
function buildReportGoods(rows, options = {}) {
  const { logo, sName, lang = "ua", startDate, endDate } = options;
  const now = new Date();
  const timestamp = now.toLocaleString("uk-UA");

  // Хранилище агрегированных данных по уникальным артикулам
  const goodsMap = new Map();

  // Итоги по валютам
  const totals = {
    visits: new Set(),
    ua: { price: 0, cost: 0 },
    us: { price: 0, cost: 0 },
    eu: { price: 0, cost: 0 },
  };

  rows.forEach(({ idx }) => {
    const visitNum = getVal(idx, 3);
    const currency = (getVal(idx, 34) || "₴").trim();
    const positions = parseC36String(getVal(idx, 36));

    positions.forEach((p) => {
      const articleRaw = (p.articleRaw || "").trim();
      const name = (p.name || "").trim();
      const qty = parseNum(p.sigmaRaw);
      const priceItem = parseNum(p.priceItemRaw);
      const costPrice = parseNum(p.costPriceRaw);

      // Признак товара
      const isGood = priceItem > 0 || qty > 0 || articleRaw || costPrice > 0;
      if (!isGood) return;

      // Если несколько артикулов — разделяем на отдельные элементы
      const articles = articleRaw
        ? articleRaw
            .split(/\s*\/\s*/) // разделяем только по "/" или " / " с пробелами
            .map((a) => a.trim())
            .filter(Boolean)
        : ["NO_ARTICLE"];

      articles.forEach((article) => {
        if (!goodsMap.has(article)) {
          goodsMap.set(article, {
            article,
            names: new Set(),
            visits: new Set(),
            totalQty: 0,
            totalPrice: 0,
            totalCost: 0,
            currency,
            count: 0,
          });
        }

        const g = goodsMap.get(article);
        g.names.add(name);
        g.visits.add(visitNum);
        g.totalQty += qty;
        g.totalPrice += priceItem;
        g.totalCost += costPrice;
        g.count += 1;

        // Суммы по валютам
        if (currency === "₴") {
          totals.ua.price += priceItem;
          totals.ua.cost += costPrice;
        } else if (currency === "$") {
          totals.us.price += priceItem;
          totals.us.cost += costPrice;
        } else if (currency === "€") {
          totals.eu.price += priceItem;
          totals.eu.cost += costPrice;
        }

        totals.visits.add(visitNum);
      });
    });
  });

  // Преобразуем в массив и сортируем по количеству продаж (по убыванию)
  const goodsData = Array.from(goodsMap.values()).sort(
    (a, b) => b.count - a.count
  );

  // Генерация таблицы
  const rowsHtml = goodsData
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${Array.from(r.visits).join(", ")}</td>
        <td>${r.article}</td>
        <td>${r.count}</td>
        <td>${Array.from(r.names).join(" / ")}</td>
        <td>${r.totalPrice.toFixed(2)}</td>
        <td>${r.totalQty.toFixed(2)}</td>
        <td>${r.totalCost.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const tableHtml = `
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>${t("visitNumber")}</th>
          <th>${t("article")}</th>
          <th>${t("salesCount")}</th>
          <th>${t("goodsMaterials")}</th>
          <th>${t("priceGoods")}</th>
          <th>${t("quantityShort")}</th>
          <th>${t("purchases")}</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;

  // Матрица итогов
  const matrixHtml = `
    <table style="margin-top:15px; width:auto;">
      <tr><th>${t("visits")}:</th><td>${totals.visits.size}</td></tr>
      <tr><th>₴ ${t("goods")}</th><td>${totals.ua.price.toFixed(2)}</td></tr>
      <tr><th>$ ${t("goods")}</th><td>${totals.us.price.toFixed(2)}</td></tr>
      <tr><th>€ ${t("goods")}</th><td>${totals.eu.price.toFixed(2)}</td></tr>
    </table>`;

  const rightMatrix = `
    <table style="margin-top:15px; width:auto;">
      <tr><th>₴ ${t("purchases")}</th><td>${totals.ua.cost.toFixed(2)}</td></tr>
      <tr><th>$ ${t("purchases")}</th><td>${totals.us.cost.toFixed(2)}</td></tr>
      <tr><th>€ ${t("purchases")}</th><td>${totals.eu.cost.toFixed(2)}</td></tr>
    </table>`;

  const totalsHtml = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:30px;">
      ${matrixHtml}
      ${rightMatrix}
    </div>`;

  // Заголовок
  const titleHtml = `
    <div style="text-align:center; margin-top:10px; font-weight:bold; font-size:14px;">
      ${t("period")}
    </div>
    <div style="text-align:center; font-size:16px; margin-bottom:10px;">
      ${startDate || ""} — ${endDate || ""}
    </div>`;

  const contentHtml = `${titleHtml}${totalsHtml}${tableHtml}`;

  return buildHtmlDocument({
    title: t("reportSoldGoods"),
    logo,
    sName,
    timestamp,
    contentHtml,
    lang,
  });
}

// --------------------------------------- REPORT: "По клієнту"
function buildReportClient(rows, options) {
  const { logo, sName, lang = "ua", startDate = "", endDate = "" } = options;

  // Заголовок отчета с периодом
  let content = `
    <div class="report-header" style="text-align:center;margin-bottom:10px;">
      <h2>${t("selectedPeriod")}: ${startDate || "-"} - ${endDate || "-"}</h2>
    </div>`;

  // Группировка по клиентам
  const clientsMap = new Map();

  for (const r of rows) {
    const i = r.idx;
    const clientName = getVal(i, 25) || "(без клієнта)";
    if (!clientsMap.has(clientName)) clientsMap.set(clientName, []);
    clientsMap.get(clientName).push(r);
  }

  // Формируем отчет по каждому клиенту
  let idxClient = 1;
  for (const [clientName, visits] of clientsMap.entries()) {
    // Подсчет визитов и общей суммы
    const totalSum = visits.reduce(
      (sum, r) => sum + (parseFloat(getVal(r.idx, 29)) || 0),
      0
    );
    const currency = getVal(visits[0].idx, 34) || "₴";

    // Заголовок для клиента
    content += `
      <h3 style="margin-top:20px;">${idxClient++}. ${clientName} — ${t(
      "visits"
    )}: ${visits.length}, сума: ${totalSum.toFixed(2)} ${currency}</h3>`;

    // Таблица визитов клиента
    content += `<table>
      <thead>
        <tr>
          <th>№</th>
          <th>${t("date")}</th>
          <th>${t("visitNum")}</th>
          <th>${t("thNumber")}</th>
          <th>${t("car")}</th>
          <th>${t("services")}</th>
          <th>${t("total")}</th>
        </tr>
      </thead>
      <tbody>`;

    let idx = 1;
    for (const r of visits) {
      const i = r.idx;
      const date = r.closeDate ? r.closeDate.toLocaleString() : "";
      const visit = getVal(i, 3) || "";
      const gosNum = getVal(i, 13);
      const car = getVal(i, 20) || "";
      const total = getVal(i, 29) || "";
      const curr = getVal(i, 34) || "";
      const positions = parseC36String(getVal(i, 36))
        .map((p) => `${p.name} (${p.priceServiceRaw || ""})`)
        .join("<br>");

      content += `<tr>
        <td>${idx++}</td>
        <td>${date}</td>
        <td>${visit}</td>
        <td>${gosNum}</td>
        <td>${car}</td>
        <td>${positions}</td>
        <td>${total} ${curr}</td>
      </tr>`;
    }

    content += "</tbody></table>";
  }

  // Генерация HTML-документа
  return buildHtmlDocument({
    title: t("reportTitle_client"),
    logo,
    sName,
    timestamp: new Date().toLocaleString("uk-UA"),
    contentHtml: content,
    lang,
  });
}

// --------------------------------------- REPORT: "Отчет по исполнителям"
function buildReportExecutors(rows, options) {
  const startPeriod = options.startDate || "";
  const endPeriod = options.endDate || "";

  // Собираем map executor -> [{visitIdx, visitNum, car, serviceName, normForExecutor}]
  const execMap = new Map();

  for (const r of rows) {
    const i = r.idx;
    const visitNum = getVal(i, 3);
    const gosNum = getVal(i, 13);
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
        arr.push({
          visitIdx: i,
          visitNum,
          gosNum,
          car,
          service: p.name,
          normFor,
        });
        execMap.set(ex, arr);
      });
    });
  }

  // Формируем HTML
  let content = `<div class="report-header" style="text-align:center;margin-bottom:10px;">
    <h2>${t("selectedPeriod")}: ${startPeriod} - ${endPeriod}</h2>
  </div>`;

  let idx = 1;

  execMap.forEach((items, exec) => {
    // Количество уникальных визитов, в которых участвовал исполнитель
    const uniqueVisits = new Set(items.map((x) => x.visitIdx));
    const visitsCount = uniqueVisits.size;

    // Общая сумма нормы з/п для исполнителя
    const totalNorm = items.reduce(
      (sum, it) => sum + (parseNum(it.normFor) || 0),
      0
    );

    content += `<h3>${idx++}. ${exec} (${t("statusDone")}: ${
      items.length
    }) — ${t("visits")}: ${visitsCount} — ${t(
      "salaryNorm"
    )}: ${totalNorm.toFixed(2)}</h3>`;

    // Группировка по визитам
    const byVisit = {};
    items.forEach((it) => {
      const k = it.visitIdx;
      byVisit[k] = byVisit[k] || {
        visitNum: it.visitNum,
        gosNum: it.gosNum,
        car: it.car,
        services: [],
      };
      byVisit[k].services.push({ name: it.service, norm: it.normFor });
    });

    content +=
      "<table><thead><tr><th>" +
      t("visitDate") +
      "</th><th>" +
      t("thNumber") +
      "</th><th>" +
      t("car") +
      "</th><th>" +
      t("service") +
      "</th><th>" +
      t("salaryNorm") +
      "</th></tr></thead><tbody>";

    Object.keys(byVisit).forEach((k) => {
      const v = byVisit[k];
      v.services.forEach((s) => {
        content += `<tr><td>${v.visitNum}</td><td>${v.gosNum}</td><td>${
          v.car
        }</td><td>${s.name}</td><td>${s.norm.toFixed(2)}</td></tr>`;
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
