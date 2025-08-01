var wlink = window.location.search.replace("?", "");
var hash = window.location.hash.substr(1);
var select = document.querySelector(".change-lang");
var allLang = ["ua", "ru", "en", "de", "es"];
var myApp =
  "https://script.google.com/macros/s/AKfycby5F_W8xIFdQZ4oGP75uXELFHp6KCY27El1oLBcXUU_d8ycZ1Ysfm54Lmt8UELvuJc/exec";
var sName = "";
var tasks = "";
var logo = "";
var sContact = "";
var address = "";
var currency = "";
var vfolder = "";
var rfolder = "";
var role = "";

document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("user_name");
  const userData = localStorage.getItem("user_data");

  if (userData) {
    document.getElementById("welcomeMessage").innerText = name; //`${name}`
    document.getElementById("signInButton").classList.add("d-none"); // скрыть кнопку входа
    document.getElementById("logoutButton").style.display = "block"; // показат кнопку выхода
    try {
      const parsedUserData = JSON.parse(userData);
      $("#offcanvasNavbarLabel").html("");
      getUserData(parsedUserData);
    } catch (e) {
      console.error("Ошибка при разборе сохраненных данных:", e);
    }
  }
});
/*$(document).ready(function () {
  $("#offcanvasNavbar").offcanvas("show");
});*/
var uStatus = [];
const triggerTabList = document.querySelectorAll("#nav-tab button");
triggerTabList.forEach((triggerEl) => {
  triggerEl.addEventListener("click", (event) => {
    uStatus.length = 0;
    if (triggerEl.innerText == "В роботі") {
      uStatus.push("в роботі");
    }
    if (triggerEl.innerText == "Закриті") {
      uStatus.push("виконано");
    }
    if (triggerEl.innerText == "Скасовані") {
      uStatus.push("в архів");
    }
    $("#myTable tbody").html(
      `<span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>`
    );
    loadTasks();
  });
});
uStatus.push("в роботі");

var data;
function loadTasks() {
  googleQuery(tasks, "0", "D:AN", `SELECT *`);
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
      data.Tf[row] && data.Tf[row].c[col] && data.Tf[row].c[col].v
        ? data.Tf[row].c[col].v
        : "";
    const getValF = (row, col) =>
      data.Tf[row] && data.Tf[row].c[col] && data.Tf[row].c[col].f
        ? data.Tf[row].c[col].f
        : getVal(row, col);

    const th = `
      <tr class="border-bottom border-info">
        <th class="text-secondary lng-unit"></th>
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
      const sum = `${getVal(i, 29)} ${getVal(i, 30)}`;

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
          <td text-truncate" style="max-width: 70px;">${numplate}</td>
          <td text-start text-truncate" style="max-width: 170px;">${name}</td>
          <td text-start text-truncate" style="min-width: 120px; max-width: 180px;">${client}</td>
          <td text-truncate" style="max-width: 100px;"><a href="tel:+${contact}" class="${linkColor}">${contact}</a></td>
          <td text-end">${sum}</td>
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

    return `<table id="myTable" class="table text-center table-hover table-sm table-responsive text-truncate"><thead>${th}</thead><tbody>${tr}${trr}</tbody></table>`;
  });

  $("#offcanvasNavbar").offcanvas("hide");
}

//<td style="max-width: 40px;"><div class="button-wrapper">${data.Tf[i].c[2]?.v?.startsWith("http") ? `<a href="${data.Tf[i].c[2].v}" target="_blank" class="text-dark"><i class="bi bi-forward"></i></a>` : `<span class="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>`}</div></td>
function myFunction() {
  var input, filter, table, tr, td, td1, td2, td3, td4, td5, td6, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    td1 = tr[i].getElementsByTagName("td")[1];
    td2 = tr[i].getElementsByTagName("td")[2];
    td3 = tr[i].getElementsByTagName("td")[3];
    td4 = tr[i].getElementsByTagName("td")[4];
    td5 = tr[i].getElementsByTagName("td")[5];
    td6 = tr[i].getElementsByTagName("td")[6];
    if (td) {
      if (
        td.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td1.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td2.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td3.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td4.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td5.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td6.innerHTML.toUpperCase().indexOf(filter) > -1
      ) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
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
            article: columns[5]?.trim() || "",
            costPrice: columns[6]?.trim() || "",
            executor: columns[8]?.trim() || "",
            normSalary: columns[9]?.trim() || "",
          })
        );
      }
    });
  });

  servicesData = Array.from(servicesSet).map((service) => JSON.parse(service));
  var serviceNames = [],
    serviceQuantities = [],
    servicePrices = [],
    itemPrices = [];
  servicesData.forEach((service) => {
    serviceNames.push(service.serviceName);
    serviceQuantities.push(service.quantity);
    servicePrices.push(service.servicePrice);
    itemPrices.push(service.itemPrice);
  });
  createDatalist("service-regulation", serviceNames);
  createDatalist("service-delta", serviceQuantities);
  createDatalist("service-price", servicePrices);
  createDatalist("item-price", itemPrices);
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
            	   <button type="button" class="btn btn-success" id="btn-createVisit" onclick="addCheck()">Створити</button>`;
  $("#commonModal .modal-header .modal-title").html(title);
  $("#commonModal .modal-body").html(function () {
    return `<div class="row">
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
    <input type="datetime-local" id="datetime-local" class="form-control" placeholder="Час візиту" min="${vYear}-${vMonth}-${vDay} ${vHour}:${vMinutes}" value="${vYear}-${vMonth}-${vDay} ${vHour}:${vMinutes}" onchange="">
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
  });
  $("#commonModal .modal-footer").html(buttons);
  $("#commonModal").modal("show");
}
var no;
function addCheck() {
  var nomer = $("#num").val();
  var visitnum =
    $("#allnum").text() == "" ? "0" : $("#allnum").text().match(/\d+/)[0];
  var record = $("#datetime-local").val();
  var make = $("#make").val() == "?" ? "" : $("#make").val();
  var model = $("#model").val() == "?" ? "" : $("#model").val();
  var color = $("#color").val() == "?" ? "" : $("#color").val();
  var year = $("#year").val() == "0" ? "" : $("#year").val();
  var vin = $("#vin").val() == "?" ? "" : $("#vin").val();
  var mileage = $("#mileage").val() == "?" ? "" : $("#mileage").val();
  var client = $("#client").val() == "?" ? "" : $("#client").val();
  var phone = $("#phone").val() == "?" ? "" : $("#phone").val();
  var action = "addCheck";
  var body = `logo=${encodeURIComponent(logo)}&address=${encodeURIComponent(
    address
  )}&sContact=${encodeURIComponent(sContact)}&vfolder=${encodeURIComponent(
    vfolder
  )}&sName=${encodeURIComponent(sName)}&tasks=${encodeURIComponent(
    tasks
  )}&nomer=${encodeURIComponent(nomer)}&visitnum=${encodeURIComponent(
    visitnum
  )}&record=${encodeURIComponent(record)}&make=${encodeURIComponent(
    make
  )}&model=${encodeURIComponent(model)}&color=${encodeURIComponent(
    color
  )}&year=${encodeURIComponent(year)}&vin=${encodeURIComponent(
    vin
  )}&mileage=${encodeURIComponent(mileage)}&client=${encodeURIComponent(
    client
  )}&phone=${encodeURIComponent(phone)}&action=${encodeURIComponent(action)}`;
  $("#commonModal .modal-body, .modal-footer").html("");
  $("#commonModal .alert-area").html(
    `<div class="alert alert-success" role="alert"><div class="spinner-border text-success" role="status"></div> В процесі....</div>`
  );

  var xhr = new XMLHttpRequest();
  xhr.open("POST", myApp, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      no = Number(xhr.response) - 2;
      // Закрываем сообщение и модальное окно
      $(".alert").alert("close");
      $("#commonModal").modal("hide");
      loadTasks();
      // Изменяем цвет строки
      setTimeout(() => {
        const newString = document.querySelector(`tr[name="${no}"]`);
        if (newString) {
          newString.classList.remove("flash-success"); // сброс
          void newString.offsetWidth; // перезапуск анимации
          newString.classList.add("flash-success");
        }
        // Открываем новый визит в модальном окне
        setTimeout(() => {
          editOrder();
        }, 0);
        // Убираем цвет строки после открытия нового модального окна
      }, 1500); // Даем время для обновления DOM после обновления ЛоадТаск
    }
  };
  try {
    xhr.send(body);
  } catch (err) {
    console.log(err);
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
  const comment =
    data.Tf[no].c[23] && data.Tf[no].c[23].v ? data.Tf[no].c[23].v : "";

  // Заголовок модального окна
  const title = `
  <div class="d-flex justify-content-between w-100 fs-6 fst-italic">
    <div class="text-start">${data.Tf[no].c[3].v}</div>
    <div class="text-end">${data.Tf[no].c[0].f} - ${data.Tf[no].c[1].f}</div>
  </div>`;

  // Кнопки модального окна
  const buttons = `<button class="btn btn-outline-secondary" onclick="printVisitFromModal()">Друк PDF</button>
  <button type="button" class="btn btn-success" id="btn-save" onclick="$('#commonModal').modal('hide');">Закрити</button>`;

  // Основная часть модального окна
  document.querySelector("#commonModal .modal-title").innerHTML = title;
  document.querySelector(
    "#commonModal .modal-body"
  ).innerHTML = `<table style="width: 100%; margin-bottom: 20px;"><tr>
    <td class="editable" data-key="editCarInfo">${data.Tf[no].c[14].v} ${data.Tf[no].c[15].v} ${data.Tf[no].c[16].v} ${data.Tf[no].c[17].v}</td><td>
        <select id="typeStatus" class="form-select form-select-sm" onchange="saveChanges()">
          <option value="пропозиція">пропозиція</option>
          <option value="в роботі">в роботі</option>
          <option value="виконано">виконано</option>
          <option value="в архів">в архів</option>
        </select></td></tr><tr><td class="editable" data-key="editNumplate">${data.Tf[no].c[13].v}</td><td>
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
    <td class="editable" data-key="editVin">${data.Tf[no].c[21].v}</td>
      <td class="editable" data-key="editContact">${data.Tf[no].c[26].v}</td>
    </tr>
    <tr>
    <td class="editable" data-key="editMileage">${data.Tf[no].c[12].v}</td>
    <td class="editable" data-key="editClient">${data.Tf[no].c[25].v}</td>
    </tr>
  </table>
  <div class="tab-controls d-flex mb-2">
  <button class="btn btn-warning btn-sm me-1 tab-btn active" data-tab="order">замовлення</button>
  <button class="btn btn-info btn-sm me-1 tab-btn" data-tab="goods">товарний лист</button>
  <button class="btn btn-success btn-sm me-1 tab-btn" data-tab="work">робочий лист</button>
</div>

<table class="table table-bordered table-sm">
  <thead>
    <tr>
      <th style="width: 5%;">№</th>
      <th style="width: 40%;">Послуга / Товар</th>
      <th class="tab-column order" style="width: 5%;">Δ</th>
      <th class="tab-column order" style="width: 15%;">ціна послуги</th>
      <th class="tab-column order" style="width: 15%;">ціна товару</th>
      <th class="tab-column goods d-none" style="width: 5%;">Кіл-ть</th>
      <th class="tab-column goods d-none" style="width: 15%;">Артикул</th>
      <th class="tab-column goods d-none" style="width: 15%;">Собівартість</th>
      <th class="tab-column work d-none" style="width: 5%;">t</th>
      <th class="tab-column work d-none" style="width: 15%;">Виконавець</th>
      <th class="tab-column work d-none" style="width: 15%;">Норма з/п</th>
    </tr>
  </thead>
  <tbody id="table-body"></tbody>
</table>

<table style="width: 100%; margin-bottom: 20px;">
  <tr>
    <td class="editable" data-key="editComment" style="width: 60%; text-align: left; vertical-align: top; word-wrap: break-word;">${comment}</td>
    <td class="editable" data-key="editdiscount"
        style="width: 10%; text-align: center;">${data.Tf[no].c[27].v}</td>
    <td id="sumCellDisplay"
        style="width: 20%; text-align: right;">
        <strong>${data.Tf[no].c[29].v}</strong>
    </td>
    <td id="selectedCurrencyText"
        style="width: 10%; text-align: right;">
      ${data.Tf[no].c[34].v}
    </td>
  </tr>
</table>`;

  document.querySelectorAll(".editable").forEach((td) => {
    td.addEventListener("click", function () {
      const statusValue = document.getElementById("typeStatus")?.value;
      if (statusValue === "виконано") return; // Блокировка редактирования
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
      document.getElementById("selectedCurrencyText").textContent = this.value;
    });

  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = ""; // Очищаем тело таблицы
  //---------------------------------------------------------------------------------------------------
  // Если данных нет, создаем одну пустую строку
  const dataReg = data.Tf[no].c[36].v || "";
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
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove(
        "btn-warning",
        "bg-info",
        "bg-success",
        "text-white",
        "active"
      );
      b.classList.add("btn-light");
    });

    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    activeBtn.classList.remove("btn-light");
    activeBtn.classList.add("active", "text-white");
    if (tab === "order") activeBtn.classList.add("btn-warning");
    if (tab === "goods") activeBtn.classList.add("bg-info");
    if (tab === "work") activeBtn.classList.add("bg-success");

    document.querySelectorAll(".tab-column").forEach((col) => {
      if (col.classList.contains(tab)) {
        col.classList.remove("d-none");
      } else {
        col.classList.add("d-none");
      }
    });
  }
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  activateTab("order"); // активируем вкладку "замовлення" по умолчанию

  const observer = new MutationObserver(() => {
    const activeTab =
      document.querySelector(".tab-btn.active")?.dataset.tab || "order";
    activateTab(activeTab); // применяем текущую вкладку к новой строке
  });
  observer.observe(tableBody, { childList: true });

  $("#commonModal .modal-footer").html(buttons);
  $("#commonModal").modal("show");
}

function updateSumFromTable() {
  const tableBody = document.getElementById("table-body");
  const discountIn = document.querySelector('[data-key="editdiscount"]');
  if (!tableBody) return { sumLeft: 0, sumRight: 0, sumTotal: 0 };

  let sumLeft = 0; // ціна послуги
  let sumRight = 0; // ціна товару
  let sumCost = 0; // собівартість
  let sumSalaryNorm = 0; // норма з/п

  // Скидка
  let discount =
    parseFloat(discountIn?.textContent?.trim()?.replace(",", ".")) || 0;
  if (discount > 100) discount = 100;
  if (discount < 0) discount = 0;
  if (discountIn)
    discountIn.textContent = discount.toString().replace(".", ",");

  const discountMultiplier = 1 - discount / 100;

  const rows = tableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    const parseCell = (index) => {
      const cell = cells[index];
      if (!cell) return 0;
      const val = parseFloat(cell.textContent.trim().replace(",", "."));
      return isNaN(val) ? 0 : val;
    };

    sumLeft += parseCell(3); // ціна послуги
    sumRight += parseCell(4); // ціна товару
    sumCost += parseCell(7); // собівартість
    sumSalaryNorm += parseCell(10); // норма з/п
  });

  const sumLeftDiscounted = sumLeft * discountMultiplier;
  const sumRightDiscounted = sumRight * discountMultiplier;
  const sumTotal = sumLeftDiscounted + sumRightDiscounted;

  function formatNumber(num) {
    const fixed = Number(num).toFixed(2);
    if (fixed.endsWith(".00")) return parseInt(fixed).toString();
    if (fixed.endsWith("0")) return fixed.slice(0, -1).replace(".", ",");
    return fixed.replace(".", ",");
  }

  const sumCell = document.getElementById("sumCellDisplay");
  if (sumCell) sumCell.textContent = formatNumber(sumTotal);

  // Возвращаем все суммы
  return {
    sumLeft: formatNumber(sumLeftDiscounted),
    sumRight: formatNumber(sumRightDiscounted),
    sumTotal: formatNumber(sumTotal),
    sumCost: formatNumber(sumCost),
    sumSalaryNorm: formatNumber(sumSalaryNorm),
  };
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
  if (statusValue === "виконано") return; // Блокировка клика при виконано
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
  } else if (colIndex === 1) {
    input.setAttribute("list", "service-delta");
  } else if (colIndex === 2) {
    input.setAttribute("list", "service-price");
  } else if (colIndex === 3) {
    input.setAttribute("list", "item-price");
  }
  // Автозаполнение оставшихся полей при выборе "Регламент"
  if (colIndex === 0) {
    input.setAttribute("list", "service-regulation");

    input.addEventListener("input", () => {
      const selected = servicesData.find(
        (service) => service.serviceName === input.value.trim()
      );
      if (selected) {
        const tr = td.closest("tr");
        const cells = tr.querySelectorAll("td");
        // Заполняем Δ, Ціна послуга, Ціна товар
        cells[2].textContent = selected.quantity || "";
        cells[3].textContent = selected.servicePrice || "";
        cells[4].textContent = selected.itemPrice || "";
      }
    });
  }

  td.innerHTML = ""; // ← Очищаем только после чтения значения
  td.appendChild(input);
  input.focus();

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
function saveChanges() {
  const getText = (key) =>
    document.querySelector(`[data-key="${key}"]`)?.textContent.trim() || "";

  const editor = localStorage.getItem("user_email") || "";
  const { sumLeft, sumRight, sumTotal } = updateSumFromTable();

  const discount = getText("editdiscount");
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

    // Сбор всех ячеек, кроме первой (номер/кнопка)
    for (let i = 1; i < Math.min(cells.length, 11); i++) {
      rowData.push(cells[i]?.textContent?.trim() || "");
    }
    updatedData.push(rowData.join("|"));
  });

  const newDataString = updatedData
    .filter((row) => row.trim() !== "")
    .join("--");

  const action = "updateVisit";
  const rowNumber = Number(no) + 2;

  const body = `editor=${encodeURIComponent(
    editor
  )}&editComment=${encodeURIComponent(
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
  )}&sumTotal=${encodeURIComponent(sumTotal)}&discount=${encodeURIComponent(
    discount
  )}&status=${encodeURIComponent(status)}&form=${encodeURIComponent(
    form
  )}&currency=${encodeURIComponent(currency)}&tasks=${encodeURIComponent(
    tasks
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
    });
}

function printVisitFromModal() {
  const modal = document.querySelector("#commonModal .modal-body");
  if (!modal) {
    console.error("Модальное содержимое не найдено.");
    return;
  }

  const clone = modal.cloneNode(true);

  // Заменяем <select> на выбранный текст
  clone.querySelectorAll("select").forEach((selectEl) => {
    const text = selectEl.options[selectEl.selectedIndex]?.text || "";
    const span = document.createElement("span");
    span.textContent = text;
    selectEl.replaceWith(span);
  });

  // Заменяем input[type=text] на текст
  clone.querySelectorAll("input[type='text']").forEach((inputEl) => {
    const span = document.createElement("span");
    span.textContent = inputEl.value;
    inputEl.replaceWith(span);
  });

  // Удаляем кнопки
  clone.querySelectorAll("button").forEach((btn) => btn.remove());

  // Определяем активную вкладку
  const activeTabBtn = document.querySelector(".tab-btn.active");
  const activeTab = activeTabBtn?.dataset.tab || "order";

  // Настройки колонок по вкладкам
  const columnIndicesByTab = {
    order: [0, 1, 2, 3, 4], // "№", "Послуга / Товар", "Δ", "ціна послуги", "ціна товару"
    goods: [0, 1, 5, 6, 7], // + "Кіл-ть", "Артикул", "Собівартість"
    work: [0, 1, 8, 9, 10], // + "t", "Виконавець", "Норма з/п"
  };
  const allowedIndices =
    columnIndicesByTab[activeTab] || columnIndicesByTab.order;

  // Очищаем неактивные колонки
  clone.querySelectorAll("table tbody tr").forEach((tr) => {
    const cells = Array.from(tr.children);
    cells.forEach((cell, i) => {
      if (!allowedIndices.includes(i)) cell.remove();
    });
  });

  // Также скрываем ненужные заголовки
  clone.querySelectorAll("table thead tr").forEach((tr) => {
    const headers = Array.from(tr.children);
    headers.forEach((th, i) => {
      if (!allowedIndices.includes(i)) th.remove();
    });
  });

  // Удаляем контролы вкладок
  clone.querySelectorAll(".tab-controls").forEach((el) => el.remove());

  // Шапка
  const headerHTML = `
    <table style="width: 100%; margin-bottom: 20px; border: none;">
      <tr style="border: none;">
        <td style="width: 120px; vertical-align: top; border: none;">
          ${
            logo
              ? `<img src="${logo}" alt="Logo" style="max-width: 100px;">`
              : ""
          }
        </td>
        <td style="text-align: left; padding-left: 20px; border: none;">
          <div style="font-weight: bold; font-size: 1.2em;">${sName}</div>
          <div>${address}</div>
          <div>${sContact}</div>
        </td>
        <td style="text-align: right; vertical-align: top; border: none;">
          <div><strong>№ ${data.Tf[no].c[3].v}</strong></div>
          <div>${data.Tf[no].c[0].f} – ${data.Tf[no].c[1].f}</div>
        </td>
      </tr>
    </table>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = headerHTML + clone.innerHTML;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Не удалось открыть новое окно.");
    return;
  }

  const styles = `
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        color: #000;
        width: fit-content;
      }
      table {
        border-collapse: collapse;
        margin-bottom: 20px;
        width: auto;
      }
      td, th {
        border: 1px solid #ccc;
        padding: 6px;
        vertical-align: top;
      }
      select, button, input {
        display: none !important;
      }
    </style>`;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Документ візиту</title>
        ${styles}
      </head>
      <body>
        ${wrapper.innerHTML}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
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
  $("#commonReport").modal("show");
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
      // Если сервер успешно аутентифицировал пользователя и создал сессию,
      // вы можете перенаправить пользователя или обновить страницу.
      // Сохраняем в localStorage
      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_email", userEmail);
      localStorage.setItem("user_picture", userPicture);
      localStorage.setItem("user_data", JSON.stringify(serverResponse));

      $("#offcanvasNavbarLabel").html("");
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
  )}&userPicture=${encodeURIComponent(userPicture)}&action=${encodeURIComponent(
    action
  )}`;

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
    // Обрабатываем ответ
    var usersDiv = document.getElementById("users-email");
    usersDiv.innerHTML = "Ваші користувачі:<br>"; // вставляем заголовок
    renderEmailGroup(usersDiv, "manager", serverResponse.managerUsers);
    renderEmailGroup(usersDiv, "master", serverResponse.masterUsers);
    renderEmailGroup(usersDiv, "owner", serverResponse.ownerUsers);
    renderEmailGroup(usersDiv, "admin", serverResponse.adminUsers);
    role = serverResponse.role;
    sName = serverResponse.sName;
    tasks = serverResponse.tasks;
    var price = serverResponse.price;
    var defaultlang = serverResponse.defaultlang;
    //var toDate = response.toDate;
    address = serverResponse.address;
    sContact = serverResponse.sContact;
    logo = serverResponse.logo;
    currency = serverResponse.currency;
    vfolder = serverResponse.vfolder;
    rfolder = serverResponse.rfolder;

    // Проверяем наличие hash в массиве и его корректность
    if (!allLang.includes(hash)) {
      // Если hash некорректный, устанавливаем язык по умолчанию
      hash = defaultlang;
      let newURL = `${window.location.pathname}#${hash}`;
      location.href = newURL;
    }
    // Устанавливаем значение select в соответствии с текущим языком
    select.value = hash;
    // Обновляем содержимое страницы на выбранном языке
    document.querySelector("title").innerHTML = langArr["unit"][hash];
    for (let key in langArr) {
      let elem = document.querySelector(".lng-" + key);
      if (elem) {
        elem.innerHTML = langArr[key][hash];
      }
    } /////////////////////////////////////////////////////////////////////////////////////////////////
    $("#offcanvasNavbarLabel").html(sName); // Отображаем sName
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
  } else {
    document.getElementById("authButtons").classList.add("d-none"); // скрыть кнопки действия
    // Обрабатываем ошибочный ответ
    // Проверяем наличие языка в hash и его корректность
    if (!allLang.includes(hash)) {
      // Если hash некорректный, устанавливаем язык по умолчанию
      hash = "en";
      let newURL = `${window.location.pathname}#${hash}`;
      location.href = newURL;
    }
    // Устанавливаем значение select в соответствии с текущим языком
    select.value = hash;
    // Обновляем содержимое страницы на выбранном языке
    document.querySelector("title").innerHTML = langArr["unit"][hash];
    for (let key in langArr) {
      let elem = document.querySelector(".lng-" + key);
      if (elem) {
        elem.innerHTML = langArr[key][hash];
      }
    }

    $("#dateend").html(
      `<div class="alert alert-danger" role="alert">${serverResponse.message}</div>`
    );
    $("#offcanvasNavbar").offcanvas("show");
  }
  if (serverResponse.success) {
    //$("#offcanvasNavbar").offcanvas("hide");
    // window.location.href = '/dashboard'; // Пример перенаправления
  }
}
