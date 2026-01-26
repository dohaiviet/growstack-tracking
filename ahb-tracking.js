(function () {
  "use strict";

  console.log(
    "%c=== DEBUG SAPO CHECKOUT START ===",
    "color: blue; font-size: 16px; font-weight: bold;",
  );
  console.log("URL hiện tại:", window.location.href);
  console.log("Pathname:", window.location.pathname);

  var STORAGE_KEY = "aff_click_id";

  // Hàm lấy click_id
  function getClickId() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var data = JSON.parse(stored);
        if (data.expiry > Date.now()) {
          console.log(
            "%cClick_id từ localStorage: " + data.value,
            "color: green; font-weight: bold;",
          );
          return data.value;
        } else {
          console.log("localStorage hết hạn");
        }
      }
      var cookieMatch = document.cookie.match(
        new RegExp(STORAGE_KEY + "=([^;]+)"),
      );
      if (cookieMatch) {
        console.log(
          "%cClick_id từ cookie: " + cookieMatch[1],
          "color: green; font-weight: bold;",
        );
        return cookieMatch[1];
      }
    } catch (e) {
      console.warn("Lỗi lấy click_id:", e);
    }
    console.log("%cKHÔNG có click_id nào", "color: red; font-weight: bold;");
    return null;
  }

  var clickId = getClickId();

  // Chỉ chạy debug sâu nếu ở trang checkout
  if (
    window.location.pathname.includes("/checkout") ||
    window.location.pathname.includes("/checkouts")
  ) {
    console.log(
      "%cĐang ở trang CHECKOUT - Bắt đầu quét DOM",
      "color: orange; font-size: 14px;",
    );

    // Log tất cả textarea trên trang (để bạn xem có bao nhiêu và selector nào đúng)
    setTimeout(function () {
      var allTextareas = document.querySelectorAll("textarea");
      console.log("Tổng số textarea trên trang:", allTextareas.length);
      allTextareas.forEach(function (ta, index) {
        console.log(`Textarea ${index + 1}:`, {
          name: ta.name,
          id: ta.id,
          class: ta.className,
          placeholder: ta.placeholder,
          value_length: ta.value.length,
          value_preview: ta.value.substring(0, 100),
        });
      });
    }, 3000);

    // Quét liên tục tìm trường ghi chú
    var debugAttempts = 0;
    var debugInterval = setInterval(function () {
      debugAttempts++;
      console.log(`%c--- Lần quét ${debugAttempts} ---`, "color: purple;");

      var selectors = [
        'textarea[name="note"]',
        "textarea#note",
        'textarea[name="order_note"]',
        'textarea[name="customer_note"]',
        'textarea[class*="note"]',
        'textarea[placeholder*="ghi chú" i]',
        'textarea[placeholder*="Ghi chú" i]',
        'textarea[placeholder*="thêm thông tin" i]',
        'textarea[placeholder*="Thông tin thêm" i]',
      ];

      var noteField = document.querySelector(selectors.join(", "));

      if (noteField) {
        console.log(
          "%cTÌM THẤY trường ghi chú!",
          "color: green; font-size: 16px; font-weight: bold;",
        );
        console.log(
          "Selector khớp:",
          document
            .querySelector(selectors.join(", "))
            .matches(selectors.join(", ")),
        );
        console.log("Chi tiết field:", {
          tagName: noteField.tagName,
          name: noteField.name,
          id: noteField.id,
          class: noteField.className,
          placeholder: noteField.placeholder,
          current_value: noteField.value,
          value_length: noteField.value.length,
        });
        // Nếu có click_id, log xem đã có trong value chưa
        if (clickId && noteField.value.includes(clickId)) {
          console.log("%cClick_id ĐÃ có trong ghi chú", "color: green;");
        } else if (clickId) {
          console.log("%cClick_id CHƯA có trong ghi chú", "color: orange;");
        }
        // Dừng quét sau khi tìm thấy
        clearInterval(debugInterval);
        observer.disconnect();
      } else {
        console.log("Chưa tìm thấy trường ghi chú");
      }

      if (debugAttempts > 30) {
        console.log("Dừng quét sau 30 lần");
        clearInterval(debugInterval);
        observer.disconnect();
      }
    }, 1000); // Quét mỗi 1 giây

    // Observer theo dõi thay đổi DOM (vì Sapo load động)
    var observer = new MutationObserver(function () {
      console.log("%cDOM thay đổi - quét lại", "color: cyan;");
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log("Không phải trang checkout - chỉ log click_id cơ bản");
  }

  console.log(
    "%c=== DEBUG END ===\n",
    "color: blue; font-size: 16px; font-weight: bold;",
  );
})();
