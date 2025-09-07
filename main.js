//var wlink = window.location.search.replace("?", "");
var allLang = ["ua", "ru", "en", "de", "es"];
// язык из hash
const hashLang = window.location.hash.substr(1);
// язык из select по умолчанию
const selectLang = document.querySelector(".change-lang")?.value || "en";
var myApp =
  "https://script.google.com/macros/s/AKfycbz2jnjfhKohWVbWPS8A9mfVmmxnror9jMc2MJK8gOYFgdAi53de4ijJaxnVrgOi6oRW/exec";
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
        localStorage.removeItem("user_data");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    { name: "Комплексне миття", count: "1 245 замовлень", href: "#" },
    { name: "Шиномонтаж + баланс", count: "1 018 заказов", href: "#" },
    { name: "Заміна масла", count: "842 замовлення", href: "#" },
    { name: "Полірування кузова", count: "560 замовлень", href: "#" },
    { name: "Хімчистка салону", count: "509 замовлень", href: "#" },
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
          <div class="fw-semibold">${v.sto} • Заказ ${v.order}</div>
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

const triggerTabList = document.querySelectorAll("#nav-tab button");
triggerTabList.forEach((triggerEl) => {
  triggerEl.addEventListener("click", (event) => {
    // 🔹 сбрасываем фильтр при переключении вкладок
    const input = document.getElementById("myInput");
    if (input) input.value = "";

    // 🔹 обновляем статусы по ID вкладки
    uStatus = tabStatusMap[triggerEl.id] || [];

    // индикатор загрузки
    document.querySelector(
      "#myTable tbody"
    ).innerHTML = `<span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>`;
    loadTasks();
  });
});

// дефолтный статус при загрузке
uStatus = tabStatusMap["nav-home-tab"];

var data;
setInterval(loadTasks, 10000);

function loadTasks() {
  // Если фокус сейчас в input — прерываем выполнение
  if (document.activeElement && document.activeElement.tagName === "INPUT") {
    return;
  }
  const filter = document.getElementById("myInput")?.value.trim();
  if (filter && filter.length > 0) {
    // 🚫 Поиск активен — пропускаем автообновление
    return;
  }
  googleQuery(tasks, "0", "D:AO", `SELECT *`);
}

function googleQuery(sheet_id, sheet, range, query) {
  google.charts.load("45", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(queryTable);

  function queryTable() {
    var opts = { sendMethod: "auto" };
    var gquery = new google.visualization.Query(
      `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?gid=${sheet}&range=${range}&headers=1&tq=${query}`,
      opts
    );
    gquery.send(callback);
  }

  function callback(e) {
    if (e.isError()) {
      console.log(
        `Error in query: ${e.getMessage()} ${e.getDetailedMessage()}`
      );
      return;
    }

    data = e.getDataTable();
    tasksTable();
    tasksModal();
  }
}

function tasksTable() {
  $("#tasksTableDiv").html(function () {
    const getVal = (row, col) =>
      data.Tf[row] && data.Tf[row].c[col] && data.Tf[row].c[col].v !== undefined
        ? data.Tf[row].c[col].v
        : "";

    const getValF = (row, col) =>
      data.Tf[row] && data.Tf[row].c[col] && data.Tf[row].c[col].f
        ? data.Tf[row].c[col].f
        : getVal(row, col);

    const th = `
      <tr class="border-bottom border-info">
        <th class="text-secondary"></th>
        <th class="text-secondary">${data.Sf[0]?.label || ""} ${
      data.Sf[1]?.label || ""
    }</th>
        <th class="text-secondary text-truncate" style="max-width: 70px;">${
          data.Sf[13]?.label || ""
        }</th>
        <th class="text-secondary text-truncate" style="max-width: 170px;">${
          data.Sf[20]?.label || ""
        }</th>
        <th class="text-secondary text-truncate" style="min-width: 120px; max-width: 180px;">${
          data.Sf[25]?.label || ""
        }</th>
        <th class="text-secondary text-truncate" style="max-width: 80px;">${
          data.Sf[26]?.label || ""
        }</th>
        <th class="text-secondary">${data.Sf[29]?.label || ""}</th>
      </tr>`;

    let tr = "",
      trr = "";

    for (let i = data.Tf.length - 1; i >= 0; i--) {
      const status = getVal(i, 4);
      const owner = getVal(i, 24);
      const number = getVal(i, 3);
      const range = `${getValF(i, 0)} - ${getValF(i, 1)}`;
      const numplate = getVal(i, 13);
      const name = getVal(i, 20);
      const client = getVal(i, 25);
      const contact = getVal(i, 26);
      const sum = `${getVal(i, 30)} ${getVal(i, 29)} ${getVal(i, 34)}`;

      let rowClass = "",
        rowTitle = "";
      if (status === "в роботі")
        (rowClass = "table-success"), (rowTitle = status);
      else if (status === "пропозиція") rowTitle = status;
      const linkColor = uStatus === "в архів" ? "link-secondary" : "link-dark";

      const rowHTML = `
        <tr class="${rowClass}" title="${rowTitle}" name="${i}">
          <td><button class="send-button link-badge" name="${i}">${number}</button></td>
          <td>${range}</td>
          <td class="text-truncate" style="max-width: 70px;">${numplate}</td>
          <td class="text-truncate" style="max-width: 170px;">${name}</td>
          <td class="text-truncate" style="min-width: 120px; max-width: 180px;">${client}</td>
          <td class="text-truncate" style="max-width: 100px;"><a href="tel:+${contact}" class="${linkColor}">${contact}</a></td>
          <td>${sum}</td>
        </tr>`;

      if (status == uStatus && owner == sName) {
        tr += rowHTML;
      } else if (
        status == "пропозиція" &&
        uStatus == "в роботі" &&
        owner == sName
      ) {
        trr += rowHTML;
      }
    }

    return `<table id="myTable" class="table table-hover table-sm table-responsive text-truncate"><thead>${th}</thead><tbody>${tr}${trr}</tbody></table>`;
  });
}

function myFunction() {
  var input = document.getElementById("myInput");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("myTable");
  var tr = table.getElementsByTagName("tr");

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
  // 🔹 Если поиск очищен → сразу обновляем таблицу
  if (!filter) {
    loadTasks();
  }
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
  autoAllNum.length = 0;
  autoAllmc.length = 0;
  dataArray.length = 0;
  for (var i = 0; i < data.Tf.length; i++) {
    var swap = 0;
    var str = data.Tf[i].c[13].v;
    autoAllNum.push(data.Tf[i].c[13].v);
    autoAllmc.push(data.Tf[i].c[15].v + data.Tf[i].c[25].v);
    for (var j = i; j < data.Tf.length; j++) {
      if (data.Tf[j].c[13].v == str) {
        swap++;
      }
    }
    if (swap == 1 && data.Tf[i].c[13].v != "?") {
      autoNum.push(data.Tf[i].c[13].v);
      autoMake.push(data.Tf[i].c[14].v);
      autoModel.push(data.Tf[i].c[15].v);
      autoColor.push(data.Tf[i].c[16].v);
      autoYear.push(data.Tf[i].c[17].v);
      autoVin.push(data.Tf[i].c[18].v);
      autoMileage.push(data.Tf[i].c[12].v);
      autoClient.push(data.Tf[i].c[25].v);
      autoPhone.push(data.Tf[i].c[26].v);
    }
  }
  //numCheck = data.Tf.length + 1;
  opcNum.length = 0;
  opcMake.length = 0;
  opcModel.length = 0;
  opcColor.length = 0;
  opcYear.length = 0;
  opcClient.length = 0;
  for (var i = autoNum.length - 1; i >= 0; i--) {
    opcNum.push(`<option>${autoNum[i]}</option>`);
  }

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
    var str = data.Tf[i].c[15].v;
    for (var j = i; j < data.Tf.length; j++) {
      if (data.Tf[j].c[15].v == str) {
        swap++;
      }
    }
    if (swap == 1 && data.Tf[i].c[15].v != "?") {
      tempMake.push(data.Tf[i].c[14].v);
      tempModel.push(data.Tf[i].c[15].v);
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

  for (var i = data.Tf.length - 1; i >= 0; i--) {
    var str = data.Tf[i].c[25].v;
    var swap = 0;
    for (var j = i; j >= 0; j--) {
      if (data.Tf[j].c[25].v == str && data.Tf[i].c[25].v != "?") {
        swap++;
      }
    }
    if (swap == 1) {
      for (var n = data.Tf.length - 1; n >= 0; n--) {
        if (data.Tf[n].c[24].v == sName && data.Tf[n].c[25].v == str) {
          opcClient.push(`<option>${data.Tf[i].c[25].v}</option>`);
          break;
        }
      }
    }
  }
  // Собираем подсказки регламент
  for (let i = data.Tf.length - 1; i >= 0; i--) {
    const cellData = data.Tf[i]?.c[36]?.v;
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
    articles = [],
    executors = [];
  servicesData.forEach((service) => {
    serviceNames.push(service.serviceName);
    articles.push(service.article);
    executors.push(service.executor);
  });
  createDatalist("service-regulation", serviceNames);
  createDatalist("article-s", articles);
  createDatalist("executor-s", executors);
  // Создаем datalist
  function createDatalist(id, values) {
    const datalist = document.createElement("datalist");
    datalist.id = id;

    // Добавляем уникальные значения в список опций
    const uniqueValues = new Set(values);
    uniqueValues.forEach((value) => {
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
  autoAllNum = [],
  autoAllmc = [],
  dataArray = [];

function option() {
  var num = $("#num").val();
  var model = $("#model").val();
  var client = $("#client").val();
  function convertToLatin(str) {
    const cyrillicToLatinMap = {
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
    return str
      .replace(/[А-Яа-я]/g, (char) => cyrillicToLatinMap[char] || char)
      .toUpperCase();
  }
  num = convertToLatin(num);
  $("#num").val(num);

  if (num != "") {
    var allNum = autoAllNum.filter((value) => value === num).length;
    $("#allnum").html(`${allNum + 1} -й визит`);
  } else {
    var allmc = autoAllmc.filter((value) => value == model + client).length;
    $("#allnum").html(`${allmc + 1} -й визит`);
  }
  for (i = 0; i < autoNum.length; i++) {
    if (autoNum[i] == num && client == "") {
      $("#make").val(autoMake[i]);
      $("#model").val(autoModel[i]);
      $("#color").val(autoColor[i]);
      $("#year").val(autoYear[i]);
      $("#vin").val(autoVin[i]);
      $("#mileage").val(autoMileage[i]);
      $("#client").val(autoClient[i]);
      $("#phone").val(autoPhone[i]);
      break;
    }
  }
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
var opcNum = [],
  opcMake = [],
  opcModel = [],
  opcColor = [],
  opcYear = [],
  opcClient = [];
function newOrder() {
  const currentTime = moment().tz("Europe/Kiev");
  const vHour = currentTime.format("HH");
  const vMinutes = currentTime.format("mm");
  const vYear = currentTime.format("YYYY");
  const vMonth = currentTime.format("MM");
  const vDay = currentTime.format("DD");

  var title = `Створюємо новий візит до сервісу`;
  var buttons = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Скасувати</button>
            	   <button type="button" class="btn btn-success" id="btn-createVisit" onclick="">Створити</button>`;
  document.querySelector("#commonModal .modal-title").innerHTML = title;
  document.querySelector(
    "#commonModal .modal-body"
  ).innerHTML = `<div class="row">
    <div class="col-6" id="allnum" name="allnum" type="text" style="color: blue; font-size: 14px; text-align: center;"></div>
<div class="col-6" style="color: red; font-size: 12px; text-align: right; margin-bottom: 10px;"><i class="fas fa-pen"></i> Запис</div>
    </div>
    <div class="row">
    <div class="col-6">
    <form class="form-floating">
    <input class="form-control" id="num" placeholder="Держ. номер авто" value="" onchange="option()" list="character">
    <label for="num">Держ. номер авто</label>
    </form>
    <datalist id="character">${opcNum}</datalist>
    </div>
    
    <div class="col-6 ms-auto">
    <form class="form-floating">
    <input type="datetime-local" id="datetime-local" class="form-control" placeholder="Час візиту" min="${vYear}-${vMonth}-${vDay}T${vHour}:${vMinutes}" value="${vYear}-${vMonth}-${vDay}T${vHour}:${vMinutes}" onchange="">
    <label for="datetime-local" class="form-label">Час візиту</label>
    </form>
    </div>
    </div>
    <div class="row text-bg-light p-2">
    <div class="col-6">    
<label for="make" class="form-label">Марка</label>
<input id="make" name="make" class="form-control form-control-sm" type="text" value="" onchange="findModel()" list="character1">
<datalist id="character1">${opcMake}</datalist></div>
<div class="col-6 ms-auto">
<label for="model" class="form-label">Модель</label>
<input id="model" name="model" class="form-control form-control-sm" type="text" value="" onchange="" list="character2">
<datalist id="character2">${opcModel}</datalist></div>
</div>
<div class="row text-bg-light">
<div class="col-6">
<label for="color" class="form-label">Колір</label>
<input id="color" name="color" class="form-control form-control-sm" type="text" value="" onchange="" list="character3">
<datalist id="character3">${opcColor}</datalist></div>
<div class="col-6 ms-auto">
<label for="year" class="form-label">Рік</label>
<input id="year" name="year" class="form-control form-control-sm" type="text" value="" onchange="" list="character4">
<datalist id="character4">${opcYear}</datalist></div></div>
<div class="row text-bg-light p-2">
<div class="col-6">
<label for="vin" class="form-label">Vin-код</label>
<input id="vin" name="vin" class="form-control form-control-sm" type="text" value="" onchange="" list="character5">
<datalist id="character5"></datalist></div>
<div class="col-6 ms-auto">
<label for="mileage" class="form-label">Пробіг</label>
<input id="mileage" name="mileage" class="form-control form-control-sm" type="text" value="" onchange="" list="character6">
<datalist id="character6"></datalist></div></div>
<div class="row">
<div class="col-6">
<label for="client" class="form-label">Клієнт</label>
<input id="client" name="client" class="form-control form-control-sm" type="text" value="" onchange="option()" list="character7">
<datalist id="character7">${opcClient}</datalist></div>
<div class="col-6 ms-auto">
<label for="phone" class="form-label">Тел. Клієнта</label>
<input id="phone" name="phone" class="form-control form-control-sm" type="text" value="" onchange="" list="character8">
<datalist id="character8"></datalist></div></div>`;
  // вставляем кнопки в футер
  document.querySelector("#commonModal .modal-footer").innerHTML = buttons;
  // навешиваем обработчики
  document
    .getElementById("btn-createVisit")
    .addEventListener("click", addCheck);
  // показываем модалку
  const modalEl = document.getElementById("commonModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}
var no;
function addCheck() {
  // 👉 эмулируем клик по вкладке "В роботі" там же сброс фильтра и обновление вкладки
  const tabEl = document.getElementById("nav-home-tab");
  if (tabEl && !tabEl.classList.contains("active")) {
    tabEl.click();
  } else {
    // 🔹 делаем только сброс фильтр если вкладка активна
    const input = document.getElementById("myInput");
    if (input) input.value = "";
  }

  // ✅ Получаем валюту из localStorage
  const savedCurrency = localStorage.getItem("user_currency");

  // Получаем значения из формы
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
  const body = `logo=${encodeURIComponent(logo)}&address=${encodeURIComponent(
    address
  )}&sContact=${encodeURIComponent(sContact)}&vfolder=${encodeURIComponent(
    vfolder
  )}&sName=${encodeURIComponent(sName)}&userTimeZone=${encodeURIComponent(
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
  )}&action=${encodeURIComponent(action)}`;

  // 🔹 очищаем содержимое модалки
  const modalEl = document.getElementById("commonModal");
  modalEl.querySelector(".modal-body").innerHTML = "";
  modalEl.querySelector(".modal-footer").innerHTML = "";

  // Показываем сообщение "В процесі..."
  const alertArea = modalEl.querySelector(".alert-area");
  if (alertArea) {
    alertArea.innerHTML = `
      <div class="alert alert-success d-flex align-items-center" role="alert">
        <div class="spinner-border text-success me-2" role="status" style="width: 1rem; height: 1rem;"></div>
        В процесі....
      </div>
    `;
  }

  // Отправка POST запроса
  const xhr = new XMLHttpRequest();
  xhr.open("POST", myApp, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      no = Number(xhr.responseText) - 2;

      // Показываем сообщение "Готово!"
      if (alertArea) {
        alertArea.innerHTML = `<div class="alert alert-success" role="alert">Готово!</div>`;
      }
      // Ждём пока обновит таблицу
      loadTasks();
      // Проверяем наличие строки каждые 200мс
      const checkRow = setInterval(() => {
        const newString = document.querySelector(`tr[name="${no}"]`);
        if (newString) {
          clearInterval(checkRow);

          // Подсветка строки
          newString.classList.remove("flash-success");
          void newString.offsetWidth; // перезапуск анимации
          newString.classList.add("flash-success");

          // Убираем alert и открываем модалку
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
  const buttons = `<button class="btn btn-outline-secondary" onclick="printVisitFromModal()">Друк PDF</button>
  <button type="button" class="btn btn-success" id="btn-save" data-bs-dismiss="modal">Закрити</button>`;

  const dataMarkupSet =
    data.Tf[no].c[7] && data.Tf[no].c[7].v ? data.Tf[no].c[7].v : dataMarkup;
  const dataPayrateSet =
    data.Tf[no].c[8] && data.Tf[no].c[8].v ? data.Tf[no].c[8].v : dataPayrate;
  const comment =
    data.Tf[no].c[23] && data.Tf[no].c[23].v ? data.Tf[no].c[23].v : "";
  const dataDiscountl =
    data.Tf[no].c[27] && data.Tf[no].c[27].v ? data.Tf[no].c[27].v : 0;
  const dataDiscountr =
    data.Tf[no].c[37] && data.Tf[no].c[37].v ? data.Tf[no].c[37].v : 0;
  const normazp =
    data.Tf[no].c[28] && data.Tf[no].c[28].v ? data.Tf[no].c[28].v : 0;
  const razom =
    data.Tf[no].c[29] && data.Tf[no].c[29].v ? data.Tf[no].c[29].v : 0;
  const zakupka =
    data.Tf[no].c[33] && data.Tf[no].c[33].v ? data.Tf[no].c[33].v : 0;
  const currency =
    data.Tf[no].c[34] && data.Tf[no].c[34].v ? data.Tf[no].c[34].v : "";
  // Основная часть модального окна
  document.querySelector("#commonModal .modal-title").innerHTML = title;
  document.querySelector(
    "#commonModal .modal-body"
  ).innerHTML = `<table style="width: 100%; margin-bottom: 20px;"><tr>
    <td><div class="editable editable-content" data-key="editCarInfo">${data.Tf[no].c[20].v}</div></td><td>
        <select id="typeStatus" class="form-select form-select-sm" onchange="saveChanges()">
          <option value="пропозиція">пропозиція</option>
          <option value="в роботі">в роботі</option>
          <option value="виконано">виконано</option>
          <option value="в архів">в архів</option>
          <option value="factura">factura</option>
        </select></td></tr><tr><td><div class="editable editable-content" data-key="editNumplate">${data.Tf[no].c[13].v}</div></td><td>
        <div style="display: flex; gap: 10px;">
        <select id="typeForm" class="form-select form-select-sm" onchange="saveChanges()">
        <option value="готів.">готів.</option>
        <option value="безгот.">безгот.</option>
      </select>
      <select id="typeCurrency" class="form-select form-select-sm" onchange="saveChanges()">
      <option value="грн.">грн.</option>
      <option value="$">$</option>
      <option value="€">€</option>
    </select>
        </div>
      </td>
    </tr>
    <tr>
    <td><div class="editable editable-content" data-key="editVin">${data.Tf[no].c[21].v}</div></td>
      <td><div class="editable editable-content" data-key="editContact">${data.Tf[no].c[26].v}</div></td>
    </tr>
    <tr>
    <td><div class="editable editable-content" data-key="editMileage">${data.Tf[no].c[12].v}</div></td>
    <td><div class="editable editable-content" data-key="editClient">${data.Tf[no].c[25].v}</div></td>
    </tr>
  </table>

  <table style="width: 100%;">
  <tr class="table-header" style="border-color: transparent;">
  <td colspan="1" style="text-align: left; width: 40%;"></td>
  <td colspan="2" class="tab-column order" style="width: 15%; text-align: right;"><div class="editable editable-content" data-key="editdiscountl">${dataDiscountl}</div></td><td colspan="2" class="tab-column order" style="width: 15%; text-align: right;"><div class="editable editable-content" data-key="editdiscountr">${dataDiscountr}</div></td>
  <td colspan="3" class="tab-column goods d-none" style="width: 25%; text-align: right;"><div class="editable editable-content" data-key="editMarkup">${dataMarkupSet}</div></td>
  <td colspan="3" class="tab-column work d-none" style="width: 25%; text-align: right;"><div class="editable editable-content" data-key="editPayrate">${dataPayrateSet}</div></td>
  </tr>
  <tr class="table-header" style="border-color: transparent;">
  <td colspan="5" style="text-align: left; width: 45%;">
  <div class="tab-cell" style="display:flex;flex-direction:column;gap:4px;">
    <nav class="mb-0 tab-controls" aria-hidden="false">
      <div class="nav nav-tabmodals nav-pills nav-sm" id="nav-tabmodal" role="tablist">
        <button class="nav-link active text-uppercase text-dark lng-orderTab" data-tab="order" type="button" role="tab">замовлення</button>
        <button class="nav-link text-uppercase text-secondary lng-goodsTab" data-tab="goods" type="button" role="tab">товарний лист</button>
        <button class="nav-link text-uppercase text-secondary lng-workTab" data-tab="work" type="button" role="tab">робочий лист</button>
      </div>
    </nav>
    <!-- Этот блок хранит название активной вкладки. По умолчанию скрыт в UI, нужен для печати и (опционально) для простого отображения имени -->
    <div class="active-tab-name d-none" aria-hidden="true" style="font-weight:700; font-size:0.95rem;"></div>
  </div></td></tr></table>

<table id="headlines" class="table table-bordered table-sm mt-0">
  <thead><tr>
      <th style="width: 5%;">№</th>
      <th style="width: 40%;">Послуга / Товар</th>
      <th class="tab-column order" style="width: 5%;">Δ</th>
      <th class="tab-column order" style="width: 15%;">₴ послуга</th>
      <th class="tab-column order" style="width: 15%;">₴ товар</th>
      <th class="tab-column goods d-none" style="width: 5%;">Σ</th>
      <th class="tab-column goods d-none" style="width: 15%;">артикул</th>
      <th class="tab-column goods d-none" style="width: 15%;">собіварт</th>
      <th class="tab-column work d-none" style="width: 5%;">t</th>
      <th class="tab-column work d-none" style="width: 15%;">виконав</th>
      <th class="tab-column work d-none" style="width: 15%;">норма зп</th>
    </tr></thead>
  <tbody id="table-body"></tbody>
  <tfoot>
  <tr class="table-footer" style="border-color: transparent;">
  <!-- Спаренная ячейка для comment -->
  <td colspan="2" class="editable" data-key="editComment" style="text-align: left; vertical-align: top; word-wrap: break-word; width: 45%;">
    ${comment}</td>

  <!-- Δ, ₴ послуга, ₴ товар (вкладка order) -->
  <td colspan="3" class="tab-column order" style="width: 25%; text-align: right; vertical-align: top; padding-top: 20px;">
    <strong id="sumCellDisplay">${razom} ${currency}</strong></td>

  <!-- Σ, артикул, вартість (вкладка goods) -->
  <td colspan="3" class="tab-column goods d-none" style="width: 25%; text-align: right; vertical-align: top; padding-top: 20px;">
    <strong id="sumCostDisplay">${zakupka} ${currency}</strong></td>

  <!-- t, виконав, норма зп (вкладка work) -->
  <td colspan="3" class="tab-column work d-none" style="width: 25%; text-align: right; vertical-align: top; padding-top: 20px;">
    <strong id="sumSalaryNormDisplay">${normazp} ${currency}</strong></td></tr>
</tfoot>
</table>`;

  document.querySelectorAll(".editable").forEach((td) => {
    td.addEventListener("click", function () {
      const statusValue = document.getElementById("typeStatus")?.value;
      if (
        statusValue === "виконано" ||
        statusValue === "factura" ||
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

      // Обработка завершения редактирования
      input.addEventListener("blur", () => {
        const newValue = input.value.trim();
        td.textContent = newValue;
        td.setAttribute("data-value", newValue); // сохраняем новое значение
        saveChanges();
      });

      // Нажатие Enter = тоже blur
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
      });
    });
  });

  const selectedStatus = (data.Tf[no].c[4]?.v || "пропозиція").toLowerCase();
  const selectedForm = data.Tf[no].c[30]?.v || "готів.";
  const selectedCurrency = data.Tf[no].c[34]?.v || "грн.";
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
  const dataReg =
    data.Tf[no].c[36] && data.Tf[no].c[36].v ? data.Tf[no].c[36].v : "";

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
    // normalize
    tab = tab || "order";

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

  activateTab("order"); // активируем вкладку "замовлення" по умолчанию

  const observer = new MutationObserver(() => {
    const activeTab =
      document.querySelector(".tab-btn.active")?.dataset.tab || "order";
    activateTab(activeTab); // применяем текущую вкладку к новой строке
  });
  observer.observe(tableBody, { childList: true });

  // вставляем кнопки в футер
  document.querySelector("#commonModal .modal-footer").innerHTML = buttons;
  // показываем модалку
  const modalEl = document.getElementById("commonModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
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
    parseFloat(dataMarkupInEl?.textContent?.trim()?.replace(",", ".")) || 0;
  let payrate =
    parseFloat(dataPayrateInEl?.textContent?.trim()?.replace(",", ".")) || 0;

  // Скидка услуга
  let discountl =
    parseFloat(discountInl?.textContent?.trim()?.replace(",", ".")) || 0;
  if (discountl > 100) discountl = 100;
  if (discountl < 0) discountl = 0;
  if (discountInl)
    discountInl.textContent = discountl.toString().replace(".", ",");
  // Скидка товар
  let discountr =
    parseFloat(discountInR?.textContent?.trim()?.replace(",", ".")) || 0;
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
    if (!isNaN(costVal) && costVal > 0 && !productCell.textContent.trim()) {
      const productPrice = costVal * (1 + markup / 100);
      productCell.textContent = formatNumber(productPrice);
    }

    // Цена услуги и расчет нормы ЗП
    const serviceVal = parseCell(3);
    const salaryNormCell = cells[10];

    const salaryNormPrice = serviceVal * (payrate / 100);
    salaryNormCell.textContent =
      !isNaN(serviceVal) && serviceVal > 0 ? formatNumber(salaryNormPrice) : "";

    sumLeft += parseCell(3);
    sumRight += parseCell(4);
    sumCost += parseCell(7);
    sumSalaryNorm += parseCell(10);
  });

  const sumLeftDiscounted = sumLeft * discountMultiplierL;
  const sumRightDiscounted = sumRight * discountMultiplierR;
  const sumSalaryNormDiscounted = sumSalaryNorm * discountMultiplierL;
  const sumTotal = sumLeftDiscounted + sumRightDiscounted;

  const currency = document.getElementById("typeCurrency").value;

  const sumCell = document.getElementById("sumCellDisplay");
  if (sumCell) {
    sumCell.setAttribute("data-sum", formatNumber(sumTotal));
    sumCell.textContent = `${formatNumber(sumTotal)} ${currency}`;
  }

  const sumcostCell = document.getElementById("sumCostDisplay");
  if (sumcostCell) {
    sumcostCell.setAttribute("data-sum", formatNumber(sumCost));
    sumcostCell.textContent = `${formatNumber(sumCost)} ${currency}`;
  }

  const sumsalaryNormCell = document.getElementById("sumSalaryNormDisplay");
  if (sumsalaryNormCell) {
    sumsalaryNormCell.setAttribute(
      "data-sum",
      formatNumber(sumSalaryNormDiscounted)
    );
    sumsalaryNormCell.textContent = `${formatNumber(
      sumSalaryNormDiscounted
    )} ${currency}`;
  }

  return {
    sumLeft: formatNumber(sumLeftDiscounted),
    sumRight: formatNumber(sumRightDiscounted),
    sumTotal: formatNumber(sumTotal),
    sumCost: formatNumber(sumCost),
    sumSalaryNorm: formatNumber(sumSalaryNormDiscounted),
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
      saveButton.textContent = "Зберегти";
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
    td.classList.add("tab-column", colClasses[i - 1], "d-none");
    td.addEventListener("click", () => switchToInput(td, i));
    tr.appendChild(td);
  }

  return tr;
}

// Функция для переключения на поле ввода
function switchToInput(td, colIndex) {
  const statusValue = document.getElementById("typeStatus")?.value;
  if (
    statusValue === "виконано" ||
    statusValue === "factura" ||
    activated === false
  )
    return; // Блокировка клика при виконано
  // Защита от повторной активации, если уже есть input
  if (td.querySelector("input")) return;
  const currentValue = td.dataset.value || "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = currentValue;
  input.classList.add("form-control", "form-control-sm");

  // Подключение подсказок
  if (colIndex === 0) {
    input.setAttribute("list", "service-regulation");
  } else if (colIndex === 5) {
    input.setAttribute("list", "article-s");
  } else if (colIndex === 8) {
    input.setAttribute("list", "executor-s");
  }

  // Автозаполнение оставшихся полей при выборе "Регламент"
  if (colIndex === 0) {
    input.addEventListener("input", () => {
      const selected = servicesData.find(
        (service) => service.serviceName === input.value.trim()
      );
      if (selected) {
        const tr = td.closest("tr");
        const cells = tr.querySelectorAll("td");
        // Заполняем Δ, Ціна послуга, Ціна товар
        if (price) {
          // 🔹 есть ссылка на прайс
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
          // 🔹 нет ссылки на прайс
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

  td.innerHTML = ""; // ← Очищаем только после чтения значения
  td.appendChild(input);
  input.focus();

  // Blur при выборе значения из списка
  input.addEventListener("change", () => {
    input.blur();
  });
  // Enter поведение
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
      setTimeout(() => {
        const addButton = document.querySelector(".add-row-btn");
        addButton?.focus();
      }, 0);
    }
  });

  input.addEventListener("blur", () => {
    const newValue = input.value.trim();
    td.textContent = newValue;
    td.dataset.value = newValue; // Сохраняем в data-атрибут для следующих раз
    updateRowNumbers(document.getElementById("table-body"));
    updateAddRowButton(document.getElementById("table-body"));
    updateSumFromTable();
    saveChanges();
  });

  // Запуск функции обновления данных при изменении значения
  input.addEventListener("input", () => {
    //saveChanges(); // Отправляем данные на сервер
    // Изменяем вид кнопки
    const saveButton = document.getElementById("btn-save");
    saveButton.textContent = "Зберегти";
    saveButton.classList.remove("btn-success");
    saveButton.classList.add("btn-danger");
    // Изменяем функциональность кнопки Зберегти
    saveButton.onclick = () => {
      saveChanges();
    };
  });
}
//---------------------------------------------------------------------------------------------------
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
          activated === false
        )
          return; // блокировка удаления
        row.remove();
        updateSumFromTable();
        updateRowNumbers(tableBody);
        updateAddRowButton(tableBody);
        const saveButton = document.getElementById("btn-save");
        saveButton.textContent = "Зберегти";
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
    )}&tasks=${encodeURIComponent(tasks)}&userTimeZone=${encodeURIComponent(
      userTimeZone
    )}&rowNumber=${encodeURIComponent(rowNumber)}&value=${encodeURIComponent(
      newDataString
    )}&action=${encodeURIComponent(action)}`;

    const saveButton = document.getElementById("btn-save");
    saveButton.textContent = "Збереження...";
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
        console.log("Данные успешно обновлены:", result);
        // Простая замена текста в ячейке
        if (result.visitNumber) {
          const visitCell = document.getElementById("visitNumberCell");
          if (visitCell) visitCell.textContent = result.visitNumber;
        }
        saveButton.textContent = "Закрити";
        saveButton.classList.remove("btn-warning");
        saveButton.classList.add("btn-success");
        saveButton.onclick = () => $("#commonModal").modal("hide");
        loadTasks();
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        saveButton.textContent = "Помилка";
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

  // клонируем
  const clone = modal.cloneNode(true);

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
  if (activeTabName === "замовлення" && recvisit) {
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
  
    .editable:hover {
      background-color: #e9f5ff;
      cursor: pointer;
    }
    .editable[data-key="editComment"]::before {
      content: "Нотатки ✏️ ";
      opacity: 0.5;
      margin-left: 4px;
    }
    .editable-content {
      display: inline-flex;
      gap: 4px;
      box-sizing: border-box;
    }
    .editable-content[data-key="editdiscountl"]::before {
      content: "послуга ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editdiscountl"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editdiscountr"]::before {
      content: "товар ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editdiscountr"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editMarkup"]::before {
      content: "націнка ";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editMarkup"]::after {
      content: " %";
      opacity: 0.5;
      font-size: 0.9em;
    }
    .editable-content[data-key="editPayrate"]::before {
      content: "зарплата ";
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
      content: "m/ km: ";
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
      <head><title>Документ візиту</title>${styles}</head>
      <body>
        ${wrapper.innerHTML}
        <script>window.onload = function(){ window.print(); }</script>
      </body>
    </html>`);
  printWindow.document.close();
}
//---------------------------------------------------------------------------------------------------
function addReportModal() {
  var title = `Створюємо звіт`;
  var buttons = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Скасувати</button>
            	   <button type="button" class="btn btn-success" onclick="addReport()">Створити</button>`;
  $("#commonReport .modal-header .modal-title").html(title);
  $("#commonReport .modal-body").html(function () {
    return `<label for="typeReport" class="form-label">Тип звіту</label>
<select id="typeReport" name="typeReport" class="form-select" type="text" value="" onchange="addInputClient()" list="characterR">
<option selected>За виконаними замовленнями</option><option>Фінансовий (основний)</option><option>Популярні продажі</option><option>За проданими товарами</option><option>По клієнту</option></select>
<br><div id="addInput"></div><br>
<div class="row"><div class="col">
<label for="sdate" class="form-label">Дата початку</label>
<input id="sdate" name="sdate" class="form-control" type="date" placeholder="" onchange="">
</div><div class="col">
<label for="pdate" class="form-label">Дата кінець</label>
<input id="pdate" name="pdate" class="form-control" type="date" placeholder="" onchange="">
</div></div>`;
  });
  $("#commonReport .modal-footer").html(buttons);
  // показываем модалку
  const modal = new bootstrap.Modal(document.getElementById("commonReport"));
  modal.show();
}

function addInputClient() {
  var inClient = `<div class="form-control"><label for="client" class="form-label">Вкажіть ім'я клієнта</label>
<input id="client" name="client" class="form-control form-control-sm" type="text" value="" onchange="" list="character7">
<datalist id="character7">${opcClient}</datalist></div>`;
  var typeReport = $("#typeReport").val();
  if (typeReport == "По клієнту") {
    $("#addInput").html(inClient);
  } else {
    $("#addInput").html("");
  }
}

var action = [];
function addReport() {
  var typeReport = $("#typeReport").val();
  action.length = 0;
  if (typeReport == "За виконаними замовленнями") {
    action.push("reportVal");
  }
  if (typeReport == "Фінансовий (основний)") {
    action.push("reportFin");
  }
  if (typeReport == "Популярні продажі") {
    action.push("reportServices");
  }
  if (typeReport == "За проданими товарами") {
    action.push("reportGoods");
  }
  if (typeReport == "По клієнту") {
    action.push("reportClient");
  }
  var sdate = $("#sdate").val();
  var pdate = $("#pdate").val();
  var client = $("#client").val();

  var body = `logo=${encodeURIComponent(logo)}&sName=${encodeURIComponent(
    sName
  )}&rfolder=${encodeURIComponent(rfolder)}&tasks=${encodeURIComponent(
    tasks
  )}&userTimeZone=${encodeURIComponent(
    userTimeZone
  )}&sdate=${encodeURIComponent(sdate)}&pdate=${encodeURIComponent(
    pdate
  )}&client=${encodeURIComponent(client)}&action=${encodeURIComponent(action)}`;
  $("#commonReport .modal-body, .modal-footer").html("");
  $("#commonReport .alert-area").html(
    `<div class="alert alert-success" role="alert"><div class="spinner-border text-success" role="status"></div> В процесі....</div>`
  );
  var xhr = new XMLHttpRequest();
  xhr.open("POST", myApp, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response == "nofind") {
        $("#commonReport .alert-area").html(
          `<div class="alert alert-warning" role="alert">Нічого не знайдено!<br>Виберіть іншу дату.</div>`
        );
        setTimeout(() => {
          $(".alert").alert("close");
          addReportModal();
        }, 2000);
        return;
      } else {
        window.open(xhr.response);
      }
      $(".alert").alert("close");
      $("#commonReport").modal("hide");
    }
  };
  try {
    xhr.send(body);
  } catch (err) {
    console.log(err);
  }
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
    // Обрабатываем ответ
    var usersDiv = document.getElementById("users-email");
    usersDiv.innerHTML = "Ваші користувачі:<br>"; // вставляем заголовок
    renderEmailGroup(usersDiv, "manager", serverResponse.managerUsers);
    renderEmailGroup(usersDiv, "master", serverResponse.masterUsers);
    renderEmailGroup(usersDiv, "owner", serverResponse.ownerUsers);
    renderEmailGroup(usersDiv, "admin", serverResponse.adminUsers);
    role = serverResponse.role;
    sName = serverResponse.sName;
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
    vfolder = serverResponse.vfolder;
    rfolder = serverResponse.rfolder;
    dataMarkup = serverResponse.dataMarkup;
    dataPayrate = serverResponse.dataPayrate;
    vat = serverResponse.vat;
    recvisit = serverResponse.recvisit;
    document.getElementById("offcanvasNavbarLabel").innerHTML = sName; // Отображаем sName
    const roleText =
      role === "master"
        ? "serviceAccess"
        : role === "admin"
        ? "viewOnly"
        : "fullAccess";
    document.getElementById("role").innerText = roleText;
    var priceLink = document.getElementById("price-link");
    if (price && price.trim() !== "") {
      priceLink.href = price;
      priceLink.textContent = "Прайс";
      priceLink.style.display = "inline"; // на случай если элемент скрыт
    } else {
      priceLink.textContent = "";
      priceLink.removeAttribute("href");
      priceLink.style.display = "none"; // скрыть, если ссылки нет
    }
    loadTasks();
    setTimeout(() => {
      $("#offcanvasNavbar").offcanvas("hide");
    }, 1000);
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
