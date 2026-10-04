# Blooming Financial Website

Static website for Blooming Financial, a tax preparation, bookkeeping, payroll, tax planning, and business consulting firm serving individuals and small businesses.

Live site: https://www.bloomingfinancials.com/

## Stack

This is a static GitHub Pages website built with plain HTML, Tailwind CSS (compiled to a static stylesheet), Open Sans, Font Awesome, static image assets, and small inline JavaScript.

There is no React, Next.js, or Jekyll. Pages are edited directly as HTML files, with two small build/maintenance steps:

- **Tailwind CSS**: pages link `/assets/tailwind.css`, a committed static build. After adding or changing Tailwind classes, rebuild it with `npx tailwindcss -c tailwind.config.js -i tailwind.input.css -o assets/tailwind.css --minify` (run `npm install` once first).
- **Shared partials**: the nav, mobile menu, footer, and back-to-top button on the 18 full-nav pages (including `404.html`) are stamped from `_partials/*.html` between `<!-- bf:* -->` sentinel comments. Edit the partial, then run `python3 tools/build.py` to restamp every page. Do not hand-edit inside the sentinels. Privacy and Terms keep their own lightweight header/footer and are not stamped.
- **Shared scripts**: every page loads two deferred scripts in `<head>`:
  - `assets/site.js` runs the mobile menu, Services dropdown and accordion, back-to-top button, and phone/email click tracking.
  - `assets/consent.js` owns all tracking. It loads Google Analytics and the OpenAI (ChatGPT) Ads pixel unless the visitor opts out in the Privacy & Cookie Preferences dialog (opened from the footer's "Cookie Preferences" and "Do Not Sell or Share" links), and it honors Global Privacy Control for advertising. Report conversions with `BF.trackLead('<source>')`; never paste GA or pixel snippets into a page.

CI (`.github/workflows/checks.yml`) fails a PR if the partials are out of sync, the Tailwind build is stale, any inline or `assets/` script has a syntax error, a page loads tracking outside `assets/consent.js`, or a nav block has unbalanced divs.

## Important Files and Folders

- `index.html` - homepage, main navigation, hero section, trust indicators, service cards, about section, testimonials, consultation form, contact form, footer, and shared homepage scripts.
- `services/` - services hub and individual service detail pages.
- `blogs/` - blog index, blog article pages, and blog image assets.
- `privacy/` - privacy policy page.
- `terms/` - terms of service page.
- `404.html` - branded "page not found" page that GitHub Pages serves for any missing URL (noindex; all paths absolute).
- `assets/` - compiled Tailwind stylesheet plus the shared `site.js` and `consent.js` scripts.
- `sitemap.xml` - search engine sitemap for the homepage, service pages, blog pages, and legal pages.
- `DESIGN.md` - design and content guidance for future edits.
- `CNAME` - GitHub Pages custom domain configuration.
- `site.webmanifest` - browser/app manifest and icon references.

## Main Site Structure

```text
/
/services/
/services/individual-tax-preparation/
/services/business-tax-preparation/
/services/tax-planning/
/services/bookkeeping/
/services/payroll/
/services/irs-ftb-notice-support/
/services/business-consulting/
/blogs/
/privacy/
/terms/
```

## Services

The website currently presents these core services:

- Individual Tax Preparation
- Business Tax Preparation
- Tax Planning
- Bookkeeping
- Payroll
- IRS & FTB Notice Support
- Business Consulting

Use these exact service labels when updating navigation, service cards, internal links, and SEO copy unless there is an intentional naming change across the whole site.

## Design Notes

The current visual identity is documented in `DESIGN.md`. The main visible design direction uses:

- Open Sans typography
- Dark blue and bright blue brand colors
- Blue gradient hero sections
- White and light-gray page sections
- Rounded white cards with soft shadows
- Font Awesome icons
- Clear blue call-to-action buttons

The most important design source files are `index.html`, `services/index.html`, the individual service pages, `blogs/index.html`, blog article pages, `privacy/index.html`, and `terms/index.html`.

## Editing Notes

This site is manual HTML with light tooling. The nav, mobile menu, and footer are single-sourced in `_partials/` (see Stack above) — change them there and restamp. Other repeated patterns (head metadata, inline scripts, schema) are still per-page: when changing those globally, update every affected page and verify consistency.

Before publishing SEO-sensitive edits, check:

- Page titles
- Meta descriptions
- Canonical URLs
- Open Graph tags
- JSON-LD schema
- Internal links and anchor text
- Sitemap entries
- Form behavior
- Mobile navigation behavior

Keep existing URLs stable unless a redirect plan is created. URL changes can affect indexing, search appearance, backlinks, and Google sitelinks.

## Forms and External Links

The site uses external services for forms, analytics, icons, fonts, and the client portal. Review existing HTML before changing these integrations.

Common external integrations include:

- Google Analytics and the OpenAI (ChatGPT) Ads pixel, loaded only through `assets/consent.js`
- Formspree forms (each has a hidden `_gotcha` spam-trap field)
- Google Fonts
- Font Awesome CDN (decorative icons only; navigation controls use inline SVG so they work if the CDN fails)
- Google Maps embed on the homepage contact section
- Client portal link
- Instagram, Yelp, and Google Maps profile links

## Recommended Workflow

For small content or design edits:

1. Edit the relevant HTML file.
2. Check the page locally or through GitHub Pages after deployment.
3. Verify nav, footer, mobile menu, forms, links, and responsive layout.
4. If URLs or major SEO fields changed, update `sitemap.xml` and request indexing in Google Search Console.

For global changes such as navigation, footer, business hours, phone number, email, or service labels, search the full repo and update every matching page.

## Future Maintenance

A future migration to a light static-site generator such as Jekyll may be useful if the site grows significantly or if frequent blog publishing becomes a priority. For now, the site remains intentionally simple and static.
