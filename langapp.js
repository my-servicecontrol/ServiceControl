// Функция обновления перевода
function changeLanguage(lang) {
  lang = allLang.includes(lang)
    ? lang
    : allLang.includes(localStorage.getItem("appLang"))
    ? localStorage.getItem("appLang")
    : allLang.includes(window.location.hash.substr(1))
    ? window.location.hash.substr(1)
    : document.querySelector(".change-lang")?.value || "en";

  history.replaceState(null, null, `${window.location.pathname}#${lang}`);
  localStorage.setItem("appLang", lang);

  const selected = document.querySelector(".change-lang");
  if (selected) selected.value = lang;

  for (let key in langArr) {
    let elem = document.querySelector(".lng-" + key);
    if (elem) elem.innerHTML = langArr[key][lang];
  }
}

var select = document.querySelector(".change-lang");
// Обработчик смены языка
select.addEventListener("change", function () {
  let newLang = select.value;
  // Обновляем перевод
  loadTasks();
  changeLanguage(newLang);
});
