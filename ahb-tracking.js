(function () {
  "use strict";

  var STORAGE_KEY = "aff_click_id";

  function getClickId() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && d.value && Date.now() < d.expiry) return d.value;
    } catch (e) {}

    var m = document.cookie.match(/aff_click_id=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function ensureInput(form, name, value) {
    if (!form || !value) return;
    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  function attach() {
    var clickId = getClickId();
    if (!clickId) return;

    var form =
      document.querySelector('form[action*="/checkout"]') ||
      document.querySelector("#checkout_form");

    if (!form) return;

    ensureInput(form, "note", "Click ID: " + clickId); 
    ensureInput(form, "attributes[aff_click_id]", clickId);
  }

  var t = setInterval(attach, 1000); 
  setTimeout(() => clearInterval(t), 15000);
})();