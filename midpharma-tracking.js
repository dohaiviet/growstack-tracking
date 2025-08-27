(function () {
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function setClickId() {
    const clickId = getQueryParam("click_id");
    if (clickId) {
      document.cookie =
        "click_id=" + clickId + "; path=/; max-age=" + 30 * 24 * 60 * 60;
    }
  }

  function sendToGoogleSheet(formData) {
    fetch(
      "https://script.google.com/macros/s/AKfycbxsxHYtUnPDXAbIv1eprXeNKZ9A7gtJb0SZ66oaN_Qpfr7yzKELHuzKV2gSRQ6ghZts/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );
  }

  function sendConversion(clickId) {
    if (!clickId) {
      console.warn("No click_id found, skip conversion");
      return;
    }

    fetch(
      "https://demo-be.growstack.vn/api/v2/network/tracking/conv-click-id?api-key=0c5a750995bc0561b3d9dcf9bbda5b117347eea4",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ click_id: clickId }),
      }
    )
      .then((res) => res.json())
      .then((data) => console.log("Data:", data))
      .catch((err) => console.error("Error:", err));
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

          const clickId = getCookie("click_id") || "";

          const formDataObj = {};
          new FormData(form).forEach((value, key) => {
            formDataObj[key] = value;
          });

          formDataObj.click_id = clickId;

          sendToGoogleSheet(formDataObj);
          sendConversion(clickId);
        });
      });
    });
  }

  setClickId();
  attachFormTracking();
})();
