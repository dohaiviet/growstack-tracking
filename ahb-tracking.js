(function () {
  "use strict";

  var STORAGE_KEY = "aff_click_id"; // key đã lưu click_id
  var ATTR_KEY = "aff_click_id"; // tên attribute hiển thị trong đơn

  function injectClickId(form) {
    try {
      var clickId = localStorage.getItem(STORAGE_KEY);
      if (!clickId) return;

      // Nếu input đã tồn tại thì chỉ set value
      var input = form.querySelector(
        'input[name="attributes[' + ATTR_KEY + ']"]',
      );

      if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = "attributes[" + ATTR_KEY + "]";
        form.appendChild(input);
      }

      input.value = clickId;
    } catch (e) {
      console.warn("Inject click_id failed", e);
    }
  }

  // Bắt submit checkout
  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;

      // Chỉ áp dụng cho checkout
      if (
        form.action &&
        (form.action.indexOf("/checkout") !== -1 ||
          form.action.indexOf("/cart") !== -1)
      ) {
        injectClickId(form);
      }
    },
    true,
  );
})();
