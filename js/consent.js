/**
 * ToolBoxy Cookie Consent Manager (v1.0)
 * Lightweight, vanilla JS. Controls Analytics (GA) and Advertising (Smartlink).
 * Necessary: theme preference only. Does not collect tool input or personal data.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'toolboxy_cookie_consent';
  var CONSENT_VERSION = '1.0';
  var GA_ID = 'G-RHTL8F5ZGW';

  var defaultConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: false,
    advertising: false,
    preferences: false,
    timestamp: null
  };

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.version !== CONSENT_VERSION) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(data) {
    try {
      data.timestamp = new Date().toISOString();
      data.version = CONSENT_VERSION;
      data.necessary = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* private mode */ }
  }

  function ensureGtagStub() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { dataLayer.push(arguments); };
    }
  }

  function setConsentDefaults() {
    ensureGtagStub();
    /* Google Consent Mode: deny until the user accepts Analytics */
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
  }

  function loadAnalytics() {
    if (window.__toolboxyGALoaded) return;
    window.__toolboxyGALoaded = true;
    ensureGtagStub();
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function applyConsent(c) {
    if (c && c.analytics) loadAnalytics();
    // Advertising is enforced in ads.js via window.ToolBoxyConsent
    window.ToolBoxyConsent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!(c && c.analytics),
      advertising: !!(c && c.advertising),
      preferences: !!(c && c.preferences),
      hasChoice: !!c,
      openSettings: openModal,
      get: function () { return readConsent() || Object.assign({}, defaultConsent); }
    };
  }

  /* ---------- UI ---------- */
  var bannerEl = null;
  var modalEl = null;
  var previouslyFocused = null;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (k === 'html') node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function showBanner() {
    if (bannerEl) return;
    bannerEl = el('div', {
      id: 'tb-cookie-banner',
      className: 'tb-cookie-banner',
      role: 'dialog',
      'aria-label': 'Cookie consent',
      'aria-live': 'polite'
    }, [
      el('div', { className: 'tb-cookie-banner-inner' }, [
        el('p', { className: 'tb-cookie-banner-text' }, [
          el('strong', { text: 'We use cookies' }),
          document.createTextNode(' ToolBoxy uses necessary technologies to keep the website working. With your permission, we may also use analytics and advertising technologies to improve the site and support free tools. ')
        ]),
        el('p', { className: 'tb-cookie-banner-links' }, [
          el('a', { href: '/cookie-policy', text: 'Cookie Policy' }),
          document.createTextNode(' · '),
          el('a', { href: '/privacy', text: 'Privacy Policy' })
        ]),
        el('div', { className: 'tb-cookie-banner-actions' }, [
          el('button', { type: 'button', className: 'tb-btn tb-btn-secondary', text: 'Reject Optional', onClick: function () { saveAndClose({ analytics: false, advertising: false, preferences: false }); } }),
          el('button', { type: 'button', className: 'tb-btn tb-btn-secondary', text: 'Customize', onClick: function () { openModal(); } }),
          el('button', { type: 'button', className: 'tb-btn tb-btn-primary', text: 'Accept All', onClick: function () { saveAndClose({ analytics: true, advertising: true, preferences: true }); } })
        ])
      ])
    ]);
    document.body.appendChild(bannerEl);
  }

  function hideBanner() {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }

  function openModal() {
    if (modalEl) return;
    previouslyFocused = document.activeElement;
    var current = readConsent() || Object.assign({}, defaultConsent);

    var analyticsToggle = makeToggle('analytics', current.analytics);
    var advertisingToggle = makeToggle('advertising', current.advertising);

    modalEl = el('div', {
      id: 'tb-cookie-modal',
      className: 'tb-cookie-modal-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'tb-cookie-modal-title'
    }, [
      el('div', { className: 'tb-cookie-modal', tabIndex: '-1' }, [
        el('div', { className: 'tb-cookie-modal-header' }, [
          el('h2', { id: 'tb-cookie-modal-title', text: 'Cookie Preferences' }),
          el('button', { type: 'button', className: 'tb-cookie-close', 'aria-label': 'Close', text: '×', onClick: closeModal })
        ]),
        el('div', { className: 'tb-cookie-modal-body' }, [
          el('p', { className: 'tb-cookie-modal-intro', text: 'Choose which optional technologies you allow. Necessary items are always on so the site can function.' }),
          categoryBlock('Necessary', 'Always active. Theme preference and consent state stored locally in your browser. Required for basic site functionality.', null, true),
          categoryBlock('Analytics', 'Helps us understand how visitors use ToolBoxy (page views, traffic sources) via Google Analytics. No tool input or file content is sent.', analyticsToggle, false),
          categoryBlock('Advertising', 'Allows optional advertising support (Smartlink opens on certain download/generate actions). Third-party ad networks may set their own cookies when you visit their pages.', advertisingToggle, false)
        ]),
        el('div', { className: 'tb-cookie-modal-footer' }, [
          el('button', { type: 'button', className: 'tb-btn tb-btn-secondary', text: 'Cancel', onClick: closeModal }),
          el('button', {
            type: 'button', className: 'tb-btn tb-btn-primary', text: 'Save Preferences',
            onClick: function () {
              saveAndClose({
                analytics: analyticsToggle.checked,
                advertising: advertisingToggle.checked,
                preferences: false
              });
            }
          })
        ])
      ])
    ]);

    document.body.appendChild(modalEl);
    document.body.classList.add('tb-cookie-modal-open');
    var focusTarget = modalEl.querySelector('.tb-cookie-close') || modalEl.querySelector('.tb-cookie-modal');
    if (focusTarget) focusTarget.focus();

    modalEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      if (e.key === 'Tab') trapFocus(e, modalEl);
    });
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) closeModal();
    });
  }

  function makeToggle(name, checked) {
    var input = el('input', {
      type: 'checkbox',
      id: 'tb-consent-' + name,
      className: 'tb-cookie-toggle-input'
    });
    input.checked = !!checked;
    return input;
  }

  function categoryBlock(title, desc, toggleInput, alwaysOn) {
    var right;
    if (alwaysOn) {
      right = el('span', { className: 'tb-cookie-badge', text: 'Always Active' });
    } else {
      var label = el('label', { className: 'tb-cookie-switch', for: toggleInput.id }, [
        toggleInput,
        el('span', { className: 'tb-cookie-switch-ui', 'aria-hidden': 'true' })
      ]);
      right = label;
    }
    return el('div', { className: 'tb-cookie-category' }, [
      el('div', { className: 'tb-cookie-category-head' }, [
        el('strong', { text: title }),
        right
      ]),
      el('p', { text: desc })
    ]);
  }

  function trapFocus(e, container) {
    var focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function closeModal() {
    if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
    document.body.classList.remove('tb-cookie-modal-open');
    if (previouslyFocused && previouslyFocused.focus) {
      try { previouslyFocused.focus(); } catch (e) {}
    }
  }

  function saveAndClose(opts) {
    var data = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!opts.analytics,
      advertising: !!opts.advertising,
      preferences: !!opts.preferences,
      timestamp: null
    };
    writeConsent(data);
    applyConsent(data);
    hideBanner();
    closeModal();
  }

  function init() {
    var existing = readConsent();
    applyConsent(existing);
    if (!existing) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    }

    // Cookie Settings links (footer / anywhere)
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'tb-cookie-settings' || (t.closest && t.closest('#tb-cookie-settings')) ||
          (t.getAttribute && t.getAttribute('data-cookie-settings') === '1')) {
        e.preventDefault();
        openModal();
      }
    });
  }

  init();
})();
