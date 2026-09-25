# Maryam Fashions Admin Dashboard

A private admin area at `/admin` connected to the live store data. It's large, so it ships in phases. Each phase is tested at 768px and 1440px before the next one starts.

## Phase 1: Access and foundation
- Admin sign-in page at `/admin/login` (email and password only, no sign-up).
- One admin account: `maryamfashions@admin.local` with the password you gave. You should change it after the first login.
- Admin role is stored separately and checked by the database on every admin read and write.
- Sidebar layout: full labels at 1024px and wider, a drawer below that. Includes a logout button.
- Visual style: warm-neutral surfaces, crimson accents, Manrope, compact tables. No generic template look.

## Phase 2: Overview, Products, Collections
- Overview: stat cards for today's orders, pending orders, revenue this month, low stock, new messages and new subscribers. Also the last 10 orders and a revenue chart.
- Products: full create/edit/delete, variants with stock, multi-image upload with drag-to-reorder and "set primary", SEO fields with a live character count and SERP preview, bulk price/stock/status/archive, and low-stock badges.
- Collections: create/edit/delete, assign products, banner image, navigation order, SEO fields.

## Phase 3: Orders, Customers, Reviews, Discounts
- Orders: filters, detail view, status history, courier and tracking number, printable invoice.
- Customers: order count, lifetime value, order history and wishlist.
- Reviews: approve, reject, delete, feature, reply as the store.
- Discount codes: percent or fixed amount, expiry date, usage limit, minimum order. Checkout will validate codes.

## Phase 4: Inbox, Content, SEO, Settings
- Newsletter list with CSV export. Contact inbox with read/replied status and search.
- Rich-text editor for the policy, About and Contact pages. The storefront pages will read this text.
- FAQ editor as the single source for both the FAQ widget and its search-engine data.
- SEO Center: default templates, default share image, robots.txt editor, sitemap regenerate, 301 redirects (applied on the live site), SERP preview, and a panel showing structured data per page type.
- Site settings: store name, logo, WhatsApp number, announcement bar, footer and social links, and payment toggles limited to COD, JazzCash, Easypaisa, Bank Transfer and local card.

## Technical details
- New tables: `user_roles` + `has_role()`, `product_images`, `order_status_history`, `discount_codes`, `redirects`, `site_settings` (key/jsonb), `seo_meta`, `content_pages`, `faqs`. Each has grants and RLS.
- Admin-only columns added to existing tables without breaking anything: order tracking/courier, `reviews.is_featured`/`store_reply`, `contact_submissions.status`, and product `status`/meta fields.
- Existing storefront policies stay as they are. Admin policies (`has_role(auth.uid(),'admin')`) are added alongside them.
- Every write goes through `createServerFn` with `requireSupabaseAuth` plus zod validation and an admin role check. The service-role key is never used in the browser.
- Admin UI lives under `_authenticated/admin/*`. A role gate sends non-admins to `/admin/login`.
- A storage bucket holds product, collection and logo images.
- The admin user is seeded once through the server-side auth admin API.
