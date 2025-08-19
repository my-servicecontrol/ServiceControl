// Функция обновления перевода
function changeLanguage(lang) {
  var selected = document.querySelector(".change-lang");
  //document.querySelector("title").innerHTML = langArr["unit"][lang];
  history.replaceState(null, null, `${window.location.pathname}#${lang}`);
  localStorage.setItem("appLang", lang);
  selected.value = lang;

  for (let key in langArr) {
    let elem = document.querySelector(".lng-" + key);
    if (elem) {
      elem.innerHTML = langArr[key][lang];
    }
  }
}
var select = document.querySelector(".change-lang");
// Обработчик смены языка
select.addEventListener("change", function () {
  let newLang = select.value;
  // Обновляем перевод
  changeLanguage(newLang);
});
