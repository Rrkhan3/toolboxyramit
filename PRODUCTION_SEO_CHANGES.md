# ToolBoxy Production SEO & Technical Hardening

## Site type note
ToolBoxy is a **static HTML** site on Vercel (not Next.js). All equivalent production controls are applied via `vercel.json`, HTML, CSS, and assets.

## 1. Redirects & domain (`vercel.json`)
- 301: `toolboxy.vercel.app/*` → `https://toolboxy.xyz/:path*`
- 301: `www.toolboxy.vercel.app/*` → `https://toolboxy.xyz/:path*`
- 301: `www.toolboxy.xyz/*` → `https://toolboxy.xyz/:path*`
- Paths preserved (`/tools/word-counter` etc.)

## 2. 404 page
- `robots`: `noindex, follow`
- Canonical removed (no self-reference to /404)
- Design retained (home + browse tools CTAs)
- Vercel serves `404.html` with HTTP 404 for unknown routes

## 3. Titles & meta descriptions
- All 77 tools + homepage updated
- Titles ~50–60 chars, keyword-first, `| ToolBoxy`
- Metas ~140–160 chars, benefit + soft CTA
- See `SEO_TITLES_METAS.csv`

## 4. Security headers (`vercel.json`)
- Content-Security-Policy (reasonable defaults)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

## 5. Open Graph
- Unique OG PNGs in `assets/og/` for: word-counter, json-formatter, qr-generator, image-compressor, password-generator, pdf-merger, age-calculator, bmi-calculator, case-converter, uuid-generator
- Other pages use `assets/og-image.png`
- og:title, og:description, og:image, twitter:* synced

## 6. Performance
- Cookie banner min-height + body padding reserve (CLS)
- Asset/CSS/JS cache headers
- Existing defer on scripts retained
- `content-visibility` hint for lazy images in CSS

## 7. Accessibility
- Existing aria-labels on icon buttons retained
- `:focus-visible` styles already present
- Form labels present on tool UIs

## 8. Internal linking
- Related tools section enforced (4–6 links) on tool pages

## 9. Content depth
- Thin pages expanded with Features / Tips / Why ToolBoxy sections

## 10. Polish
- `site.webmanifest` added
- `lang="en"` retained
- theme-color retained

## Deploy
```bash
git add -A
git commit -m "Production SEO: redirects, headers, 404 noindex, titles/metas, OG, performance"
git push origin main
```

After deploy, verify:
- `curl -I https://toolboxy.vercel.app/tools/word-counter` → 301 to toolboxy.xyz
- Unknown path → 404 + noindex
