function inputTime() {
  tau.openPopup("#time-popup");
  if (localStorage.hasOwnProperty("wakeup")) {
    $("#input-wakeup").val(localStorage.getItem("wakeup"));
  }
  if (localStorage.hasOwnProperty("sleep")) {
    $("#input-sleep").val(localStorage.getItem("sleep"));
  }
}
function saveTime() {
  console.log("save time");
  localStorage.setItem("wakeup", $("#input-wakeup").val().trim());
  localStorage.setItem("sleep", $("#input-sleep").val().trim());
  tau.closePopup("#time-popup");
}
