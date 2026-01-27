(function () {
  "use strict";

  var STORAGE_KEY = "aff_click_id";

  // Helper: Retrieve Click ID from LocalStorage or Cookie
  function getClickId() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && d.value && Date.now() < d.expiry) return d.value;
    } catch (e) {}

    var m = document.cookie.match(/aff_click_id=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // Custom Logic Execution
  function executeCustomLogic(clickId, form) {
    console.log("=== CUSTOM TRACKING LOGIC ===");
    console.log("Click ID:", clickId);
    console.log("Form Action:", form.action);
    
    
    console.log("=============================");
  }

  // Event Listener for Form Submission
  function handleFormSubmit(e) {
    var form = e.target;
    
    // Check if valid form
    if (!form || form.tagName !== 'FORM') return;

    // Condition: Check if form action or current URL implies checkout
    // Adjust strings "/checkout" or "/cart" based on Bizweb/Sapo structure
    var isCheckoutContext = 
      (form.action && form.action.indexOf("/checkout") !== -1) ||
      window.location.pathname.indexOf("/checkout") !== -1;

    if (isCheckoutContext) {
      var clickId = getClickId();
      
      // If clickId exists, execute custom logic
      if (clickId) {
        executeCustomLogic(clickId, form);
      } else {
        console.log("Tracking: No Click ID found during checkout submit.");
      }
    }
  }

  // Initialize
  function init() {
    document.addEventListener("submit", handleFormSubmit);
  }

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
