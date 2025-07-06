var wlink = window.location.search.replace("?", "");
var hash = window.location.hash.substr(1);
var select = document.querySelector(".change-lang");
var allLang = ["ua", "ru", "en", "de", "es"];
var myApp =
  "https://script.google.com/macros/s/AKfycbzAJtG0CPNm2CKbjwMkYzTKnO7DeI7quq-gbKpIUtsk3FfUEBZT8tT5jZNHW58CxFmf/exec";
var sName = "";
var tasks = "";
var logo = "";
var sContact = "";
var address = "";
var currency = "";
var vfolder = "";
var rfolder = "";

$(document).ready(function () {
  $("#offcanvasNavbar").offcanvas("show");
});
function getUser() {
  var action = "getUser";
  var body = `wlink=${encodeURIComponent(wlink)}&action=${encodeURIComponent(
    action
  )}`;

  $("#offcanvasNavbarLabel").html(
    `<span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>`
  );
  var xhr = new XMLHttpRequest();
  xhr.open("POST", myApp, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);

      if (response.status === "success") {
        // Обрабатываем ответ
        var users = response.users.split(",");
        sName = response.sName;
        tasks = response.tasks;
        var price = response.price;
        var defaultlang = response.defaultlang;
        //var toDate = response.toDate;
        address = response.address;
        sContact = response.sContact;
        logo = response.logo;
        currency = response.currency;
        vfolder = response.vfolder;
        rfolder = response.rfolder;

        // Проверяем наличие языка в hash и его корректность/////////////////////////////////////////////////
        if (!allLang.includes(hash)) {
          // Если hash некорректный, устанавливаем язык по умолчанию
          hash = defaultlang;
          let newURL = `${window.location.pathname}?${wlink}#${hash}`;
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
        let usersDiv = document.getElementById("users-email");
        users.forEach((email) => {
          let link = document.createElement("a");
          link.href = `mailto:${email}`;
          link.textContent = email;
          link.style.display = "block";
          usersDiv.appendChild(link);
        });
        document.getElementById("price-link").href = price;
        loadTasks();
      } else {
        // Обрабатываем ошибочный ответ
        // Проверяем наличие языка в hash и его корректность/////////////////////////////////////////////////
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
          `<div class="alert alert-danger" role="alert">${response.message}</div>`
        );
        $("#offcanvasNavbarLabel").html("");
      }
    }
  };

  try {
    xhr.send(body);
  } catch (err) {
    console.error("Ошибка отправки запроса:", err);
  }
}

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
    th = `<tr class="border-bottom border-info"><th class="text-secondary lng-unit"></th><th class="text-secondary">${
      data.Sf[0].label + " " + data.Sf[1].label
    }</th>
    <th class="text-secondary text-truncate" style="max-width: 70px;">${
      data.Sf[13].label
    }</th>
    <th class="text-secondary text-truncate" style="max-width: 170px;">${
      data.Sf[20].label
    }</th><th class="text-secondary text-truncate" style="min-width: 120px; max-width: 180px;">${
      data.Sf[25].label
    }</th>
    <th class="text-secondary text-truncate" style="max-width: 80px;">${
      data.Sf[26].label
    }</th>
    <th style="max-width: 40px;"></th>
    <th class="text-secondary">${data.Sf[29].label}</th></tr>`;
    var tr = ``;
    var trr = ``;
    for (i = data.Tf.length - 1; i >= 0; i--) {
      var colorw =
        data.Tf[i].c[4].v == "в роботі"
          ? `class="table-success" title="в роботі"`
          : ``;

      if (data.Tf[i].c[4].v == "закупівля") {
        var colorp = `class="table-secondary" title="закупівля"`;
      }
      if (data.Tf[i].c[4].v == "весь документ") {
        var colorp = `class="table-light" title="весь документ"`;
      }
      if (data.Tf[i].c[4].v == "пропозиція") {
        var colorp = `title="пропозиція"`;
      }

      var textColor = uStatus == "в архів" ? `text-secondary` : ``;
      var linkColor =
        uStatus == "в архів" ? `class="link-secondary"` : `class="link-dark"`;

      if (data.Tf[i].c[4].v == uStatus && data.Tf[i].c[24].v == sName) {
        tr += `<tr ${colorw} name="${i}">
        <td><a target="_blank" href="${data.Tf[i].c[2].v}" ${linkColor}>${
          data.Tf[i].c[3].v
        }</a></td>
            <td class="${textColor}">${
          data.Tf[i].c[0].f + " - " + data.Tf[i].c[1].f
        }</td>
            <td class="${textColor} text-truncate" style="max-width: 70px;">${
          data.Tf[i].c[13].v
        }</td>
            <td class="${textColor} text-start text-truncate" style="max-width: 170px;">${
          data.Tf[i].c[20].v
        }</td>
            <td class="${textColor} text-start text-truncate" style="min-width: 120px; max-width: 180px;">${
          data.Tf[i].c[25].v
        }</td>
            <td class="${textColor} text-truncate" style="max-width: 100px;"><a href="tel:+${
          data.Tf[i].c[26].v
        }" ${linkColor}>${data.Tf[i].c[26].v}</a></td>
<td style="max-width: 40px;"<div class="button-wrapper"><button class="send-button" name="${i}" id="sendButton"></button></div></td>
          <td class="${textColor} text-end">${
          data.Tf[i].c[29].v + " " + data.Tf[i].c[30].v
        }</td></tr>`;
      }
      if (
        (data.Tf[i].c[4].v == "пропозиція" ||
          data.Tf[i].c[4].v == "закупівля" ||
          data.Tf[i].c[4].v == "весь документ") &&
        uStatus == "в роботі" &&
        data.Tf[i].c[24].v == sName
      ) {
        trr += `<tr ${colorp} name="${i}">
						<td><a target="_blank" href="${data.Tf[i].c[2].v}" class="link-secondary">${
          data.Tf[i].c[3].v
        }</a></td>
          <td class="text-secondary">${
            data.Tf[i].c[0].f + " - " + data.Tf[i].c[1].f
          }</td>
            <td class="text-secondary text-truncate" style="max-width: 70px;">${
              data.Tf[i].c[13].v
            }</td>
            <td class="text-secondary text-start text-truncate" style="max-width: 170px;">${
              data.Tf[i].c[20].v
            }</td>
            <td class="text-start text-secondary text-truncate" style="min-width: 120px; max-width: 180px;">${
              data.Tf[i].c[25].v
            }</td>
            <td class="text-secondary text-truncate" style="max-width: 100px;"><a href="tel:+${
              data.Tf[i].c[26].v
            }" class="link-secondary">${data.Tf[i].c[26].v}</a></td>
<td style="max-width: 40px;"<div class="button-wrapper"><button class="send-button" name="${i}" id="sendButton"></button></div></td>
            <td class="text-end text-secondary">${
              data.Tf[i].c[29].v + " " + data.Tf[i].c[30].v
            }</td></tr>`;
      }
    }
    return `<table id="myTable" class="table text-center table-hover table-sm table-responsive text-truncate"><thead>${th}</thead><tbody>${tr}${trr}</tbody></table>`;
  });
  $("#offcanvasNavbar").offcanvas("hide");
}
function myFunction() {
  var input, filter, table, tr, td, td1, td2, td3, td4, td5, td6, td7, i;
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
    td7 = tr[i].getElementsByTagName("td")[7];
    if (td) {
      if (
        td.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td1.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td2.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td3.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td4.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td5.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td6.innerHTML.toUpperCase().indexOf(filter) > -1 ||
        td7.innerHTML.toUpperCase().indexOf(filter) > -1
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
//var numCheck = ``;
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

  // Отправка данных на сервер
  /*fetch(myApp, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body, // Отправляем данные в URL-encoded формате
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при обновлении данных на сервере");
      }
      return response.json();
    })
    .then((result) => {
      console.log("Данные успешно обновлены:", result);
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });*/

  var xhr = new XMLHttpRequest();
  xhr.open("POST", myApp, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      loadTasks();
      // Закрываем сообщение и модальное окно
      $("#commonModal").modal("hide");
      $(".alert").alert("close");
      no = Number(xhr.response) - 2;
      // Изменяем цвет строки
      setTimeout(() => {
        const newString = document.querySelector(`tr[name="${no}"]`);
        if (newString) {
          newString.classList.add("table-primary");
        }
        // Открываем новый визит в модальном окне
        setTimeout(() => {
          editOrder();
        }, 1000);
        // Убираем цвет строки после открытия нового модального окна
        setTimeout(() => {
          newString.classList.remove("table-primary");
        }, 2000);
      }, 1000); // Даем время для обновления DOM после обновления ЛоадТаск
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
  // Заголовок модального окна
  const title = `
    <div class="row fs-6 fst-italic text-nowrap">
      <div class="col-2">${data.Tf[no].c[3].v}</div>
      <div class="col-6 text-end">${sName}</div>
      <div class="col-4">${data.Tf[no].c[0].f} - ${data.Tf[no].c[1].f}</div>
    </div>`;

  // Кнопки модального окна
  const buttons = `<button type="button" class="btn btn-success" id="btn-save" onclick="$('#commonModal').modal('hide');">Закрити</button>`;

  // Основная часть модального окна
  $("#commonModal .modal-header .modal-title").html(title);
  $("#commonModal .modal-body").html(function () {
    return `
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <div><strong>${data.Tf[no].c[14].v} ${data.Tf[no].c[15].v} ${data.Tf[no].c[16].v} ${data.Tf[no].c[17].v}</strong></div>
          <div>${data.Tf[no].c[13].v}</div>
          <div>${data.Tf[no].c[18].v}</div>
          <div>${data.Tf[no].c[12].v}</div>
        </div>
        <div>
          <div><strong>${data.Tf[no].c[25].v}</strong></div>
          <div>${data.Tf[no].c[26].v}</div>
        </div>
      </div>
      <table class="table table-bordered">
  <thead>
    <tr>
      <th style="width: 5%;">№</th>
      <th style="width: 60%;" class="col-5">Регламент</th>
      <th style="width: 5%;">Δ</th>
      <th style="width: 15%;">Послуга</th>
      <th style="width: 15%;">Товар</th>
    </tr>
  </thead>
  <tbody id="table-body"></tbody>
</table>

      <div>
        <p style="text-align: right;">
          %<strong> &nbsp; &nbsp; &nbsp; ${data.Tf[no].c[30].v}: &nbsp; &nbsp; &nbsp; ${data.Tf[no].c[29].v} грн.&nbsp; &nbsp;</strong>
        </p>
      </div>`;
  });

  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = ""; // Очищаем тело таблицы
  //---------------------------------------------------------------------------------------------------
  // Если данных нет, создаем одну пустую строку
  const dataReg = data.Tf[no].c[36].v || "";
  const rows = dataReg ? dataReg.split("--") : ["| | |"];

  rows.forEach((row, index) => {
    const columns = row.split("|").slice(0, 4);
    const tr = createRow(index + 1, columns);
    tableBody.appendChild(tr);
  });

  updateRowNumbers(tableBody);
  updateAddRowButton(tableBody);

  $("#commonModal .modal-footer").html(buttons);
  $("#commonModal").modal("show");
}
//---------------------------------------------------------------------------------------------------
function createRow(rowNumber, columns) {
  const tr = document.createElement("tr");

  // Первая колонка (номер строки или кнопка +)
  const numberCell = document.createElement("td");
  numberCell.style.display = "flex";
  numberCell.style.alignItems = "center";
  const regulationValue = columns[0]?.trim();

  if (regulationValue) {
    const spanNumber = document.createElement("span");
    spanNumber.textContent = rowNumber;
    numberCell.appendChild(spanNumber);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "p-0", "text-danger");
    deleteButton.textContent = "×";
    deleteButton.onclick = () => {
      tr.remove();
      updateRowNumbers(document.getElementById("table-body"));
      updateAddRowButton(document.getElementById("table-body"));
      //saveChanges();
      const saveButton = document.getElementById("btn-save");
      saveButton.textContent = "Зберегти";
      saveButton.classList.remove("btn-success");
      saveButton.classList.add("btn-danger");
      // Изменяем функциональность кнопки на Зберегти
      saveButton.onclick = () => {
        saveChanges();
      };
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

  // Добавляем остальные колонки
  columns.forEach((column, colIndex) => {
    const td = document.createElement("td");
    td.textContent = column.trim(); // Изначально только текст
    td.dataset.value = column.trim(); // сохраняем
    td.addEventListener("click", () => switchToInput(td, colIndex)); // Переключение на редактирование
    tr.appendChild(td);
  });
  return tr;
}

// Функция для переключения на поле ввода
function switchToInput(td, colIndex) {
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
      //const addButton = document.querySelector(".add-row-btn");
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
  const tableBody = document.getElementById("table-body");
  const rows = tableBody.querySelectorAll("tr");
  const updatedData = [];

  rows.forEach((row) => {
    const firstCell = row.querySelector("td:first-child");
    const isAddRow = firstCell?.querySelector("button")?.textContent === "+";
    if (isAddRow) return; // пропустить пустую строку с кнопкой "+"

    const cells = row.querySelectorAll("td");
    const rowData = [];

    // пропускаем первую ячейку (номер или кнопка)
    for (let i = 1; i < Math.min(cells.length, 5); i++) {
      rowData.push(cells[i].textContent.trim());
    }

    updatedData.push(rowData.join("|"));
  });

  const newDataString = updatedData
    .filter((row) => row.trim() !== "")
    .join("--");

  const action = "updateVisit";
  const rowNumber = Number(no) + 2; // Укажите нужный номер строки
  const columnNumber = 40; // Укажите нужный номер столбца

  const body = `tasks=${encodeURIComponent(
    tasks
  )}&rowNumber=${encodeURIComponent(
    rowNumber
  )}&columnNumber=${encodeURIComponent(
    columnNumber
  )}&value=${encodeURIComponent(newDataString)}&action=${encodeURIComponent(
    action
  )}`;

  // Обновляем кнопку состояния
  const saveButton = document.getElementById("btn-save");
  saveButton.textContent = "Збереження...";
  saveButton.classList.remove("btn-danger");
  saveButton.classList.add("btn-warning");
  saveButton.onclick = () => {};

  // Отправка данных на сервер
  fetch(myApp, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при обновлении данных на сервере");
      }
      return response.json();
    })
    .then((result) => {
      console.log("Данные успешно обновлены:", result);
      saveButton.textContent = "Закрити";
      saveButton.classList.remove("btn-warning");
      saveButton.classList.add("btn-success");
      saveButton.onclick = () => {
        $("#commonModal").modal("hide");
      };
      loadTasks();
    })
    .catch((error) => {
      console.error("Ошибка:", error);
      saveButton.textContent = "Помилка";
      saveButton.classList.remove("btn-warning");
      saveButton.classList.add("btn-info");
      saveButton.onclick = () => {
        saveChanges();
      };
    });
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

  var body = `sName=${encodeURIComponent(sName)}&rfolder=${encodeURIComponent(
    rfolder
  )}&tasks=${encodeURIComponent(tasks)}&sdate=${encodeURIComponent(
    sdate
  )}&pdate=${encodeURIComponent(pdate)}&client=${encodeURIComponent(
    client
  )}&action=${encodeURIComponent(action)}`;
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

  try {
    // пользователь авторизован в Google но пока не в Service Control
    const decodedToken = parseJwt(idToken);
    console.log("Декодированный токен (сторона клиента):", decodedToken);

    // Пример извлечения данных пользователя:
    const userName = decodedToken.name;
    const userEmail = decodedToken.email;
    const userPicture = decodedToken.picture;

    console.log(`Имя пользователя: ${userName}`);
    console.log(`Email пользователя: ${userEmail}`);
    console.log(`Фото пользователя: ${userPicture}`);

    // Здесь вы можете обновить UI, чтобы показать, что пользователь вошел в систему
    document.getElementById("welcomeMessage").innerText = `${userName}`;
    document.getElementById("signInButton").style.display = "none"; // Скрыть кнопку входа
    document.getElementById("logoutButton").style.display = "flex"; // Показать кнопку выхода
  } catch (error) {
    // ответ от Google есть но нет обработки
    console.error("Ошибка при декодировании токена на клиенте:", error);
  }

  // 2. ОТПРАВКА JWT-токена на ваш сервер для верификации и создания сессии
  sendTokenToServer(userEmail)
    .then((serverResponse) => {
      console.log("Ответ от сервера после отправки токена:", serverResponse);
      // Если сервер успешно аутентифицировал пользователя и создал сессию,
      // вы можете перенаправить пользователя или обновить страницу.

      if (serverResponse.success) {
        //$("#offcanvasNavbar").offcanvas("hide");
        // window.location.href = '/dashboard'; // Пример перенаправления
        // Обрабатываем ответ
        var users = response.users.split(",");
        sName = response.sName;
        tasks = response.tasks;
        var price = response.price;
        var defaultlang = response.defaultlang;
        //var toDate = response.toDate;
        address = response.address;
        sContact = response.sContact;
        logo = response.logo;
        currency = response.currency;
        vfolder = response.vfolder;
        rfolder = response.rfolder;

        // Проверяем наличие языка в hash и его корректность/////////////////////////////////////////////////
        if (!allLang.includes(hash)) {
          // Если hash некорректный, устанавливаем язык по умолчанию
          hash = defaultlang;
          let newURL = `${window.location.pathname}?${wlink}#${hash}`;
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
        let usersDiv = document.getElementById("users-email");
        users.forEach((email) => {
          let link = document.createElement("a");
          link.href = `mailto:${email}`;
          link.textContent = email;
          link.style.display = "block";
          usersDiv.appendChild(link);
        });
        document.getElementById("price-link").href = price;
        loadTasks();
      }
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
 * @param {string} userEmail JWT-токен, полученный от Google.
 * @returns {Promise<Object>} Promise, который разрешается с ответом от сервера.
 */
//
async function sendTokenToServer(userEmail) {
  var action = "getUser";
  const body = `userEmail=${encodeURIComponent(
    userEmail
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
