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

The homepage consultation form (`#consultationForm` in `index.html`) is a three-step questionnaire run by `assets/intake.js`:

1. **What can we help with?** Who the visitor is and which services they need (both required).
2. **A few quick details.** Follow-up questions that match the step 1 answers, plus the required timeline.
3. **How can we reach you?** Name, email, and phone (required), then optional best time, notes, and how they heard about us.

Most answers are tap-to-select chips: a real radio button or checkbox inside `<label class="intake-option">`, styled by the `.intake-chip` component in `tailwind.input.css`.

**Editing questions.** All wording lives in `index.html`, so most edits need no JavaScript:

- Each question is a `<fieldset data-field="..." data-label="...">`. `data-label` is the label the firm sees in the Formspree email and the column name in Formspree's CSV export, so keep it short and stable.
- `data-required` makes a question required before moving on.
- `data-show-if` shows a question or section only after a matching earlier answer, for example `services:bookkeeping` or `client_type:business,both|services:tax_business`. Commas list accepted values and `|` means "or". Hidden questions are neither validated nor sent.
- To add a choice, copy an existing chip `<label>` and change its `value` and text.
- Tax-year chips carry `data-year-offset`. The script relabels them from today's date: the current year from October, otherwise last year, plus the two years before it.
- If you add or rename a service, also update the name lists at the top of `assets/intake.js`. They build the email summary and subject line.
- Rebuild Tailwind after using new classes.

**What the firm receives.** Each inquiry has a subject line for triage, such as `New consultation: Bookkeeping + Payroll (business), ASAP`. It starts with `URGENT notice:` when an IRS or FTB letter is due within 2 weeks or already past due. The email opens with a one-line `Summary`, followed by name, email, and phone, then each answered question under its `data-label`.

**Analytics.** Through `assets/consent.js` (so privacy choices apply), the form sends the GA4 event `consultation_step` (step 2 or 3, once per inquiry) and `generate_lead` with `lead_source`, `client_type`, `services`, and `timeline`. None of these contain personal data. To see the extra parameters in GA reports, register them as event-scoped custom dimensions in GA Admin.

**Without JavaScript**, every question shows on one page and the form posts straight to Formspree.

## Recommended Workflow

For small content or design edits:

1. Edit the relevant HTML file.
2. Check the page locally or through GitHub Pages after deployment.
3. Verify nav, footer, mobile menu, forms, links, and responsive layout.
4. If URLs or major SEO fields changed, update `sitemap.xml` and request indexing in Google Search Console.

For global changes such as navigation, footer, business hours, phone number, email, or service labels, search the full repo and update every matching page.

## Future Maintenance

A future migration to a light static-site generator such as Jekyll may be useful if the site grows significantly or if frequent blog publishing becomes a priority. For now, the site remains intentionally simple and static.
