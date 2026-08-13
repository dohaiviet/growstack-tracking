(function (window, document) {
  "use strict";

  var cookieDays = 15;
  var WEBHOOK_URL = "https://auto.admod.vn/webhook/postback-order";

  // Helper safe get cookie
  function getCookie(name) {
    if (typeof window.$ !== "undefined" && window.$.cookie) {
      try {
        var val = window.$.cookie(name);
        if (val !== undefined && val !== null) return val;
      } catch (e) {}
    }
    var nameEQ = name + "=";
    var cookieStr = (document && document.cookie) ? document.cookie : "";
    var ca = cookieStr.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  // Helper safe set cookie
  function setCookie(name, value, days) {
    if (!value) return;
    days = days || cookieDays;
    var expires = "";
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();

    var isSecure = (window.location && window.location.protocol === "https:") ? "; Secure" : "";

    try {
      if (document) {
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax" + isSecure;
      }
    } catch (e) {}

    if (typeof window.$ !== "undefined" && window.$.cookie) {
      try {
        window.$.cookie(name, value, { expires: days, path: "/", secure: window.location && window.location.protocol === "https:" });
      } catch (e) {}
    }
  }

  // Helper to fill click_id and ref values into input elements with id/name "click_id" and "ref"
  function fillInputs() {
    if (typeof document === "undefined") return;
    try {
      var clickId = getCookie("click_id");
      var ref = getCookie("ref");

      if (clickId) {
        var clickIdEls = document.querySelectorAll("#click_id, input[name='click_id']");
        for (var i = 0; i < clickIdEls.length; i++) {
          if (clickIdEls[i] && typeof clickIdEls[i].value !== "undefined") {
            clickIdEls[i].value = clickId;
          }
        }
      }

      if (ref) {
        var refEls = document.querySelectorAll("#ref, input[name='ref']");
        for (var j = 0; j < refEls.length; j++) {
          if (refEls[j] && typeof refEls[j].value !== "undefined") {
            refEls[j].value = ref;
          }
        }
      }
    } catch (e) {
      console.warn("Fill inputs error:", e);
    }
  }

  // Helper query string parser with fallback for legacy browsers
  function getQueryParam(key) {
    try {
      if (typeof window.URLSearchParams !== "undefined") {
        var urlParams = new URLSearchParams(window.location ? window.location.search : "");
        var val = urlParams.get(key);
        if (val) return val;
      }
    } catch (e) {}

    try {
      var search = window.location ? window.location.search : "";
      var match = RegExp("[?&]" + encodeURIComponent(key) + "=([^&]*)").exec(search);
      return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
    } catch (e) {
      return null;
    }
  }

  // Helper send HTTP POST Webhook
  function sendWebhook(url, payload, callback) {
    var bodyData = JSON.stringify(payload);

    if (typeof window.fetch !== "undefined") {
      window.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: bodyData
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.text();
        })
        .then(function (data) {
          if (typeof callback === "function") callback(null, data);
        })
        .catch(function (err) {
          console.warn("Webhook request failed: ", err);
          if (typeof callback === "function") callback(err);
        });
    } else if (typeof window.$ !== "undefined" && window.$.ajax) {
      window.$.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: bodyData
      }).done(function (data) {
        if (typeof callback === "function") callback(null, data);
      }).fail(function (xhr, status, error) {
        console.warn("Webhook request failed: ", error);
        if (typeof callback === "function") callback(error);
      });
    } else if (typeof XMLHttpRequest !== "undefined") {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (typeof callback === "function") callback(null, xhr.responseText);
          } else {
            console.warn("Webhook request failed: ", xhr.statusText);
            if (typeof callback === "function") callback(new Error(xhr.statusText));
          }
        }
      };
      xhr.send(bodyData);
    }
  }

  var BTMHTracking = {
    setCookiesTime: function (days) {
      var d = parseInt(days, 10);
      if (!isNaN(d) && d > 0) {
        cookieDays = d;
        var clickIdVal = getCookie("click_id");
        if (clickIdVal) {
          this.set(clickIdVal);
        }
        var refVal = getCookie("ref");
        if (refVal) {
          this.set_ref(refVal);
        }
      }
    },

    track_order: function (p) {
      p = p || {};
      var c = p.click_id || getCookie("click_id") || "";
      var status = p.order_status || p.status || "";
      var products = p.products || p.items || [];

      var payload = {
        click_id: c,
        order_status: status,
        products: products
      };

      sendWebhook(WEBHOOK_URL, payload);
    },

    set_click: function (p) {
      try {
        var clickIdParamKey = (p && p.click_id) ? p.click_id : "click_id";
        var clickIdVal = getQueryParam(clickIdParamKey) || getQueryParam("click_id");

        if (clickIdVal) {
          this.set(clickIdVal);
        }

        var refParamKey = (p && p.ref) ? p.ref : "ref";
        var refVal = getQueryParam(refParamKey) || getQueryParam("ref");

        if (refVal) {
          this.set_ref(refVal);
        }

        fillInputs();
      } catch (err) {
        console.warn("set_click error:", err);
      }
    },

    set: function (c) {
      if (c) {
        setCookie("click_id", c, cookieDays);
        fillInputs();
      }
    },

    set_ref: function (r) {
      if (r) {
        setCookie("ref", r, cookieDays);
        fillInputs();
      }
    },

    fill_inputs: function () {
      fillInputs();
    },

    get_click_id: function () {
      return getCookie("click_id");
    },

    get_ref: function () {
      return getCookie("ref");
    }
  };

  window.BTMH = BTMHTracking;

  try {
    if (typeof window !== "undefined" && typeof window.setTimeout !== "undefined") {
      window.setTimeout(function () {
        BTMHTracking.set_click();
      }, 0);
    } else {
      BTMHTracking.set_click();
    }
  } catch (err) {
    console.warn("Auto tracking set_click error:", err);
  }

  try {
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fillInputs);
      } else {
        fillInputs();
      }
    }
  } catch (err) {}

  if (typeof window.btmh_order_info !== "undefined") {
    BTMHTracking.track_order(window.btmh_order_info);
  }

})(typeof window !== "undefined" ? window : this, typeof document !== "undefined" ? document : null);
