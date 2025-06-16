select.addEventListener("change", changeURLLanguage);
function changeURLLanguage() {
  // Получаем выбранный язык
  let lang = select.value;
  // Проверяем, есть ли параметр wlink из main и формируем новый URL
  let newURL = wlink
    ? `${window.location.pathname}?${wlink}#${lang}`
    : `${window.location.pathname}#${lang}`;
  // Меняем URL и перезагружаем страницу
  location.href = newURL;
  document.querySelector("title").innerHTML = langArr["unit"][lang];
}
