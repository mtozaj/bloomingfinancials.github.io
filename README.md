# Blooming Financial Website

Static website for Blooming Financial, a tax preparation, bookkeeping, payroll, tax planning, and business consulting firm serving individuals and small businesses.

Live site: https://www.bloomingfinancials.com/

## Stack

This is a static GitHub Pages website built with plain HTML, Tailwind CSS from CDN, Open Sans, Font Awesome, static image assets, and small inline JavaScript.

There is currently no React, Next.js, Jekyll, package.json, or custom build process. Pages are edited directly as HTML files.

## Important Files and Folders

- `index.html` - homepage, main navigation, hero section, trust indicators, service cards, about section, testimonials, consultation form, contact form, footer, and shared homepage scripts.
- `services/` - services hub and individual service detail pages.
- `blogs/` - blog index, blog article pages, and blog image assets.
- `privacy/` - privacy policy page.
- `terms/` - terms of service page.
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

This site is currently manual HTML. Navigation, footer, styles, scripts, and schema patterns are repeated across multiple files. When making global changes, update every affected page and verify consistency.

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

- Google Analytics
- Formspree forms
- Tailwind CSS CDN
- Google Fonts
- Font Awesome CDN
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
