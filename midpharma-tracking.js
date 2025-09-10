// Midpharma-tracking
(function () {
  const CONFIG = {
    cookieMaxAge: 30 * 24 * 60 * 60,
    webhookApi: "https://auto.admod.vn/webhook/mid-pharma-tracking",
  };

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function setClickId() {
    const clickId = getQueryParam("click_id");
    if (clickId) {
      document.cookie =
        "click_id=" + clickId + "; path=/; max-age=" + CONFIG.cookieMaxAge;
    }
  }

  function webhookDataForm(formData) {
    fetch(CONFIG.webhookApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    });
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function attachFormTracking() {
    document.addEventListener("DOMContentLoaded", function () {
      const forms = document.querySelectorAll("form");
      forms.forEach((form) => {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          handleFormSubmission(form);
        });

        const buttons = form.querySelectorAll('button[type="button"]');
        buttons.forEach((button) => {
          button.addEventListener("click", function () {
            handleFormSubmission(form);
          });
        });
      });
    });
  }

  function handleFormSubmission(form) {
    const clickId = getCookie("click_id") || "";

    const formDataObj = {};
    new FormData(form).forEach((value, key) => {
      formDataObj[key] = value;
    });

    formDataObj.click_id = clickId;
    webhookDataForm(formDataObj);
  }

  setClickId();
  attachFormTracking();
})();
