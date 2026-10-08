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
  - `assets/consent.js` owns all tracking. It loads Google Analytics and the OpenAI (ChatGPT) Ads pixel unless the visitor opts out in the Privacy & Cookie Preferences dialog (opened from the footer's "Cookie Preferences" and "Do Not Sell or Share" links), and it honors Global Privacy Control for advertising. Report conversions with `BF.trackLead('<source>')` (an optional second argument adds non-personal GA parameters); never paste GA or pixel snippets into a page.
  - The homepage also loads `assets/intake.js`, which runs the consultation form (see "Consultation intake form" below).

CI (`.github/workflows/checks.yml`) fails a PR if the partials are out of sync, the Tailwind build is stale, any inline or `assets/` script has a syntax error, a page loads tracking outside `assets/consent.js`, or a nav block has unbalanced divs.

## Important Files and Folders

- `index.html` - homepage, main navigation, hero section, trust indicators, service cards, about section, testimonials, consultation form, contact form, footer, and shared homepage scripts.
- `services/` - services hub and individual service detail pages.
- `blogs/` - blog index, blog article pages, and blog image assets.
- `privacy/` - privacy policy page.
- `terms/` - terms of service page.
- `404.html` - branded "page not found" page that GitHub Pages serves for any missing URL (noindex; all paths absolute).
- `assets/` - compiled Tailwind stylesheet, the shared `site.js` and `consent.js` scripts, and the homepage's `intake.js`.
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

## Tax Content Maintenance

The [October 2026 tax-content review](docs/tax-content-review.md) records material corrections and their official sources. Keep tax years explicit, distinguish federal and California treatment, and use IRS, FTB, EDD, and DIR guidance when updating tax claims. After a substantive article review, update its visible review date and `BlogPosting.dateModified`, retain its publication date, and check the matching service-page FAQs and JSON-LD answers. Source links can roll forward to new tax years, so recheck the year before applying a figure.

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

## Consultation intake form

The homepage uses a guided inquiry in `assets/intake.js`, with one question visible at a time. The visitor chooses individual, business, both, or not sure. That answer determines the service list. Each service has at most two follow-up questions before contact details. Completed answers remain available through **Change** controls.

- Individual tax preparation or amendments: tax year(s).
- Business/combined tax preparation: tax year(s) and business structure.
- Bookkeeping: ongoing, cleanup, both, setup, or not sure.
- Payroll: setup, switching providers, an issue, or not sure.
- Tax planning: one topic, tailored to the client type.
- Notices: agency and response deadline. EDD is shown on business paths.
- Consulting: one business topic. Not-sure paths can proceed directly to contact.

**Contact details:** name, email, and phone are required. An expandable notes field accepts other services, deadlines, or questions. Industry, transaction counts, referral source, and preferred calling times are left for follow-up. No documents, identification numbers, or financial amounts are requested.

**Editing questions:** `questions()` in `assets/intake.js` owns the branching, professional wording, choices, and stable email labels. `taxYears()` rolls the choices forward each year and offers the upcoming season from October. A `multiple` question has a Continue button; single-choice buttons reveal the next question immediately. Tax years and Not sure are mutually exclusive. Styles live in `tailwind.input.css`; rebuild the committed stylesheet after changes.

**Changing answers:** changing client type clears service and follow-up answers; changing service clears its follow-ups. Contact details and notes stay in the same DOM fields. Only valid answers from the current question path are sent to Formspree. There is no browser storage of inquiry data.

**Submission:** the existing Formspree endpoint and honeypot remain. The email includes a readable `Summary`, name/email/phone, each relevant answer, optional `Notes`, and a useful subject. Notice deadlines within two weeks or already passed prefix the subject with `URGENT notice:`. Only a successful response shows confirmation. Pending requests prevent duplicate submissions and editing; failures preserve the inquiry and show an inline error. A 20-second timeout does not automatically retry.

**Accessibility:** question headings receive focus after explicit selections; progress is announced and completed answers are editable. Choices have large targets and visible keyboard focus. Motion honors reduced-motion preferences. Missing contact details or an invalid email show inline messages and red field outlines after a submit attempt, with focus on the first invalid field. Messages are linked to their fields and clear as corrected. Native required-field validation remains available without JavaScript.

**Analytics:** `BF.trackEvent('consultation_step', { step })` records stages 2 and 3 once per inquiry. `BF.trackLead('consultation_form', { client_type, services })` runs only after success and honors the shared consent layer. No name, email, phone, notes, or free-text deadline reaches analytics. The old required timeline question and its analytics parameter have been removed.

**Without JavaScript:** a short native form asks client type, service, and contact details and posts directly to Formspree. The enhanced view replaces this fallback only after initializing.

**Regression checks:** run `npm test` after installing development dependencies with `npm ci`. Tests exercise the actual homepage form and script in a DOM, with mocked network requests only. They cover every branch, changes of path, tax-year selection, validation, privacy-safe analytics, payloads, success/failure, pending submissions, and the native fallback.

## Recommended Workflow

For small content or design edits:

1. Edit the relevant HTML file.
2. Check the page locally or through GitHub Pages after deployment.
3. Verify nav, footer, mobile menu, forms, links, and responsive layout.
4. If URLs or major SEO fields changed, update `sitemap.xml` and request indexing in Google Search Console.

For global changes such as navigation, footer, business hours, phone number, email, or service labels, search the full repo and update every matching page.

## Future Maintenance

A future migration to a light static-site generator such as Jekyll may be useful if the site grows significantly or if frequent blog publishing becomes a priority. For now, the site remains intentionally simple and static.
