/* ToolBoxy — Vercel Speed Insights loader for static HTML.
   Loads the platform script only when served on Vercel.
   Safe no-op if the script is unavailable (local/static hosts). */
(function () {
  try {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "/_vercel/speed-insights/script.js";
    s.onerror = function () { /* offline / non-Vercel: ignore */ };
    (document.head || document.documentElement).appendChild(s);
  } catch (e) { /* ignore */ }
})();
