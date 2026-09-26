import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const s = (max = 200) => z.string().trim().max(max);
const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, dashes");
const int = z.number().int().min(0).max(100_000_000);
const opt = (x: z.ZodTypeAny) => x.nullable().optional();

const schemas = {
  products: z.object({
    name: s(120).min(2), slug, sku: s(60).min(1), description: s(5000), details: s(5000).optional(), fabric_care: s(3000).optional(),
    fabric: s(60).min(1), color: s(60).min(1), price: int, compare_at_price: opt(int),
    status: z.enum(["active", "draft", "out_of_stock", "archived"]), is_active: z.boolean(), is_featured: z.boolean(), is_new: z.boolean().optional(),
    image_url: s(1000), hover_image_url: s(1000),
    meta_title: opt(s(70)), meta_description: opt(s(170)), canonical_url: opt(s(500)), og_image_url: opt(s(1000)),
  }),
  product_variants: z.object({ product_id: z.string().uuid(), color: s(50).min(1), size: z.enum(["XS", "S", "M", "L", "XL"]), stock: int, sku: s(80).min(1) }),
  product_images: z.object({ product_id: z.string().uuid(), url: s(1000).min(1), alt: s(200), sort_order: int, is_primary: z.boolean() }),
  collections: z.object({ slug, name: s(80).min(2), description: s(1000), image_url: opt(s(1000)), sort_order: int, is_featured: z.boolean(), meta_title: opt(s(70)), meta_description: opt(s(170)) }),
  product_collections: z.object({ product_id: z.string().uuid(), collection_id: z.string().uuid() }),
  orders: z.object({ status: z.enum(["placed", "pending", "processing", "shipped", "delivered", "cancelled"]), payment_status: z.enum(["pending", "paid", "refunded", "failed"]), tracking_number: opt(s(80)), courier: opt(s(80)) }),
  order_status_history: z.object({ order_id: z.string().uuid(), status: s(40).min(1), note: opt(s(500)) }),
  reviews: z.object({ is_approved: z.boolean(), is_featured: z.boolean(), store_reply: opt(s(2000)), status: z.enum(["pending", "approved", "rejected"]) }),
  discount_codes: z.object({ code: z.string().trim().toUpperCase().min(3).max(30).regex(/^[A-Z0-9_-]+$/), kind: z.enum(["percent", "fixed"]), value: z.number().int().min(1).max(1_000_000), min_order: int, usage_limit: opt(z.number().int().min(1)), expires_at: opt(z.string().datetime()), is_active: z.boolean() }),
  redirects: z.object({ from_path: z.string().trim().regex(/^\/[^\s]*$/).max(300), to_path: z.string().trim().regex(/^(\/|https:\/\/)[^\s]*$/).max(500) }),
  site_settings: z.object({ key: z.enum(["store", "payments", "seo", "sitemap"]), value: z.record(z.string(), z.any()) }),
  content_pages: z.object({ slug: s(60).min(1), title: s(120).min(1), body: s(100_000) }),
  faqs: z.object({ question: s(300).min(3), answer: s(3000).min(1), sort_order: int }),
  contact_submissions: z.object({ status: z.enum(["new", "read", "replied"]) }),
  newsletter_subscribers: z.object({ email: z.string().email() }),
} as const;

type Table = keyof typeof schemas;
const keyCol: Partial<Record<Table, string>> = { site_settings: "key", content_pages: "slug" };
const noInsert: Table[] = ["orders", "reviews", "contact_submissions", "newsletter_subscribers"];

const input = z.object({
  table: z.enum(Object.keys(schemas) as [Table, ...Table[]]),
  op: z.enum(["insert", "update", "delete", "upsert"]),
  ids: z.array(z.string().max(200)).max(500).optional(),
  match: z.record(z.string(), z.string()).optional(),
  values: z.any().optional(),
});

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden: admin access required");
}

export const adminMutate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => input.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = context.supabase as any;
    const schema = schemas[data.table] as z.ZodObject<any>;
    const key = keyCol[data.table] ?? "id";
    let q: any;
    if (data.op === "insert" || data.op === "upsert") {
      if (noInsert.includes(data.table)) throw new Error("Not allowed");
      const rows = (Array.isArray(data.values) ? data.values : [data.values]).map((r: unknown) => schema.parse(r));
      q = data.op === "insert" ? db.from(data.table).insert(rows) : db.from(data.table).upsert(rows);
    } else if (data.op === "update") {
      const vals = schema.partial().parse(data.values ?? {});
      if (!data.ids?.length) throw new Error("No rows selected");
      q = db.from(data.table).update({ ...vals, ...(data.table === "products" ? { updated_at: new Date().toISOString() } : {}) }).in(key, data.ids);
    } else {
      if (data.match) {
        const m = schema.partial().parse(data.match);
        q = db.from(data.table).delete().match(m);
      } else {
        if (!data.ids?.length) throw new Error("No rows selected");
        q = db.from(data.table).delete().in(key, data.ids);
      }
    }
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bulkAdjustPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ ids: z.array(z.string().uuid()).min(1).max(500), percent: z.number().min(-90).max(500) }).parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = context.supabase as any;
    const { data: rows, error } = await db.from("products").select("id,price").in("id", data.ids);
    if (error) throw new Error(error.message);
    for (const r of rows as { id: string; price: number }[]) {
      const price = Math.max(1, Math.round((r.price * (100 + data.percent)) / 100));
      const { error: e } = await db.from("products").update({ price, updated_at: new Date().toISOString() }).eq("id", r.id);
      if (e) throw new Error(e.message);
    }
    return { ok: true };
  });

export const bulkSetStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ ids: z.array(z.string().uuid()).min(1).max(500), stock: int }).parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await (context.supabase as any).from("product_variants").update({ stock: data.stock }).in("product_id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any).rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });
