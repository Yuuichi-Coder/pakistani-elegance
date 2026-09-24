# Pakistani Elegance

Build a premium, fully responsive e-commerce website for a women's clothing brand (Pakistani lawn/embroidered suits), cloning the exact look, structure, and conversion mechanics described below — but as an original, production-grade build. This must NOT look like a generic AI-generated template: match the reference's spacing, editorial photography-led layout, and typographic hierarchy exactly, with genuine attention to detail.

Attached reference images (map each to its purpose below):

1. Full homepage screenshot (single tall image) — overall layout, color palette, spacing reference.

2. Hero background image — desktop.

3. Hero background image — mobile.

=== BRAND & DESIGN SYSTEM ===

- Extract the exact color palette from the attached full homepage screenshot and lock it as CSS variables / Tailwind config — do not approximate. Expected palette: a crimson/maroon-red for the announcement bar, sale ribbons, discount price text, and primary CTA buttons; near-black/charcoal for nav and body text; a warm gold/bronze for script/serif accent text (brand wordmark, collection kickers); white and a very light warm-gray for section backgrounds.

- Typography: an elegant serif or script display font for the brand name and hero overlay text, paired with a clean sans-serif for nav/body/prices. Set up a proper type scale (don't eyeball sizes).

- Use the attached desktop hero background image for the homepage hero banner on desktop, and the attached mobile hero background image for the mobile hero banner — use each provided image directly, do not crop or auto-generate a mobile variant yourself.

- 8px spacing grid, generous whitespace, consistent card radii and shadow treatment across all product cards.

=== SITE MAP (build every page, not just the homepage) ===

1. Home

2. Collection/category pages (New Arrivals, Eid Collection, Festive Wear, Luxury Lawn incl. Luxury Pret, Riwaayat, Sale incl. Flat % Off, Wedding Wears, Summer Collection) — one reusable collection template with filter/sort sidebar (price, color, size, fabric) and pagination

3. Product Detail Page (PDP)

4. Cart (drawer + full page)

5. Checkout (multi-step: shipping info → payment method → review)

6. Search results page

7. Wishlist page

8. Login / Create Account

9. Static policy pages: Privacy Policy, Refund Policy, Shipping Policy, Terms of Service, Contact Information (with a real contact form + embedded map placeholder)

10. About/Brand story page

=== HEADER ===

- Looping announcement bar (auto-scrolling ticker, red background) with 2–3 rotating messages (free delivery, flat sale %, WhatsApp order number as a tap-to-chat link).

- Logo centered, nav row below it: dropdowns for Luxury Lawn (→ Luxury Pret) and Sale (→ Flat % Off).

- Right-aligned: search icon (opens a flyout with live "popular products" suggestions), account/login icon, wishlist icon, cart icon with live item-count badge.

- Header becomes sticky and condenses (smaller logo, tighter padding) after ~80px scroll, with a smooth transition — not a hard jump.

- Mobile: hamburger drawer menu with nested accordion for dropdown categories.

=== HOMEPAGE (in this order) ===

1. Full-bleed hero banner using the attached desktop hero background image (and the attached mobile hero background image on small screens), gold serif overlay headline + subheadline, one primary CTA button ("Shop the Collection"), subtle parallax or fade-in on load.

2. Row of 5 circular category shortcuts under the hero (image + label), scroll-reveal animation staggered on entry.

3. "Flat X% Off" section: horizontally scrollable/carousel product grid with a live countdown timer bar above it ("Sale ends in HH:MM:SS") to add urgency beyond the reference site.

4. "New Arrivals" grid (4-column desktop / 2-column mobile) with a "View All" link.

5. Tabbed "Summer Collection" section with 3 filterable tabs (Riwaayat / Luxury Pret / Sale) that swap the grid content without a page reload.

6. Trust badge strip: Free Shipping (icon), Open Parcel – Check Before Payment (icon, important for Pakistani COD buyers), 7-Day Money Back Guarantee (icon).

7. Footer: brand blurb, WhatsApp + email contact, Collections link list, Legal link list (linking to the policy pages above), newsletter signup form (with a first-order discount incentive), social icons, payment method icons — Pakistani gateways only: JazzCash, Easypaisa, Bank Transfer, Visa/Mastercard processed via a local Pakistani payment gateway (e.g., Safepay or PayFast), and Cash on Delivery. Do NOT include Apple Pay, Bitcoin, or American Express anywhere on the site.

=== PRODUCT CARD (used on home + collections) ===

- Product image with a hover-triggered second image (outfit detail shot).

- "Sale" ribbon + strikethrough original price + discounted price + computed "% off" badge.

- Hover overlay with a "Quick View / Choose Options" button that opens a modal (image, price, color/size swatches, Add to Cart) without leaving the page.

- Wishlist heart icon top-right of the card.

=== PRODUCT DETAIL PAGE ===

- Image gallery: main image with zoom-on-hover, thumbnail strip / dot indicators, swipeable on mobile.

- Title, SKU, price (strikethrough original + discounted), color and size/variant swatches, quantity selector.

- Directly beneath the price/variant selectors, show two live social-proof lines:

  • "👀 {N} people are viewing this product right now" — N randomized between 4 and 9 on each page load/session.

  • "🔥 {N} sold in the last 24 hours" — N randomized between 3 and 7 on each page load/session.

  Both should feel alive (re-randomize subtly every 30–60s) but never jump wildly or look robotic.

- If stock is low, replace/augment with "Only X left in stock."

- Sticky "Add to Cart" + "Buy Now" bar that appears on mobile once the user scrolls past the main buttons.

- Trust badge mini-row (Free Shipping / Open Parcel / 7-Day Return) directly under the buttons.

- Accordions: Product Details, Fabric & Care, Size Guide, Shipping & Returns.

- Star rating + review count near the title; a reviews section further down with photos, verified-buyer tags, and a "write a review" CTA.

- "Complete the Look" cross-sell carousel and "You May Also Like" related-products carousel.

- "Recently Viewed" strip.

- Share icons + copy-link button.

=== CART / CHECKOUT / SEARCH / WISHLIST ===

- Slide-out cart drawer (updates live, shows subtotal, free-shipping progress bar, upsell suggestion) plus a full cart page.

- Multi-step checkout: shipping details → payment method → order review/confirmation, each step validated inline. Payment method step must offer ONLY Pakistani options: Cash on Delivery, JazzCash, Easypaisa, Bank Transfer, and card payment (Visa/Mastercard) processed through a local Pakistani payment gateway. No Apple Pay, Bitcoin, or American Express anywhere in the flow.

- Search flyout with live "popular products" + type-ahead results; dedicated search results page with filters.

- Wishlist page with "Move to Cart" per item.

=== FLOATING CONVERSION WIDGETS ===

1. WhatsApp button: fixed bottom-right (24px from edges), circular green icon, subtle pulse animation, links to https://wa.me/923064777251 on every page.

2. FAQ chatbot bubble: fixed bottom-right, positioned directly above the WhatsApp button (stacked, ~16px gap) so the two never overlap. On click, opens a chat panel pre-loaded with these Q&As (editable placeholders — expand with real brand specifics):

   - "Do you deliver all over Pakistan?" → Yes, free delivery nationwide, 3–5 business days.

   - "Can I check the parcel before paying?" → Yes, open-parcel/COD available — inspect before payment.

   - "What is your return/exchange policy?" → 7-day easy return on unused, tagged items.

   - "What payment methods do you accept?" → Cash on Delivery, JazzCash, Easypaisa, and card payments via our secure Pakistani payment gateway.

   - "How do I know my size?" → Link to the Size Guide accordion on each PDP.

   - "How can I track my order?" → Order confirmation + WhatsApp/SMS tracking link.

   - "Do you offer wholesale/bulk orders?" → Route to WhatsApp for bulk inquiries.

   - "How do I use a discount code?" → Enter it at checkout in the promo code field.

   - "Is the fabric pre-shrunk / how do I wash it?" → Point to Fabric & Care accordion.

   - "How do I talk to a real person?" → One-tap WhatsApp handoff button inside the chatbot.

3. FOMO social-proof popup — build from this written spec (no image reference provided for this one):

   - A compact, rounded-corner toast card: white background, soft drop shadow, roughly 320–380px wide on desktop (≈25% of viewport width), scaling to ~85–90% width on mobile.

   - Layout: a small square product thumbnail (~50–60px) on the left edge of the card; to its right, two lines of text — a bold line reading "Someone recently bought a [Product Name]" (truncate long titles with an ellipsis), and a smaller, lighter gray line below reading "{X} minutes ago, from {City}, PK" (X randomized between 2 and 45; City randomly picked from a short list of Pakistani cities — Lahore, Karachi, Islamabad, Hyderabad, Faisalabad, Multan, Rawalpindi, Peshawar).

   - A small "×" close icon in the top-right corner of the card; clicking it dismisses the popup and suppresses it for the rest of the session.

   - Fixed position: bottom-left, ~16–20px inset from the screen edges.

   - Animation: slides in from off-screen left to on-screen (translateX(-110%) → 0), holds for ~2–3 seconds, then slides back out to the left (0 → translateX(-110%)) and disappears. This full cycle repeats roughly every 7 seconds, cycling through a rotating list of randomized recent-purchase messages pulled from real product names/thumbnails in the catalog.

   - Must never overlap the chatbot/WhatsApp buttons or block navigation at any breakpoint.

4. A scroll-triggered (not immediate) newsletter/discount popup, firing once per session after ~40% scroll depth or 20s dwell, dismissible and remembered via local storage — do not stack this on top of the FOMO popup.

=== SEO / AEO / GEO / AIO REQUIREMENTS ===

- Semantic HTML5 throughout; one true H1 per page; logical heading hierarchy.

- Unique, keyword-rich meta titles/descriptions per page and per product (templated, not a generic placeholder).

- Open Graph + Twitter Card tags with real product images on every product/collection page.

- JSON-LD structured data: Organization + WebSite (with a SearchAction for sitelinks search box) sitewide; BreadcrumbList on every inner page; Product schema (name, image, price, priceCurrency PKR, availability, sku, brand, aggregateRating/review) on every PDP; ItemList/CollectionPage schema on collection pages; FAQPage schema mirroring the chatbot's Q&A verbatim so AI answer engines (Google AI Overviews, ChatGPT, Perplexity) can cite it directly — this is the core AEO/GEO move.

- Add a root-level llms.txt summarizing the brand, key pages, and policies in plain text for AI crawlers.

- robots.txt + auto-generated XML sitemap; canonical tags on every page to prevent duplicate-content issues from filtered collection URLs.

- Image optimization: WebP/AVIF with responsive srcset, explicit width/height to prevent layout shift, lazy-load everything below the fold, preload the hero image.

- Descriptive, keyword-rich alt text on every product image (not just the filename).

- ARIA labels on icon-only buttons, full keyboard navigation for menus/modals/drawers, sufficient color contrast (check the red-on-white and gold-on-white combinations meet WCAG AA).

- Optimize for mobile-first indexing and Core Web Vitals (minimize blocking JS, code-split routes).

=== DATA / BACKEND ===

- Use Supabase for products (with variants: color, size, stock, images array), collections/categories, orders + order_items, customers (Supabase Auth), reviews, wishlist_items, and newsletter_subscribers — don't hardcode product data in components.

- Cart state should persist across reloads (Supabase-backed or robust local storage fallback).

- Payment integration: build the checkout to plug into a Pakistani payment gateway (e.g., JazzCash, Easypaisa, Safepay, or PayFast) plus Cash on Delivery as an order-status flow — do not integrate or reference Stripe's Apple Pay, any crypto/Bitcoin processor, or American Express.

=== ANIMATION ===

- Use Framer Motion for page transitions, scroll-reveals, and modal/drawer transitions (native to the React stack, avoids conflicts).

- Use GSAP specifically for the choreographed FOMO popup slide-in/out sequence and any multi-step hero animation, since it needs precise timeline control.

- Animate only transform/opacity properties for performance; no layout-thrashing animations, especially on mobile.

- Do not mix more than these two animation libraries — pin exact versions for both to avoid dependency conflicts.

=== NON-NEGOTIABLE GUARDRAILS ===

- No Lorem ipsum or broken/dead links anywhere — use realistic Pakistani-market placeholder product names, prices in Rs., and copy.

- Payment methods shown anywhere on the site (footer icons, checkout, PDP trust badges) must be limited to: Cash on Delivery, JazzCash, Easypaisa, Bank Transfer, and Visa/Mastercard via a Pakistani gateway. Never render Apple Pay, Bitcoin, or American Express icons or copy.

- Verify every modal/drawer (cart, quick-view, login, back-in-stock, FAQ chatbot) actually opens and closes cleanly — this is a common failure point.

- Test the full site at 375px, 768px, and 1440px widths before considering any page done.

- Keep all three floating widgets (WhatsApp, chatbot, FOMO popup) visually and positionally non-overlapping at every breakpoint, including with any sticky mobile Add-to-Cart bar.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a12f52c8-c8c3-4353-bc27-d7f4a9e4e2f1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
