(function () {
  "use strict";
  var STORAGE_KEY = "aff_click_id";

  function getClickId() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && d.value && Date.now() < d.expiry) return d.value;
    } catch (e) {}
    var m = document.cookie.match(/aff_click_id=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function updateSapoAttribute(clickId) {
    // Kiểm tra xem đã gửi request chưa để tránh spam
    if (sessionStorage.getItem("sapo_aff_tracked")) return;

    // Dữ liệu gửi đi theo chuẩn Sapo
    var data = {
      attributes: {
        "aff_click_id": clickId
      }
    };

    // Sử dụng fetch để gọi API cập nhật giỏ hàng
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Affiliate ID attached:', clickId);
      sessionStorage.setItem("sapo_aff_tracked", "true");
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  var clickId = getClickId();
  if (clickId) {
    // Gọi hàm cập nhật ngay khi script chạy
    updateSapoAttribute(clickId);
  }
})();