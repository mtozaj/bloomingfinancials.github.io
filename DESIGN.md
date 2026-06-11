# DESIGN.md

## Project

Blooming Financial is a static marketing website for a tax preparation, bookkeeping, payroll, tax planning, and business consulting firm serving individuals and small businesses across California.

The repository is the source of truth. Do not invent product names, slogans, services, locations, testimonials, claims, credentials, prices, or features that are not present in the site files.

The repository does not contain a frontend framework, design token file, CLI help text, schemas outside page-level JSON-LD, or a centralized design system. A high-level `README.md` documents the light tooling that does exist (a static Tailwind build and shared nav/footer partials). The website is built from plain HTML files with Tailwind CSS compiled to a static stylesheet, Open Sans from Google Fonts, Font Awesome icons, inline CSS, inline JavaScript, static SVG blog images, Formspree forms, and Google Analytics.

## Current site identity

Business name:
Blooming Financial

Main homepage title:
Blooming Financial | Bookkeeping, Tax & Payroll Services in California – Bay Area, Los Angeles, San Diego & Beyond

Current homepage meta description:
Professional bookkeeping, tax preparation, payroll, and consulting services for individuals and small businesses across California. Serving Cupertino, San Jose, San Francisco, Los Angeles, San Diego, Sacramento, and statewide with personalized financial care.

Hero pattern:
The homepage hero pairs a service-led headline with a single descriptive subline and two CTAs — a primary booking CTA and a secondary link to the services hub — followed by a strip of trust indicators (credentials, area served, review proof, security note). Use the homepage HTML as the source of truth for exact wording. Do not invent additional CTAs, credentials, or claims. See the Tone section for preferred CTA language.

Contact information:
- Phone: (408) 365-4671
- Email: info@bloomingfinancials.com
- Hours: Mon-Fri 8am-7pm, Sat 8am-4pm, Sun closed

Social and external links:
- Instagram: @bloomingfinancial
- Yelp: Blooming Financial Cupertino listing
- Client Portal: https://portal.bloomingfinancials.com

## Site structure

The site uses clean static URLs and directory-style service pages.

Core pages:
- /
- /services/
- /services/individual-tax-preparation/
- /services/business-tax-preparation/
- /services/tax-planning/
- /services/bookkeeping/
- /services/payroll/
- /services/irs-ftb-notice-support/
- /services/business-consulting/
- /blogs/
- /privacy/
- /terms/

Blog posts:
- /blogs/startup-tax-deductions.html
- /blogs/payroll-compliance-checklist-california.html
- /blogs/top-tax-credits-california-families.html
- /blogs/llc-s-corp-c-corp-california.html
- /blogs/w4-de4-withholding-guide-california.html
- /blogs/rsus-stock-sales-explained.html
- /blogs/2025-tax-law-changes.html

## Native content shape

The website is a service catalog supported by educational resources. Design around this shape:

1. Brand and trust
2. Core services
3. Who the firm helps
4. Process and next steps
5. Reviews and proof
6. Consultation and contact
7. Blog resources as supporting content

Do not organize the page as a generic SaaS landing page. This is a professional services website where the user needs to quickly understand what Blooming Financial does, whether their tax or bookkeeping situation fits, and how to book a consultation.

## Services

Use these exact service names unless the page source uses a longer page title:

- Individual Tax Preparation
- Business Tax Preparation
- Tax Planning
- Bookkeeping
- Payroll
- IRS & FTB Notice Support
- Business Consulting

Homepage service card pattern:
The homepage surfaces a subset of the seven services as cards, each with an icon, the canonical service name as the H3, a one-sentence description, three to four short bullets, and a "Learn more →" link to the matching `/services/<slug>/` detail page. The homepage HTML is the source of truth for which cards currently appear, their order, and their copy.

The full navigation and sitemap include all seven services. If designing a service overview, show all seven services, not only the homepage cards. Tax Planning and IRS & FTB Notice Support remain accessible through the Services nav dropdown, the footer, and `/services/`.

## About content

The About section establishes founding context, the firm's California service area with roots in local communities, an owner quote about the firm's approach to client relationships, and a supporting value statement. Use the homepage HTML as the source of truth for the exact copy. Do not invent founding dates, team member names, offices beyond what is already referenced on the site, or values that are not already present.

## Testimonials

The homepage carries real reviews from Yelp and Google with verbatim quotes, name, role or location, and source attribution shown inline next to the reviewer (with the Yelp or Google brand icon). Treat the homepage HTML as the source of truth for which testimonials currently appear, their order, and their attribution. Do not invent client names, quotes, locations, or attributions — see the "Do not invent" section. When adding new approved reviews, include source attribution so visitors can tell which platform the review came from.

## Consultation content

The consultation section pairs a short "ready to get started" headline with one explanatory line about the free 30-minute consultation, a small set of value points (no obligation, personalized recommendations, clear pricing), and the consultation form. Use the homepage HTML as the source of truth for exact copy. Use the existing consultation form fields and client-type logic if showing forms. Do not invent extra form fields unless explicitly requested.

## Blog/resource themes

The blog supports the main services. Do not let blog content dominate the homepage. Use it as credibility and education.

Current blog topics:
- Startup tax deductions
- California payroll compliance
- California family tax credits
- LLC vs S Corp vs C Corp in California
- W-4 and California DE 4 withholding
- RSUs and stock sales
- 2025 tax law changes

## Visual identity

Use the visual language already in the site.

Typography:
- Font family: Open Sans
- Body text: regular weight
- Headings: bold, usually 700
- Navigation: medium to semibold

Primary colors:
- Dark blue: #1e3a8a
- Bright blue: #3b82f6
- CTA blue: Tailwind blue-600
- CTA hover blue: Tailwind blue-700
- White: #ffffff
- Light gray background: Tailwind gray-50 or gray-100
- Body text: Tailwind gray-600 and gray-700
- Footer background: Tailwind blue-950

Gradient:
- Hero gradient: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)

Icon system:
- Font Awesome icons
- Common icons in current site include user, briefcase, calculator, money-check-alt, chart-line, check, id-badge, file-signature, map-marker-alt, star, lock, phone, envelope, clock, Instagram, Yelp

Layout patterns:
- Sticky white top navigation
- Container-based layout with horizontal padding
- Large vertical section padding
- Alternating white and light-gray sections
- Rounded white cards with soft shadows
- Blue icon accents
- Blue CTA buttons with rounded corners
- White CTA buttons on blue gradient backgrounds
- Testimonial cards with a blue left border
- Footer with dark blue background and four-column link layout

Spacing and sizing patterns:
- Section padding commonly uses py-20 or py-16
- Container class: container mx-auto px-6
- Hero headline: text-4xl md:text-5xl font-bold
- Section heading: text-3xl md:text-4xl font-bold text-blue-900
- Body text: text-gray-600 or text-gray-700
- Service cards: rounded-lg shadow-md p-8
- Buttons: px-4 or px-6, py-2 or py-3, rounded-md

## Navigation behavior

Desktop navigation:
- Home
- Services dropdown
- About
- Testimonials
- Contact
- Blogs
- Client Portal
- Free Consultation

Services dropdown contains:
- All Services
- Individual Tax Preparation
- Business Tax Preparation
- Tax Planning
- Bookkeeping
- Payroll
- IRS & FTB Notice Support
- Business Consulting

Mobile navigation:
- Hamburger menu opens a dropdown panel below the navbar
- Services expands as an accordion
- Mobile menu should close after link tap
- Background scroll should be locked when mobile menu is open
- Services accordion should reset when the mobile menu closes

## SEO and structured data requirements

Preserve current SEO intent.

Every page should keep:
- Unique title
- Meta description
- Canonical URL
- Open Graph title, description, URL, and site name where present
- Existing JSON-LD intent
- Same clean URL path

The homepage uses AccountingService schema with:
- name: Blooming Financial
- url: https://www.bloomingfinancials.com/
- telephone: +1-408-365-4671
- email: info@bloomingfinancials.com
- areaServed: California
- sameAs links for Instagram, Yelp, and Google Maps

Service pages use Service schema, BreadcrumbList schema, and FAQPage schema. Preserve that pattern.

Do not change canonical URLs, service URLs, blog URLs, or sitemap paths in visual redesigns.

## Design priorities

When designing a homepage, prioritize in this order:

1. Clear brand identity and service category
2. Consultation CTA
3. Trust indicators
4. Full service catalog with direct links
5. About and service area
6. Process and pricing clarity
7. Reviews
8. Contact
9. Blog/resources

The main business goal is lead generation for tax preparation, bookkeeping, payroll, and consulting. Designs should make it easy to book a consultation, call, or understand which service page applies.

## Do not invent

Do not invent:
- New credentials
- New licenses
- CPA, EA, attorney, or financial-advisor claims
- Prices
- Guarantees
- Awards
- Team member names
- Office addresses beyond Cupertino, California references already used
- Client names or testimonials
- Case studies
- Software partnerships
- Any service not present in the repo

Do not use placeholder copy like lorem ipsum. If real copy is missing, leave the section out.

## Tone

Use clear, professional, plain-language copy. The tone should feel calm, practical, and trustworthy. Avoid hype, aggressive sales language, and generic startup/SaaS phrasing.

Preferred language patterns:
- “Book Free Consultation”
- “View all services”
- “Learn more”
- “Professional bookkeeping, tax preparation, payroll, and consulting services”
- “Individuals and small businesses across California”
- “Clear pricing information”
- “Secure & Confidential”

## Accessibility and UX

Keep designs readable and practical.

- Use strong contrast for text and CTA buttons
- Keep navigation labels short and real
- Use descriptive link text
- Keep mobile service navigation easy to open and close
- Do not overload the hero with too many buttons
- Keep phone, email, and consultation CTA easy to find
- Use alt text for meaningful images
- Avoid carousels for core service content

## Implementation notes

The current site is static HTML. A design should be implementable without React, Next, or a large frontend framework. Prefer HTML, Tailwind utility classes, small inline or external JavaScript, and reusable patterns that match the current files.

Tailwind is compiled to a committed static stylesheet (`assets/tailwind.css`); rebuild it after class changes (see README). The nav, mobile menu, and footer on full-nav pages are stamped from `_partials/` by `tools/build.py` — edit the partial, not the page copies.

If the site later migrates to Jekyll or another static-site generator, preserve the same visual identity, URLs, metadata, schema patterns, and service hierarchy.
