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

  function executeTrackingLogic(clickId, checkoutData) {
    console.log("=== SUCCESS PAGE TRACKING ===");
    console.log("Click ID:", clickId);
    console.log("Order Data:", checkoutData);
    
    // Here you can send data to your server
    // var payload = {
    //   click_id: clickId,
    //   order_id: checkoutData.order_id,
    //   amount: checkoutData.total_price,
    //   products: checkoutData.line_items
    // };
    // navigator.sendBeacon('https://your-api.com/track', JSON.stringify(payload));
    
    console.log("=============================");
  }

  function checkSuccessPage() {
    // Check if we are on the Thank You page
    // Adjust path check to match Sapo's specific thank you URL pattern
    var isThankYouPage = 
        window.location.pathname.indexOf("/checkout/thankyou") !== -1 || 
        window.location.pathname.indexOf("test_thankyou") !== -1; // For testing

    if (!isThankYouPage) return;

    var clickId = getClickId();
    if (!clickId) {
        console.log("Tracking: Success page reached, but no Click ID found.");
        // Decide if you still want to track orders without click ID (organic)
        // return; 
    }

    // Try to access Sapo or Bizweb object
    var checkout = (window.Sapo && window.Sapo.checkout) || (window.Bizweb && window.Bizweb.checkout);

    if (checkout) {
      executeTrackingLogic(clickId, checkout);
    } else {
      console.warn("Tracking: Success page detected but 'Sapo.checkout' data/object is missing.");
    }
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkSuccessPage);
  } else {
    checkSuccessPage();
  }

})();
