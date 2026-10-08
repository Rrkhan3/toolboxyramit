# ToolBoxy — External / DNS SEO items

These items appear on some SEO checkers but are **not application code bugs**.

## SPF (email authentication)
**Status:** PENDING EXTERNAL CONFIGURATION

ToolBoxy is a static site. There is no configured transactional email provider
(Google Workspace, Resend, SendGrid, Mailgun, SES, etc.) in this repository.

Do **not** invent an SPF TXT record such as `v=spf1 include:...` without a real mail provider.
When email is configured, add the provider’s official SPF include at the DNS host for toolboxy.xyz.

## ads.txt
**Status:** PENDING OFFICIAL SELLER AUTHORIZATION

No official ads.txt line from an ad seller is stored in this repo.
Do **not** invent publisher IDs.

If an advertising partner supplies an official line, add a root file:

```
/ads.txt
```

with exactly their authorized entry. Keep SmartLink consent-gated in code regardless.

## Google Analytics
**Status:** Implemented in code with consent gating

- Measurement ID: `G-RHTL8F5ZGW` (existing)
- Loaded only after Analytics consent (`js/consent.js`)
- Google Consent Mode defaults: analytics/ad storage denied until accept
- Some checkers still report “GA issues” until consent is granted in a live session

## CDN
**Status:** PASS WITH CONDITIONS

- Primary assets are served by the host (Vercel edge)
- Page-specific libraries (pdf-lib, pdfjs, js-yaml, etc.) load on demand from jsDelivr only when that tool runs
- Do not force every local file onto a third-party CDN solely for a checker score

## Canonicals
**Status:** PASS

Public canonical host is `https://toolboxy.xyz/` on TEST and production HTML.
TEST hostname (`toolboxy.vercel.app`) must not become the canonical.

## Backlinks
**Status:** OFF-PAGE — see BACKLINKS.md
