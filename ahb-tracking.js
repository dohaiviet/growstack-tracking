(function () {
  "use strict";

  var STORAGE_KEY = "aff_click_id";

  function getClickId() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      // Return value if exists, otherwise null
      if (d && d.value && Date.now() < d.expiry) return d.value;
    } catch (e) {}

    var m = document.cookie.match(/aff_click_id=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function ensureInput(form, name, value) {
    if (!form) return;
    
    // Inject input even if value is empty
    var finalValue = value || ""; 

    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = finalValue;
  }

  function sendTrackingData(data) {
    console.log("Tracking Data:", data);
  }

  function checkSuccessPage(clickId) {
    if (window.location.pathname.indexOf("/thank_you") === -1 && window.location.pathname.indexOf("test_success") === -1) return;

    var checkout = (window.Sapo && window.Sapo.checkout) || (window.Bizweb && window.Bizweb.checkout);

    console.log("Checkout:", checkout);
    
    if (checkout) {
      var data = {
        clickId: clickId || "", // Send empty string if null
        orderId: checkout.order_id,
        orderToken: checkout.token,
        totalPrice: checkout.total_price,
        currency: checkout.currency,
        email: checkout.email,
        products: checkout.line_items ? checkout.line_items.map(function(item) {
          return {
            id: item.variant_id,
            sku: item.sku,
            name: item.title,
            price: item.price,
            quantity: item.quantity
          };
        }) : []
      };

      console.log("Data:", data);

      sendTrackingData(data);
    }
  }

  function attach() {
    var clickId = getClickId();
    
    // REMOVED early return check: if (!clickId) return;

    // 1. Inject into Checkout Forms
    var form =
      document.querySelector('form[action*="/checkout"]') ||
      document.querySelector("#checkout_form");

    if (form) {
      ensureInput(form, "note", clickId);
      ensureInput(form, "link", clickId); 
    }

    // 2. Check for Order Success
    checkSuccessPage(clickId);
  }

  var t = setInterval(attach, 500);
  setTimeout(() => clearInterval(t), 10000);
})();
