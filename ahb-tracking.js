(function () {
  "use strict";

  var STORAGE_KEY = "aff_params";
  var WEBHOOK_URL = "https://auto.admod.vn/webhook-test/101a4326-e25d-403d-9bed-d8b067a39967";

  function getTrackingParams() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      // Check structure: { value: {}, expiry: timestamp }
      if (d && d.value && Date.now() < d.expiry) {
        return d.value;
      }
    } catch (e) {
      console.warn("Tracking: Invalid storage data", e);
    }
    return null;
  }

  function sendWebhook(params, checkoutData) {
    // Combine params from storage with order data
    var payload = {};
    
    // Copy all params from storage
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          payload[key] = params[key];
        }
      }
    }

    // Add order info
    if (checkoutData) {
        payload.order_id = checkoutData.order_id;
        payload.email = checkoutData.email;
        payload.total_price = checkoutData.total_price;
        payload.currency = checkoutData.currency;
        // Add items if needed, or keep it simple base on "body is params"
        // payload.items = checkoutData.line_items; 
    }

    console.log("=== SENDING WEBHOOK ===");
    console.log("URL:", WEBHOOK_URL);
    console.log("Payload:", payload);

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(function(res) {
        console.log("Webhook success:", res.status);
    })
    .catch(function(err) {
        console.error("Webhook failed:", err);
    });
  }

  function checkSuccessPage() {
    // Check path for /checkout/thankyou
    var isThankYouPage = 
        window.location.pathname.indexOf("/checkout/thankyou") !== -1 || 
        window.location.pathname.indexOf("test_thankyou") !== -1;

    if (!isThankYouPage) return;

    var params = getTrackingParams();
    if (!params) {
        console.log("Tracking: Success page reached, but no parameters in storage.");
        // Proceeding might be skipped if strictly tracking attribution
        // return; 
    }

    // Sapo/Bizweb object
    var checkout = (window.Sapo && window.Sapo.checkout) || (window.Bizweb && window.Bizweb.checkout);

    if (checkout) {
      sendWebhook(params, checkout);
    } else {
      console.warn("Tracking: Checkout object not found.");
      // If we still want to send what we have:
      // sendWebhook(params, null); 
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkSuccessPage);
  } else {
    checkSuccessPage();
  }

})();
