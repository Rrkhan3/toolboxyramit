# ToolBoxy — Free Online Tools for Everyone

Static website (HTML5 + CSS3 + vanilla JS). No build step, no backend. 43 working tools.
Production domain: https://toolboxy.xyz (canonical URLs, sitemap, robots and structured data already use it).

## Deploy
Upload the CONTENTS of this folder (index.html, css/, js/, tools/, assets/, robots.txt, sitemap.xml ...) to the web root (htdocs) of the host. On GitHub Pages, Cloudflare Pages, Netlify or Vercel: publish the folder with no build command.
After deployment, submit https://toolboxy.xyz/sitemap.xml in Google Search Console.

## Remaining configuration
- Contact form: no endpoint or email exists in the project, so the form shows "currently unavailable". To enable it, set `data-endpoint` (a real Formspree/Netlify Forms URL) and/or `data-email` (a real address, used via mailto) on `<form id="contact-form">` in `contact.html` (generated from `build.py`).
- Ads: in `js/ads.js` set `ADS_CONFIG` flags (Social Bar is enabled). Open any page with `?adsdebug=1` to log ad status in the console. The ad network must have toolboxy.xyz added/approved in its publisher dashboard, otherwise ads will not fill.
