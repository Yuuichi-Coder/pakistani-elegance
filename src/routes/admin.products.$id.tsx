import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Count, Field, PageHeader, Panel, Serp, inputCls } from "@/components/admin/ui";
import { db, readError, uploadMedia, useAdminQuery } from "@/components/admin/lib";
import { adminMutate } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/products/$id")({ component: ProductEditor });

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const empty = { name: "", slug: "", sku: "", description: "", details: "", fabric_care: "", fabric: "Lawn", color: "", price: 0, compare_at_price: null as number | null, status: "draft", is_active: false, is_featured: false, image_url: "", hover_image_url: "", meta_title: "", meta_description: "", canonical_url: "", og_image_url: "" };
type Img = { id?: string; url: string; alt: string };
type Variant = { id?: string; color: string; size: string; stock: number; sku: string };

function ProductEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mutate = useServerFn(adminMutate);
  const { data: collections = [] } = useAdminQuery<any[]>(["collections"], () => db.from("collections").select("id,name").order("sort_order"));
  const { data: loaded } = useAdminQuery<any>(["product", id], () => (isNew ? Promise.resolve({ data: null, error: null }) : db.from("products").select("*,product_variants(*),product_images(*),product_collections(collection_id)").eq("id", id).single()));
  const [f, setF] = useState(empty);
  const [imgs, setImgs] = useState<Img[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const { product_variants, product_images, product_collections, id: _i, created_at, updated_at, rating, review_count, is_new, ...rest } = loaded;
    setF({ ...empty, ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? (k === "compare_at_price" ? null : "")])) } as any);
    const gal = [...(product_images ?? [])].sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order).map((i: any) => ({ id: i.id, url: i.url, alt: i.alt }));
    setImgs(gal.length ? gal : [loaded.image_url, loaded.hover_image_url].filter(Boolean).map((url: string) => ({ url, alt: loaded.name })));
    setVariants(product_variants ?? []);
    setCols((product_collections ?? []).map((c: any) => c.collection_id));
  }, [loaded]);

  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    try { for (const file of Array.from(files)) { const url = await uploadMedia(file, "products"); setImgs((p) => [...p, { url, alt: f.name }]); } }
    catch (e) { toast.error(readError(e)); }
  };
  const move = (from: number, to: number) => setImgs((p) => { const a = [...p]; const [x] = a.splice(from, 1); if (x) a.splice(to, 0, x); return a; });

  const save = async () => {
    const first = imgs[0]; if (!first) { toast.error("Add at least one image"); return; }
    setSaving(true);
    try {
      const values = { ...f, price: Number(f.price), compare_at_price: f.compare_at_price ? Number(f.compare_at_price) : null, image_url: first.url, hover_image_url: (imgs[1] ?? first).url,
        is_active: f.status === "active" || f.status === "out_of_stock", meta_title: f.meta_title || null, meta_description: f.meta_description || null, canonical_url: f.canonical_url || null, og_image_url: f.og_image_url || null };
      let pid = id;
      if (isNew) {
        await mutate({ data: { table: "products", op: "insert", values } });
        const { data } = await db.from("products").select("id").eq("slug", f.slug).single();
        pid = data.id;
      } else await mutate({ data: { table: "products", op: "update", ids: [id], values } });
      // images, variants, collections: replace sets
      await mutate({ data: { table: "product_images", op: "delete", match: { product_id: pid } } });
      await mutate({ data: { table: "product_images", op: "insert", values: imgs.map((i, n) => ({ product_id: pid, url: i.url, alt: i.alt, sort_order: n, is_primary: n === 0 })) } });
      const keep = variants.filter((v) => v.id).map((v) => v.id!);
      const removed = (loaded?.product_variants ?? []).map((v: any) => v.id).filter((x: string) => !keep.includes(x));
      if (removed.length) await mutate({ data: { table: "product_variants", op: "delete", ids: removed } });
      for (const v of variants) {
        const row = { product_id: pid, color: v.color, size: v.size, stock: Number(v.stock), sku: v.sku || `${f.sku}-${v.size}` };
        if (v.id) await mutate({ data: { table: "product_variants", op: "update", ids: [v.id], values: row } });
        else await mutate({ data: { table: "product_variants", op: "insert", values: row } });
      }
      await mutate({ data: { table: "product_collections", op: "delete", match: { product_id: pid } } });
      if (cols.length) await mutate({ data: { table: "product_collections", op: "insert", values: cols.map((c) => ({ product_id: pid, collection_id: c })) } });
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Product saved");
      if (isNew) navigate({ to: "/admin/products/$id", params: { id: pid } });
    } catch (e) { toast.error(readError(e)); } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title={isNew ? "New product" : f.name || "Edit product"} actions={<>
        <Button variant="outline" onClick={() => navigate({ to: "/admin/products" })}>Back</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save product"}</Button>
      </>} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name"><input className={inputCls} value={f.name} onChange={(e) => { set("name", e.target.value); if (isNew) set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} /></Field>
              <Field label="SKU"><input className={inputCls} value={f.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
              <Field label="Fabric"><input className={inputCls} value={f.fabric} onChange={(e) => set("fabric", e.target.value)} /></Field>
              <Field label="Colour"><input className={inputCls} value={f.color} onChange={(e) => set("color", e.target.value)} /></Field>
              <Field label="Price (Rs.)"><input type="number" className={inputCls} value={f.price} onChange={(e) => set("price", e.target.value)} /></Field>
              <Field label="Original price (shown struck through)" hint="optional"><input type="number" className={inputCls} value={f.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value || null)} /></Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Description"><textarea rows={4} className={inputCls + " h-auto py-2"} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
              <Field label="Product details"><textarea rows={3} className={inputCls + " h-auto py-2"} value={f.details} onChange={(e) => set("details", e.target.value)} /></Field>
              <Field label="Fabric & care"><textarea rows={2} className={inputCls + " h-auto py-2"} value={f.fabric_care} onChange={(e) => set("fabric_care", e.target.value)} /></Field>
            </div>
          </Panel>

          <Panel title="Images" actions={<label className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary"><Upload className="h-3.5 w-3.5" /> Upload<input type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} /></label>}>
            <p className="mb-3 text-xs text-muted-foreground">Drag to reorder. The first image is the primary photo.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {imgs.map((img, i) => (
                <div key={img.url + i} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
                  className={"rounded-md border bg-background p-2 " + (i === 0 ? "border-primary" : "border-border")}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                    <img src={img.url} alt={img.alt} className="h-full w-full object-contain" />
                    <GripVertical className="absolute left-1 top-1 h-4 w-4 cursor-grab text-background drop-shadow" />
                  </div>
                  <input className={inputCls + " mt-2 h-8 text-xs"} placeholder="Alt text" value={img.alt} onChange={(e) => setImgs((p) => p.map((x, n) => (n === i ? { ...x, alt: e.target.value } : x)))} />
                  <div className="mt-1.5 flex justify-between text-xs">
                    {i === 0 ? <span className="font-medium text-primary">Primary</span> : <button type="button" onClick={() => move(i, 0)} className="inline-flex items-center gap-1 hover:text-primary"><Star className="h-3 w-3" /> Set primary</button>}
                    <button type="button" aria-label="Remove image" onClick={() => setImgs((p) => p.filter((_, n) => n !== i))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Variants" actions={<button className="text-xs text-primary" onClick={() => setVariants((v) => [...v, { color: f.color, size: "M", stock: 0, sku: "" }])}>+ Add variant</button>}>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 pb-2">
                <span className="text-xs text-muted-foreground">Quick add all sizes for colour “{f.color || "—"}”:</span>
                <button className="text-xs text-primary" onClick={() => setVariants((v) => [...v, ...SIZES.filter((s) => !v.some((x) => x.size === s && x.color === f.color)).map((s) => ({ color: f.color, size: s, stock: 10, sku: "" }))])}>Add XS–XL</button>
              </div>
              {variants.map((v, i) => (
                <div key={v.id ?? i} className="grid grid-cols-[1fr_80px_90px_1fr_32px] items-center gap-2">
                  <input className={inputCls} placeholder="Colour" value={v.color} onChange={(e) => setVariants((p) => p.map((x, n) => (n === i ? { ...x, color: e.target.value } : x)))} />
                  <select className={inputCls} value={v.size} onChange={(e) => setVariants((p) => p.map((x, n) => (n === i ? { ...x, size: e.target.value } : x)))}>{SIZES.map((s) => <option key={s}>{s}</option>)}</select>
                  <input type="number" aria-label="Stock" className={inputCls + (v.stock <= 5 ? " border-destructive" : "")} value={v.stock} onChange={(e) => setVariants((p) => p.map((x, n) => (n === i ? { ...x, stock: Number(e.target.value) } : x)))} />
                  <input className={inputCls + " font-mono text-xs"} placeholder="Variant SKU (auto)" value={v.sku} onChange={(e) => setVariants((p) => p.map((x, n) => (n === i ? { ...x, sku: e.target.value } : x)))} />
                  <button aria-label="Remove variant" onClick={() => setVariants((p) => p.filter((_, n) => n !== i))}><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              ))}
              {!variants.length && <p className="text-sm text-muted-foreground">No variants yet.</p>}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Status">
            <Field label="Status"><select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value)}>{["active", "draft", "out_of_stock", "archived"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></Field>
            <label className="mt-4 flex items-center justify-between text-sm">Featured on homepage <Switch checked={f.is_featured} onCheckedChange={(v) => set("is_featured", v)} /></label>
          </Panel>
          <Panel title="Collections">
            <div className="space-y-2">{collections.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cols.includes(c.id)} onChange={(e) => setCols((p) => (e.target.checked ? [...p, c.id] : p.filter((x) => x !== c.id)))} />{c.name}</label>
            ))}</div>
          </Panel>
          <Panel title="SEO">
            <div className="space-y-3">
              <Field label="URL slug"><input className={inputCls} value={f.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
              <Field label="Meta title" hint={<Count n={(f.meta_title || "").length} max={60} />}><input className={inputCls} value={f.meta_title} onChange={(e) => set("meta_title", e.target.value)} /></Field>
              <Field label="Meta description" hint={<Count n={(f.meta_description || "").length} max={160} />}><textarea rows={3} className={inputCls + " h-auto py-2"} value={f.meta_description} onChange={(e) => set("meta_description", e.target.value)} /></Field>
              <Field label="Canonical URL override"><input className={inputCls} placeholder="https://…" value={f.canonical_url} onChange={(e) => set("canonical_url", e.target.value)} /></Field>
              <Field label="Open Graph image"><select className={inputCls} value={f.og_image_url} onChange={(e) => set("og_image_url", e.target.value)}><option value="">Primary image</option>{imgs.map((i, n) => <option key={n} value={i.url}>Image {n + 1}</option>)}</select></Field>
              <Serp title={f.meta_title || `${f.name} — Maryam Fashions`} description={f.meta_description || f.description} url={`pakistani-elegance.lovable.app › product › ${f.slug}`} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
