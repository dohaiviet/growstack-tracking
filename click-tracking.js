(function () {
  "use strict";

  var PARAM_NAME = "click_id";
  var STORAGE_KEY = "aff_click_id"; 
  var AFF_PARAMS_KEY = "aff_params"; 
  var EXPIRY_DAYS = 30;

  try {
    var params = new URLSearchParams(window.location.search);
    var clickId = params.get(PARAM_NAME);
    if (!clickId) return;

    var expiryTime = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    var data = {
      value: clickId,
      expiry: expiryTime
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    var affParams = {};
    try {
      var existing = JSON.parse(localStorage.getItem(AFF_PARAMS_KEY));
      if (existing && existing.value && Date.now() < existing.expiry) {
        affParams = existing.value;
      }
    } catch (e) {
      console.warn("Tracking: Invalid storage data", e);
    }
    
    affParams[PARAM_NAME] = clickId;

    var affParamsData = {
      value: affParams,
      expiry: expiryTime
    };
    localStorage.setItem(AFF_PARAMS_KEY, JSON.stringify(affParamsData));

    document.cookie =
      STORAGE_KEY + "=" + clickId +
      ";path=/;max-age=" + (EXPIRY_DAYS * 24 * 60 * 60) +
      ";SameSite=Lax";

    console.log("Tracking: Saved click_id successfully", clickId);

  } catch (e) {
    console.warn("Save click_id error", e);
  }
})();
