/* ToolBoxy ads — Google AdSense integration (consent-aware).
   Smartlink / Adsterra completely removed.
   AdSense script loads only after Advertising consent is granted.
   Ad units render only when a valid data-ad-slot ID is configured.
   Debug: open any page with ?adsdebug=1 to log status in the console. */
window.ADS_CONFIG = window.ADS_CONFIG || {
  /* Publisher ID — do not invent slot IDs. Leave slotIds empty until you create real ad units in AdSense. */
  publisherId: 'ca-pub-1234265185073276',
  /* Optional: map of placement keys to real AdSense slot IDs (e.g. 'home-below-hero': '1234567890').
     If a key has no valid numeric slot ID, nothing is rendered for that placement. */
  slotIds: {
    // 'home-below-hero': '',
    // 'home-between-categories': '',
    // 'tool-below-result': '',
    // 'tool-sidebar': ''
  },
  /* Max ad units that may be requested per page (safety). */
  maxUnitsPerPage: 3
};

(() => {
  try {
    const C = window.ADS_CONFIG;
    const S = (window.ToolBoxyAds = {
      status: {},
      debug: /[?&]adsdebug=1/.test(location.search),
      unitsRendered: 0
    });
    const log = (k, v) => {
      S.status[k] = v;
      if (S.debug) console.info('[ToolBoxy ads]', k, v);
    };

    function hasAdvertisingConsent() {
      try {
        if (window.ToolBoxyConsent && typeof window.ToolBoxyConsent.advertising === 'boolean') {
          return window.ToolBoxyConsent.advertising === true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }

    /** Inject AdSense meta tag once (helps verification). */
    function ensureMeta() {
      if (document.querySelector('meta[name="google-adsense-account"]')) return;
      const m = document.createElement('meta');
      m.name = 'google-adsense-account';
      m.content = C.publisherId;
      document.head.appendChild(m);
      log('meta', 'injected');
    }

    /** Load the official AdSense script once after consent. */
    function loadAdSenseScript() {
      if (window.__toolboxyAdSenseLoaded) return;
      if (!hasAdvertisingConsent()) {
        log('script', 'skipped (no advertising consent)');
        return;
      }
      window.__toolboxyAdSenseLoaded = true;
      ensureMeta();
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(C.publisherId);
      s.crossOrigin = 'anonymous';
      s.onerror = () => log('script', 'load-error');
      s.onload = () => log('script', 'loaded');
      document.head.appendChild(s);
      log('script', 'loading');
    }

    /**
     * Render a responsive AdSense unit into the given container element
     * only if a valid slot ID is configured for the placement key.
     * Renders nothing when no slot ID is set (no empty boxes).
     * @param {HTMLElement} container
     * @param {string} placementKey  e.g. 'tool-below-result'
     */
    S.renderAdUnit = (container, placementKey) => {
      try {
        if (!container || !placementKey) return;
        if (S.unitsRendered >= (C.maxUnitsPerPage || 3)) {
          log('unit', 'skipped (max units)');
          return;
        }
        const slotId = (C.slotIds && C.slotIds[placementKey]) || '';
        if (!slotId || !/^\d+$/.test(String(slotId).trim())) {
          log('unit', placementKey + ': no valid slot ID — nothing rendered');
          return;
        }
        if (!hasAdvertisingConsent()) {
          log('unit', placementKey + ': skipped (no consent)');
          return;
        }
        loadAdSenseScript();
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', C.publisherId);
        ins.setAttribute('data-ad-slot', String(slotId).trim());
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        container.appendChild(ins);
        container.classList.add('ad-slot');
        container.setAttribute('data-ad-slot', slotId);
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          log('unit', placementKey + ': push error');
        }
        S.unitsRendered += 1;
        log('unit', placementKey + ': rendered slot ' + slotId);
      } catch (e) {
        log('unit', 'error');
      }
    };

    /** No-op stubs kept so any residual call sites do not throw. */
    S.showSmartlinkAd = () => { log('smartlink', 'removed'); };
    S.openSmartLink = () => { log('smartlink', 'removed'); };

    /** Called by consent.js after advertising is granted so script can load. */
    S.onAdvertisingConsentGranted = () => {
      loadAdSenseScript();
    };

    // Meta can be present early for verification crawlers; script waits for consent.
    ensureMeta();

    if (hasAdvertisingConsent()) {
      loadAdSenseScript();
    }

    log('init', 'adsense (consent-aware, no smartlink)');
  } catch (e) {}
})();
