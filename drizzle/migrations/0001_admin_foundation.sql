CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active', ADD COLUMN IF NOT EXISTS meta_title text, ADD COLUMN IF NOT EXISTS meta_description text, ADD COLUMN IF NOT EXISTS canonical_url text, ADD COLUMN IF NOT EXISTS og_image_url text;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS meta_title text, ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text, ADD COLUMN IF NOT EXISTS courier text, ADD COLUMN IF NOT EXISTS discount_code text, ADD COLUMN IF NOT EXISTS discount integer NOT NULL DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS store_reply text, ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.product_variants, public.collections, public.product_collections, public.orders, public.order_items, public.reviews, public.newsletter_subscribers, public.contact_submissions, public.wishlist_items TO authenticated;

CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage product collections" ON public.product_collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage contacts" ON public.contact_submissions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins read wishlists" ON public.wishlist_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.product_images (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, url text NOT NULL, alt text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0, is_primary boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.order_status_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, status text NOT NULL, note text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.discount_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, kind text NOT NULL DEFAULT 'percent', value integer NOT NULL, min_order integer NOT NULL DEFAULT 0, usage_limit integer, used_count integer NOT NULL DEFAULT 0, expires_at timestamptz, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.redirects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), from_path text NOT NULL UNIQUE, to_path text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.site_settings (key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.content_pages (slug text PRIMARY KEY, title text NOT NULL, body text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.faqs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), question text NOT NULL, answer text NOT NULL, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.seo_meta (path text PRIMARY KEY, title text, description text, og_image_url text, updated_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT ON public.product_images, public.redirects, public.site_settings, public.content_pages, public.faqs, public.seo_meta TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images, public.order_status_history, public.discount_codes, public.redirects, public.site_settings, public.content_pages, public.faqs, public.seo_meta TO authenticated;
GRANT ALL ON public.product_images, public.order_status_history, public.discount_codes, public.redirects, public.site_settings, public.content_pages, public.faqs, public.seo_meta TO service_role;

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read redirects" ON public.redirects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read content" ON public.content_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read seo" ON public.seo_meta FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage history" ON public.order_status_history FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage discounts" ON public.discount_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage redirects" ON public.redirects FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage content" ON public.content_pages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage seo" ON public.seo_meta FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.content_pages (slug,title) VALUES ('privacy-policy','Privacy Policy'),('refund-policy','Refund Policy'),('shipping-policy','Shipping Policy'),('terms','Terms of Service'),('about','About'),('contact','Contact Information') ON CONFLICT DO NOTHING;
INSERT INTO public.site_settings (key,value) VALUES ('store', '{"name":"Maryam Fashions","whatsapp":"923064777251","announcement":"Free delivery across Pakistan","logo_url":"","social":{"instagram":"","facebook":"","tiktok":""},"footer_links":[]}'::jsonb), ('payments','{"cod":true,"jazzcash":true,"easypaisa":true,"bank_transfer":true,"local_card":true}'::jsonb), ('seo','{"title_template":"%s — Maryam Fashions","default_description":"Premium Pakistani womenswear.","og_image":"","robots":"User-agent: *\nAllow: /\nDisallow: /admin"}'::jsonb) ON CONFLICT DO NOTHING;