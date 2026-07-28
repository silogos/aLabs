/* ============================================================
   Helix · Auth module — shared interactions
   Used by the auth screens that need real behavior:
   password visibility, password strength, navigation, toast.
   ============================================================ */
(function () {
  'use strict';

  /* ---- password visibility toggle ---- */
  window.togglePw = function (id, btn) {
    var el = document.getElementById(id);
    if (!el || !btn) return;
    var show = el.type === 'password';
    el.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.innerHTML = show
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.9 4.2A9.5 9.5 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3 3.8M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 4-1M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  };

  /* ---- navigation helper ---- */
  window.go = function (u) { if (u) location.href = u; };

  /* ---- prototype submit (loading + toast) ---- */
  var _t;
  window.toast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText =
        'position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);' +
        'background:var(--fg-strong);color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;' +
        'box-shadow:var(--shadow-pop);opacity:0;transition:opacity .16s,transform .16s;z-index:200;max-width:90vw';
      document.body.appendChild(t);
    }
    if (_t) clearTimeout(_t);
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    _t = setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2600);
  };

  window.fakeSubmit = function (btn, msg) {
    if (!btn) return;
    btn.classList.add('loading');
    btn.disabled = true;
    setTimeout(function () {
      btn.classList.remove('loading');
      btn.disabled = false;
      window.toast(msg || 'This is a prototype — no data was submitted or stored.');
    }, 1100);
  };

  /* ---- password strength + requirement checklist ---- */
  var LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  window.strength = function (el) {
    if (!el) return;
    var wrap = document.getElementById('strWrap');
    var label = document.getElementById('strLabel');
    var list = document.getElementById('reqList');
    var count = document.getElementById('pwCount');

    function compute() {
      var v = el.value || '';
      if (count) count.textContent = v.length ? v.length + ' chars' : '';
      var checks = {
        len: v.length >= 8,
        upper: /[a-z]/.test(v) && /[A-Z]/.test(v),
        num: /\d/.test(v),
        sym: /[^A-Za-z0-9]/.test(v)
      };
      if (list) {
        Object.keys(checks).forEach(function (k) {
          var li = list.querySelector('[data-r="' + k + '"]');
          if (li) li.classList.toggle('met', checks[k]);
        });
      }
      var score = 0;
      if (v.length >= 8) score++;
      if (v.length >= 12) score++;
      if (checks.upper) score++;
      if (checks.num) score++;
      if (checks.sym) score++;
      if (v.length === 0) score = 0;
      else if (score > 4) score = 4;
      else if (score < 1) score = 1;
      if (v.length > 0 && v.length < 8) score = 1;

      if (wrap) {
        wrap.className = 'strength s' + score;
      }
      if (label) label.textContent = v.length ? LABELS[score] : '—';
    }
    el.addEventListener('input', compute);
    compute();
  };
})();
