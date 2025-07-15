var wlink = window.location.search.replace("?", "");
var hash = window.location.hash.substr(1);
var select = document.querySelector(".change-lang");
var allLang = ["ua", "ru", "en", "de", "es"];
var myApp =
  "https://script.google.com/macros/s/AKfycbwwfypQ5KLkPJdSsgQPDQhUwqRXm44tPLVOQFa7zVSndfGgdOkmsD8PaZkxpNc2krCy/exec";
var sName = "";
var tasks = "";
var logo = "";
var sContact = "";
var address = "";
var currency = "";
var vfolder = "";
var rfolder = "";
var role = "";

$(document).ready(function () {
  $("#offcanvasNavbar").offcanvas("show");
});

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
        tr += `<tr ${colorw} name="${i}"><td><button class="send-button link-badge" name="${i}">${
          data.Tf[i].c[3].v
        }</button></td>
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
        trr += `<tr ${colorp} name="${i}"><td><button class="send-button link-badge" name="${i}">${
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
            <td class="text-end text-secondary">${
              data.Tf[i].c[29].v + " " + data.Tf[i].c[30].v
            }</td></tr>`;
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
      // Закрываем сообщение и модальное окно
      no = Number(xhr.response) - 2;
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
        }, 1000);
        // Убираем цвет строки после открытия нового модального окна
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
  const buttons = `<button class="btn btn-outline-secondary" onclick="printVisitFromModal()">Друк PDF</button>
  <button type="button" class="btn btn-success" id="btn-save" onclick="$('#commonModal').modal('hide');">Закрити</button>`;

  // Основная часть модального окна
  $("#commonModal .modal-header .modal-title").html(title);
  $("#commonModal .modal-body").html(function () {
    return `
    <table style="width: 100%; margin-bottom: 20px;">
    <tr>
    <td class="editable" data-key="editCarInfo">${data.Tf[no].c[14].v} ${data.Tf[no].c[15].v} ${data.Tf[no].c[16].v} ${data.Tf[no].c[17].v}</td><td>
        <select id="typeStatus" class="form-select form-select-sm" onchange="saveChanges()">
          <option value="пропозиція">пропозиція</option>
          <option value="закупівля" disabled>закупівля</option>
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
    <td class="editable" data-key="editVin">${data.Tf[no].c[18].v}</td>
      <td class="editable" data-key="editContact">${data.Tf[no].c[26].v}</td>
    </tr>
    <tr>
    <td class="editable" data-key="editMileage">${data.Tf[no].c[12].v}</td>
    <td class="editable" data-key="editClient">${data.Tf[no].c[25].v}</td>
    </tr>
  </table>
      <table class="table table-bordered"><thead>
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
<div><p style="text-align: right;">%<strong> &nbsp;&nbsp;<input id="discountInput" type="text" class="form-control form-control-sm d-inline"
    style="width: 30px; padding: 2px; font-size: 0.8rem; text-align: center;" onchange="saveChanges()" />&nbsp;&nbsp;&nbsp;&nbsp;
  <span id="sumCellDisplay">${data.Tf[no].c[29].v}</span> <span id="selectedCurrencyText">${data.Tf[no].c[34].v}</span>&nbsp;&nbsp;</strong></p></div>`;
  });
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
        saveChanges(); // запускаем отправку
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
  const discountValue = data.Tf[no].c[27]?.v || "";
  document.getElementById("discountInput").value = discountValue;
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

function updateSumFromTable() {
  const tableBody = document.getElementById("table-body");
  const discountInput = document.getElementById("discountInput");
  if (!tableBody) return { sumLeft: 0, sumRight: 0, sumTotal: 0 };

  let sumLeft = 0;
  let sumRight = 0;

  // Обработка скидки
  let discount =
    parseFloat(discountInput?.value?.trim()?.replace(",", ".")) || 0;
  if (discount > 100) discount = 100;
  if (discount < 0) discount = 0;
  discountInput.value = discount.toString().replace(".", ",");

  const discountMultiplier = 1 - discount / 100;
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 2) return;

    const valLeft = parseFloat(
      cells[cells.length - 2].textContent.trim().replace(",", ".")
    );
    const valRight = parseFloat(
      cells[cells.length - 1].textContent.trim().replace(",", ".")
    );

    if (!isNaN(valLeft)) sumLeft += valLeft;
    if (!isNaN(valRight)) sumRight += valRight;
  });

  const sumLeftDiscounted = sumLeft * discountMultiplier;
  const sumRightDiscounted = sumRight * discountMultiplier;
  const sumTotal = sumLeftDiscounted + sumRightDiscounted;

  // Форматирование: если есть дробная часть — отображаем с , или без неё
  function formatNumber(num) {
    const fixed = Number(num).toFixed(2);
    if (fixed.endsWith(".00")) return parseInt(fixed).toString();
    if (fixed.endsWith("0")) return fixed.slice(0, -1).replace(".", ",");
    return fixed.replace(".", ",");
  }

  // Обновить отображение
  const sumCell = document.getElementById("sumCellDisplay");
  if (sumCell) sumCell.textContent = formatNumber(sumTotal);

  return {
    sumLeft: formatNumber(sumLeftDiscounted),
    sumRight: formatNumber(sumRightDiscounted),
    sumTotal: formatNumber(sumTotal),
  };
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
      updateSumFromTable();
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
      //const addButton = document.querySelector(".add-row-btn");
      input.blur();
      updateSumFromTable();
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
        updateRowNumbers(tableBody);
        updateAddRowButton(tableBody);
        updateSumFromTable();
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
  const editClient = document
    .querySelector('[data-key="editClient"]')
    ?.textContent.trim();
  const editContact = document
    .querySelector('[data-key="editContact"]')
    ?.textContent.trim();
  const editCarInfo = document
    .querySelector('[data-key="editCarInfo"]')
    ?.textContent.trim();
  const editNumplate = document
    .querySelector('[data-key="editNumplate"]')
    ?.textContent.trim();
  const editVin = document
    .querySelector('[data-key="editVin"]')
    ?.textContent.trim();
  const editMileage = document
    .querySelector('[data-key="editMileage"]')
    ?.textContent.trim();
  const { sumLeft, sumRight, sumTotal } = updateSumFromTable();
  const discount = document.getElementById("discountInput").value.trim();
  const status = document.getElementById("typeStatus").value;
  const form = document.getElementById("typeForm").value;
  const currency = document.getElementById("typeCurrency").value;
  const tableBody = document.getElementById("table-body");
  const rows = tableBody.querySelectorAll("tr");
  const updatedData = [];

  rows.forEach((row) => {
    const firstCell = row.querySelector("td:first-child");
    const isAddRow = firstCell?.querySelector("button")?.textContent !== "×";
    if (isAddRow) return; // пропустить пустую строку в которой отсутствует "×"

    const cells = row.querySelectorAll("td");
    const rowData = [];

    // пропускаем первую ячейку (номер или кнопка)
    for (let i = 1; i < Math.min(cells.length, 5); i++) {
      rowData.push(cells[i].textContent.trim());
    }

    updatedData.push(rowData.join("|") + "||||||");
  });

  const newDataString = updatedData
    .filter((row) => row.trim() !== "")
    .join("--");

  const action = "updateVisit";
  const rowNumber = Number(no) + 2; // Укажите нужный номер строки

  const body = `editClient=${encodeURIComponent(
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

function printVisitFromModal() {
  const modal = document.querySelector("#commonModal .modal-body");
  if (!modal) {
    console.error("Модальное содержимое не найдено.");
    return;
  }

  const clone = modal.cloneNode(true);

  // Заменяем <select> на их выбранные значения
  clone.querySelectorAll("select").forEach((selectEl) => {
    const text = selectEl.options[selectEl.selectedIndex]?.text || "";
    const span = document.createElement("span");
    span.textContent = text;
    selectEl.replaceWith(span);
  });

  // Удаляем кнопки
  clone.querySelectorAll("button").forEach((btn) => btn.remove());

  // Заменяем input[type=text] (например, скидка) на текст
  clone.querySelectorAll("input[type='text']").forEach((inputEl) => {
    const span = document.createElement("span");
    span.textContent = inputEl.value;
    inputEl.replaceWith(span);
  });

  // Создаем шапку
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
          <div>${data.Tf[no].c[0].f} – ${data.Tf[no].c[1].f}</div></td>
      </tr>
    </table>
  `;

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
      }
      td, th {
        border: 1px solid #ccc;
        padding: 6px;
        vertical-align: top;
      }
      select, button, input {
        display: none !important;
      }
    </style>
  `;

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
    </html>
  `);
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
    document.getElementById("welcomeMessage").innerText = `${userName}`;
    document.getElementById("signInButton").style.display = "none"; // Скрыть кнопку входа
    document.getElementById("logoutButton").style.display = "block"; // Показать кнопку выхода
  } catch (error) {
    // ответ от Google есть но нет обработки
    console.error("Ошибка при декодировании токена на клиенте:", error);
  }
  $("#offcanvasNavbarLabel").html(
    `<span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>`
  );
  // 2. ОТПРАВКА JWT-токена на ваш сервер для верификации и создания сессии
  sendTokenToServer(userName, userEmail, userPicture)
    .then((serverResponse) => {
      console.log("Ответ от сервера после отправки токена:", serverResponse);
      // Если сервер успешно аутентифицировал пользователя и создал сессию,
      // вы можете перенаправить пользователя или обновить страницу.
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
    // Обрабатываем ответ
    var usersDiv = document.getElementById("users-email");
    usersDiv.innerHTML = "Користувачі додатку<br>"; // вставляем заголовок
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
  }
  if (serverResponse.success) {
    //$("#offcanvasNavbar").offcanvas("hide");
    // window.location.href = '/dashboard'; // Пример перенаправления
  }
}
