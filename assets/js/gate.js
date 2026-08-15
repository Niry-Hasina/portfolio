(function () {
  var SESSION_KEY = 'nhr_work_access';
  var ACCESS_CODE_HASH = '6b8cd7f1d8879d4f91a5a1a8a58e03b6d03c0e0956130e59a391c5af04fac13a';

  // document.currentScript can be null in some dev-server / extension setups —
  // fall back to locating the tag by its src so this never throws and silently
  // breaks the rest of the script (which would leave the form's submit
  // un-intercepted, so pressing Enter just does a native page reload).
  var scriptEl = document.currentScript || document.querySelector('script[src*="gate.js"]');
  var scriptSrc = scriptEl ? scriptEl.src : location.href;
  var markerIndex = scriptSrc.indexOf('assets/js/gate.js');
  var siteRoot = markerIndex > -1 ? scriptSrc.substring(0, markerIndex) : location.origin + '/';
  var gateUrl = siteRoot + 'work/index.html';

  var path = location.pathname.replace(/index\.html$/, '');
  var isGatePage = /\/work\/$/.test(path);

  var unlocked = sessionStorage.getItem(SESSION_KEY) === '1';

  if (!unlocked) {
    document.documentElement.classList.add('gate-locked');
    if (!isGatePage) {
      location.replace(gateUrl);
      return;
    }
    document.addEventListener('DOMContentLoaded', initGateForm);
  }

  function sha256Hex(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function initGateForm() {
    var gateEl = document.querySelector('.work-gate');
    var form = document.getElementById('workGateForm');
    var input = document.getElementById('workGateInput');
    var errorEl = document.getElementById('workGateError');
    if (!gateEl || !form || !input) return;

    // Belt-and-suspenders: even if something below throws, never let the
    // form fall through to a native submit (which reloads the page to
    // itself and silently wipes the input with no error/success shown —
    // the exact symptom this is guarding against).
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var code = input.value.trim().toLowerCase();
      if (!code) return;

      sha256Hex(code).then(function (hash) {
        if (hash === ACCESS_CODE_HASH) {
          sessionStorage.setItem(SESSION_KEY, '1');
          if (errorEl) errorEl.classList.remove('is-visible');
          document.documentElement.classList.remove('gate-locked');
        } else {
          if (errorEl) errorEl.classList.add('is-visible');
          input.value = '';
          input.focus();
        }
      }).catch(function () {
        if (errorEl) errorEl.classList.add('is-visible');
      });
    });
  }
})();
