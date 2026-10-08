/* ToolBoxy ads — Smartlink-only system.
   Banner, Native Banner, and Social Bar formats are fully removed.
   Smartlink opens in a new tab on explicit high-intent user actions only
   (PDF/Image/QR Generate & Download, Converter Download).
   Respects advertising consent from ToolBoxyConsent when present.
   Debug: open any page with ?adsdebug=1 to log status in the console. */
window.ADS_CONFIG = window.ADS_CONFIG || {
  smartlinkEnabled: true,
  /* Real Smartlink URL — single source of truth. Do not duplicate elsewhere. */
  smartlinkUrl: 'https://www.profitableratecpmnetwork.com/k2vpj8x9aw?key=ca6728a741f2769530316891440cda9e'
};

(() => {
  try {
    const C = window.ADS_CONFIG;
    const S = (window.ToolBoxyAds = { status: {}, debug: /[?&]adsdebug=1/.test(location.search) });
    const log = (k, v) => {
      S.status[k] = v;
      if (S.debug) console.info('[ToolBoxy ads]', k, v);
    };

    /* Cooldown prevents double-click / Generate+Download double-fire from one user flow. */
    let lastOpen = 0;
    const COOLDOWN_MS = 2500;

    function hasAdvertisingConsent() {
      try {
        if (window.ToolBoxyConsent && typeof window.ToolBoxyConsent.advertising === 'boolean') {
          return window.ToolBoxyConsent.advertising === true;
        }
        // If consent system not loaded yet, do not open ads
        return false;
      } catch (e) {
        return false;
      }
    }

    /**
     * Open the centralized Smartlink in a new tab.
     * @param {string} [actionType] - optional label for debug (e.g. 'pdf-download', 'qr-generate')
     * Safe when popup blocked — never throws, never blocks the real tool action.
     * Requires advertising consent when consent manager is present.
     */
    S.showSmartlinkAd = (actionType) => {
      try {
        if (!C.smartlinkEnabled || !C.smartlinkUrl) {
          log('smartlink', 'disabled');
          return;
        }
        if (!hasAdvertisingConsent()) {
          log('smartlink', 'skipped (no advertising consent)' + (actionType ? ' ' + actionType : ''));
          return;
        }
        const now = Date.now();
        if (now - lastOpen < COOLDOWN_MS) {
          log('smartlink', 'skipped (cooldown)' + (actionType ? ' ' + actionType : ''));
          return;
        }
        lastOpen = now;
        const w = window.open(C.smartlinkUrl, '_blank', 'noopener,noreferrer');
        log('smartlink', (w ? 'opened' : 'popup-blocked') + (actionType ? ' ' + actionType : ''));
      } catch (e) {
        log('smartlink', 'error');
      }
    };

    /* Backward-compatible alias used by existing tool handlers */
    S.openSmartLink = () => S.showSmartlinkAd();

    log('init', 'smartlink-only (consent-aware)');
  } catch (e) {}
})();
