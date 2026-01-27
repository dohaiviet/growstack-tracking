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

  function attachByRedirect() {
    var clickId = getClickId();
    if (!clickId) return;

    // Chỉ chạy khi đang ở trang checkout
    if (window.location.href.indexOf("/checkout") === -1) return;

    // Kiểm tra xem URL đã có note chưa để tránh loop vô tận
    if (window.location.href.indexOf("note=") !== -1) return;

    // Tạo URL mới
    var currentUrl = window.location.href;
    var separator = currentUrl.indexOf("?") !== -1 ? "&" : "?";
    
    // Thêm click_id vào note (Ghi chú đơn hàng)
    var newUrl = currentUrl + separator + "note=ClickID:" + clickId;

    // Chuyển hướng ngay lập tức
    window.location.replace(newUrl);
  }

  // Chạy ngay khi script load
  attachByRedirect();
})();