# DESIGN.md

## Project

Blooming Financial is a static marketing website for a tax preparation, bookkeeping, payroll, tax planning, and business consulting firm serving individuals and small businesses across California.

The repository is the source of truth. Do not invent product names, slogans, services, locations, testimonials, claims, credentials, prices, or features that are not present in the site files.

The repository currently does not contain a README, package.json, framework configuration, design token file, CLI help text, schemas outside page-level JSON-LD, or a centralized design system. The website is built from plain HTML files with Tailwind CSS via CDN, Open Sans from Google Fonts, Font Awesome icons, inline CSS, inline JavaScript, static SVG blog images, Formspree forms, and Google Analytics.

## Current site identity

Business name:
Blooming Financial

Main homepage title:
Blooming Financial | Bookkeeping, Tax & Payroll Services in California – Bay Area, Los Angeles, San Diego & Beyond

Current homepage meta description:
Professional bookkeeping, tax preparation, payroll, and consulting services for individuals and small businesses across California. Serving Cupertino, San Jose, San Francisco, Los Angeles, San Diego, Sacramento, and statewide with personalized financial care.

Current homepage hero headline:
Financial Services That Help Your Business Grow and Your Finances Flourish

Current homepage hero subtext:
Professional bookkeeping, tax preparation, payroll, and consulting services tailored for individuals and small businesses in California.

Primary CTA text:
Book Free Consultation

Secondary CTA text:
Our Services

Trust indicators:
- CTEC Registered Tax Preparer
- IRS Authorized E-File Provider
- Serving California
- 5-Star Reviews
- Secure & Confidential

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

Homepage service card content currently includes:

Individual Tax Preparation:
Federal and California returns for W-2 employees, self-employed, RSU and stock sales, rentals, multi-state, prior-year, and amended returns.
- Federal & California filings
- RSU & stock sale reporting
- Multi-state & part-year
- Prior-year & amended returns

Business Tax Preparation:
Schedule C, LLCs, partnerships, S corporations, and California small-business filings, coordinated with your individual return.
- Schedule C, LLC, S-Corp
- Partnership returns
- California LLC tax & fee guidance
- Coordinated with individual return

Bookkeeping:
Accurate financial records to keep your business or personal finances compliant and informed.
- Data entry & reconciliation
- Financial reporting
- Tax preparation support
- Accounts payable/receivable

Payroll Services:
Reliable payroll processing so you can focus on your business.
- Monthly payroll processing
- Contractor payments
- Tax filings & compliance
- Direct deposit setup

Business Consulting:
Strategic guidance to help your business thrive.
- Budgeting & cash flow analysis
- Financial strategy development
- Systems setup & optimization
- Business growth planning

The full navigation and sitemap also include Tax Planning and IRS & FTB Notice Support. If designing a service overview, show all seven services, not only the five homepage cards.

## About content

Use the real homepage about content as the source of truth.

Blooming Financial was founded in 2024. It provides personalized financial services to individuals and small businesses across California. The firm serves clients throughout California, with roots in local communities including Cupertino, the Bay Area, Los Angeles, San Diego, Sacramento, and beyond.

Existing quote:
“We don't just crunch numbers - we build relationships and help our clients understand their financial position to make informed financial decisions.”

Existing supporting value:
Affordable Pricing
Customized packages to fit your budget

## Testimonials

Use only these testimonials unless new approved testimonials are added to the repo.

준혁:
“Great customer services, nice people who are working there, fast and accurate works. People were very thoughtful and smart.”
Individual Client, Santa Clara

Sahara T.:
“I LOVE THIS BOOKEEPER! So grateful I found them. It was on a whim as my last bookkeeper retired. I was very worried I wouldn't find the same quality... but not only did I find quality, they are exceptional. They're not just great at what they do....they're genuinely kind, patient, and very easy to work with. I felt supported, never judged, and they make something stressful (bookkeeping!) feel simple and manageable.”
Business Owner, San Diego

John B.:
“Moving my business across California was overwhelming, but Blooming Financial made it so much easier! They were super helpful, always quick to respond, and walked me through everything. I'm really grateful for their support! 10/10 would recommend!”
Restaurant Owner, La Mesa

## Consultation content

Current consultation section headline:
Ready to Get Started?

Current consultation text:
Schedule your free 30-minute consultation to discuss your financial needs and how we can help.

Current consultation value points:
- No obligation, no pressure
- Personalized recommendations
- Clear pricing information

Use the existing consultation form fields and client-type logic if showing forms. Do not invent extra form fields unless explicitly requested.

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

If the site later migrates to Jekyll or another static-site generator, preserve the same visual identity, URLs, metadata, schema patterns, and service hierarchy.
