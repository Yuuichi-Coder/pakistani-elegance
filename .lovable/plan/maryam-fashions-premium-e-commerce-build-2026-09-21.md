# Maryam Fashions premium e-commerce build

## Goal
Build a production-grade, mobile-first Pakistani women’s fashion store using the supplied homepage as a structural reference and the supplied desktop/mobile hero artwork directly. The finished experience will include the complete catalog, shopping, account, policy, conversion, accessibility, and search-discovery flows requested.

## Visual system and assets
- Extract the crimson, charcoal, bronze-gold, white, and warm-gray values from the reference artwork into semantic design tokens; validate all text/background combinations for WCAG AA.
- Establish an 8px spacing rhythm, compact editorial product cards, consistent subtle shadows/radii, and a measured serif/script plus clean sans-serif type scale.
- Use the supplied desktop and mobile hero files as separate responsive sources without recropping them; upload both through the project asset pipeline and preload only the matching first-view image.
- Generate a cohesive, original catalog photo set for Pakistani lawn and embroidered suits, including front and detail views plus category imagery. Use optimized dimensions, explicit aspect ratios, descriptive alt text, and lazy loading below the first view.
- Use Motion for route/reveal/dialog transitions and GSAP only for the timed FOMO sequence and coordinated hero motion, with reduced-motion support.

## Store data and accounts
- Enable Lovable Cloud and create normalized tables for collections, products, product images, variants, orders, order items, reviews, wishlists, newsletter subscribers, and contact submissions.
- Use account authentication without a separate profile table, as requested. Shipping/customer details remain order-specific; wishlist rows link directly to authenticated users.
- Add strict row-level access rules, explicit data grants, validation constraints, stock/order safeguards, and server-side validation for every write.
- Seed the database migration with realistic Maryam Fashions collections, products, variants, prices in PKR, stock, ratings, reviews, and image references so the first rendered store is complete rather than empty.
- Keep guest cart state reliably across reloads, reconcile it after sign-in, and persist authenticated wishlists and completed orders in Cloud.

## Shared storefront shell
- Build the looping crimson announcement ticker with free delivery, sale, and tap-to-WhatsApp messages.
- Add centered branding, full desktop navigation with Luxury Lawn and Sale dropdowns, live search flyout, account, wishlist, and cart controls.
- Add the smoothly condensed sticky header after approximately 80px and a keyboard-accessible mobile drawer with nested category accordions.
- Create a shared footer with brand/contact information, routed collection/legal links, newsletter signup, social links, and only COD, JazzCash, Easypaisa, bank transfer, Visa, and Mastercard/local-gateway payment marks.
- Add globally coordinated WhatsApp, FAQ chat, FOMO, and newsletter widgets with breakpoint-aware safe zones so they never collide with each other or the mobile purchase bar.

## Pages and routes
- **Home:** responsive full-bleed hero, five circular categories, countdown sale carousel, New Arrivals grid, tabbed Summer Collection, and trust strip in the requested order.
- **Collections:** one reusable data-driven template for New Arrivals, Eid Collection, Festive Wear, Luxury Lawn, Luxury Pret, Riwaayat, Sale, Flat % Off, Wedding Wears, and Summer Collection; include filter drawer/sidebar, URL-backed price/color/size/fabric filters, sorting, clear states, and pagination.
- **Product detail:** zoomable/swipeable gallery, variants, quantity, stable live viewer/sold counters, low-stock messaging, add/buy actions, mobile sticky purchase bar, accordions, trust row, reviews with verified labels/photos, share/copy actions, Complete the Look, related products, and Recently Viewed.
- **Shopping:** accessible quick-view modal, live cart drawer, full cart page, free-shipping progress, upsell, promo input, and clear empty/loading/error states.
- **Checkout:** validated shipping → payment → review/confirmation flow. COD will create a real order. JazzCash, Easypaisa, bank transfer, and local Visa/Mastercard options will have secure server-side handoff boundaries and honest “configuration required” states until merchant credentials are supplied; no unsupported payment brands will appear.
- **Discovery/account:** type-ahead search plus results filters, wishlist with Move to Cart, sign in/create account, email confirmation state, forgot-password flow, and required public reset-password page.
- **Content:** About, Privacy, Refund, Shipping, Terms, Contact Information, and a real validated contact form with an embedded-map placeholder. All header/footer links will resolve.

## Conversion interactions
- Product cards will support second-image hover, sale ribbon, calculated savings, price treatment, wishlist, and functional quick view with variant selection and add-to-cart.
- FAQ chat will contain the supplied answers verbatim and provide size-guide navigation and one-tap WhatsApp handoff.
- FOMO messages will rotate through actual seeded products and Pakistani cities, animate on a GSAP timeline, truncate safely, dismiss for the session, and pause while larger overlays are open.
- Newsletter incentive will trigger once after 40% scroll or 20 seconds, persist dismissal locally, and never stack over FOMO.
- All drawers, dialogs, menus, accordions, and flyouts will support focus management, Escape, outside-click behavior, and clean open/close transitions.

## Search, social, and AI discoverability
- Give every route a unique title, description, Open Graph/Twitter metadata, self-referencing canonical URL, one H1, and logical semantic headings.
- Generate collection ItemList/CollectionPage, product, aggregate-rating, review, breadcrumb, Organization, WebSite/SearchAction, and FAQ structured data from the same source data shown on screen.
- Add `llms.txt`, crawler-friendly robots rules, and an automatic sitemap covering all public static, collection, and product URLs without treating filtered URLs as separate canonical pages.
- Use the real displayed collection/product imagery for share metadata where an absolute production asset URL is available.

## Technical approach
- Organize the TanStack Start app into shared storefront, product, overlay, form, and structured-data modules with separate route files for every requested page.
- Use server functions for catalog/account/order/contact/newsletter operations; keep secrets server-side and validate payloads with schemas in both browser and server paths.
- Use query-backed route loading for public catalog pages, client-side protected calls for account data, and route-level loading/error/not-found states.
- Pin exact Motion and GSAP versions and limit animation to transforms and opacity.

## Verification
- Validate the complete buyer journey: browse/filter → quick view → variant selection → cart → COD checkout → confirmation, plus account, wishlist, search, newsletter, contact, password recovery, and every overlay close path.
- Test desktop navigation and all key flows at 375px, 768px, and 1440px; confirm image framing, keyboard operation, focus visibility, no clipped text, and no floating-widget collisions.
- Check current preview build/runtime signals, structured metadata, schema output, canonical behavior, responsive image loading, and all supported payment labels before completion.

## Delivery boundary
The build will make COD operational and prepare the other requested Pakistani methods for secure merchant configuration. Live JazzCash, Easypaisa, bank-transfer automation, or local card capture cannot be activated until the corresponding merchant/gateway credentials and provider requirements are supplied.
