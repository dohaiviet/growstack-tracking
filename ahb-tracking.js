(function () {
  "use strict";

  var STORAGE_KEY = "aff_params"; // key chứa params
  var TRACKED_ORDERS_KEY = "aff_tracked_orders"; // key chứa danh sách order đã track
  var WEBHOOK_URL = "https://auto.admod.vn/webhook/101a4326-e25d-403d-9bed-d8b067a39967";

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

  function isOrderTracked(orderId) {
    try {
      var tracked = JSON.parse(localStorage.getItem(TRACKED_ORDERS_KEY)) || [];
      return tracked.indexOf(orderId.toString()) !== -1;
    } catch (e) {
      return false;
    }
  }

  function markOrderAsTracked(orderId) {
    try {
      var tracked = JSON.parse(localStorage.getItem(TRACKED_ORDERS_KEY)) || [];
      tracked.push(orderId.toString());
      localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(tracked));
    } catch (e) {
      console.warn("Tracking: Failed to mark order as tracked", e);
    }
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

    console.log("checkoutData", checkoutData)

    // Add order info
    if (checkoutData) {
        payload.order_id = checkoutData.order_id;
        payload.email = checkoutData.email;
        payload.total_price = checkoutData.total_price;
        payload.currency = checkoutData.currency;
        payload.amount = checkoutData.total_line_items_price;
    }

    console.log("=== SENDING WEBHOOK ===");
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
        // Decide if we should return or track organic
        // return; 
    }

    // Sapo/Bizweb object
    var checkout = (window.Sapo && window.Sapo.checkout) || (window.Bizweb && window.Bizweb.checkout);

    if (checkout) {
      var orderId = checkout.order_id;
      
      if (isOrderTracked(orderId)) {
        console.log("Tracking: Order " + orderId + " already tracked. Skipping webhook.");
        return;
      }

      // Mark as tracked immediately to prevent double submission
      markOrderAsTracked(orderId);
      
      sendWebhook(params, checkout);
    } else {
      console.warn("Tracking: Checkout object not found.");
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkSuccessPage);
  } else {
    checkSuccessPage();
  }

})();
