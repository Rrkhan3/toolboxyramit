/**
 * ToolBoxy Cookie Consent Manager (v1.0)
 * Lightweight, vanilla JS. Controls Analytics (GA) and Advertising (Google AdSense).
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
    /* Notify AdSense loader when advertising consent is granted */
    if (c && c.advertising) {
      try {
        if (window.ToolBoxyAds && typeof window.ToolBoxyAds.onAdvertisingConsentGranted === "function") {
          window.ToolBoxyAds.onAdvertisingConsentGranted();
        }
      } catch (e) {}
      try {
        window.gtag && window.gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted"
        });
      } catch (e) {}
    }
  }

  /* ---------- UI ---------- */
  var bannerEl = null;
  var modalEl = null;
  var previouslyFocused = null;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'onClick') node.addEventListener('click', attrs[k]);
        else if (k === 'className') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        if (typeof c === 'string') node.appendChild(document.createTextNode(c));
        else node.appendChild(c);
      });
    }
    return node;
  }

  function showBanner() {
    if (bannerEl) return;
    bannerEl = el('div', { id: 'tb-cookie-banner', className: 'tb-cookie-banner', role: 'dialog', 'aria-label': 'Cookie consent' }, [
      el('div', { className: 'tb-cookie-banner-inner' }, [
        el('p', null, [
          document.createTextNode(' ToolBoxy uses necessary technologies to keep the website working. With your permission, we may also use analytics and advertising technologies to improve the site and support free tools. '),
          el('a', { href: '/cookie-policy', className: 'tb-cookie-link' }, 'Cookie Policy')
        ]),
        el('div', { className: 'tb-cookie-actions' }, [
          el('button', { type: 'button', className: 'tb-btn tb-btn-secondary', text: 'Reject Optional', onClick: function () { saveAndClose({ analytics: false, advertising: false, preferences: false }); } }),
          el('button', { type: 'button', className: 'tb-btn tb-btn-secondary', text: 'Customize', onClick: openModal }),
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

  function makeToggle(name, checked) {
    var input = el('input', { type: 'checkbox', id: 'tb-consent-' + name, checked: checked ? 'checked' : null });
    if (checked) input.checked = true;
    return input;
  }

  function categoryBlock(title, desc, toggle, alwaysOn) {
    return el('div', { className: 'tb-cookie-category' }, [
      el('div', { className: 'tb-cookie-category-header' }, [
        el('strong', null, title),
        alwaysOn ? el('span', { className: 'tb-cookie-always' }, 'Always on') : toggle
      ]),
      el('p', { className: 'tb-cookie-category-desc' }, desc)
    ]);
  }

  function openModal() {
    if (modalEl) return;
    previouslyFocused = document.activeElement;
    var current = readConsent() || Object.assign({}, defaultConsent);
    var analyticsToggle = makeToggle('analytics', current.analytics);
    var advertisingToggle = makeToggle('advertising', current.advertising);
    var preferencesToggle = makeToggle('preferences', current.preferences);

    modalEl = el('div', { id: 'tb-cookie-modal', className: 'tb-cookie-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Cookie settings' }, [
      el('div', { className: 'tb-cookie-modal-backdrop', onClick: closeModal }),
      el('div', { className: 'tb-cookie-modal-panel' }, [
        el('h2', null, 'Cookie Settings'),
        el('p', null, 'Choose which optional technologies you allow. Necessary storage is always active.'),
        categoryBlock('Necessary', 'Always active. Theme preference and consent state stored locally in your browser. Required for basic site functionality.', null, true),
        categoryBlock('Analytics', 'Helps us understand how the site is used (Google Analytics). Loaded only with your consent. Tool input and files are never sent.', analyticsToggle, false),
        categoryBlock('Advertising', 'Allows Google AdSense advertising to help keep the free tools available. Google may set advertising cookies when you consent. See our Cookie Policy and Privacy Policy for details.', advertisingToggle, false),
        categoryBlock('Preferences', 'Optional preference storage for future features.', preferencesToggle, false),
        el('div', { className: 'tb-cookie-modal-actions' }, [
          el('button', { type: 'button', className: 'tb-btn tb-btn-secondary', text: 'Cancel', onClick: closeModal }),
          el('button', { type: 'button', className: 'tb-btn tb-btn-primary', text: 'Save preferences', onClick: function () {
            saveAndClose({
              analytics: analyticsToggle.checked,
              advertising: advertisingToggle.checked,
              preferences: preferencesToggle.checked
            });
          } })
        ])
      ])
    ]);
    document.body.appendChild(modalEl);
    document.body.classList.add('tb-cookie-modal-open');
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
    setConsentDefaults();
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
