import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Count, Field, PageHeader, Panel, Serp, inputCls } from "@/components/admin/ui";
import { db, readError, uploadMedia, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/collections")({ component: Collections });

const blank = { slug: "", name: "", description: "", image_url: "", sort_order: 0, is_featured: false, meta_title: "", meta_description: "" };

function Collections() {
  const { data: cols = [] } = useAdminQuery<any[]>(["collections-full"], () => db.from("collections").select("*,product_collections(product_id)").order("sort_order"));
  const { data: products = [] } = useAdminQuery<any[]>(["products-min"], () => db.from("products").select("id,name").order("name"));
  const [selId, setSelId] = useState<string | null>(null);
  const [f, setF] = useState<any>(blank);
  const mut = useAdminMutate("Saved");
  const current = cols.find((c) => c.id === selId);
  useEffect(() => { if (current) { const { product_collections, id, created_at, ...r } = current; setF({ ...blank, ...r, image_url: r.image_url ?? "", meta_title: r.meta_title ?? "", meta_description: r.meta_description ?? "" }); } else setF(blank); }, [selId, current?.id]);
  const assigned: string[] = (current?.product_collections ?? []).map((p: any) => p.product_id);

  const save = () => {
    const values = { ...f, sort_order: Number(f.sort_order), image_url: f.image_url || null, meta_title: f.meta_title || null, meta_description: f.meta_description || null };
    if (selId) mut.mutate({ table: "collections", op: "update", ids: [selId], values });
    else mut.mutate({ table: "collections", op: "insert", values: { ...values, sort_order: cols.length } }, { onSuccess: () => setF(blank) });
  };
  const reorder = (i: number, dir: -1 | 1) => {
    const a = [...cols]; const j = i + dir; if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    a.forEach((c, n) => { if (c.sort_order !== n) mut.mutate({ table: "collections", op: "update", ids: [c.id], values: { sort_order: n } }); });
  };

  return (
    <>
      <PageHeader title="Collections" subtitle="Order here controls site navigation" actions={<Button onClick={() => setSelId(null)}><Plus className="h-4 w-4" /> New collection</Button>} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Panel title="Navigation order">
          <ul className="-m-2 space-y-1">
            {cols.map((c, i) => (
              <li key={c.id} className={"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm " + (c.id === selId ? "bg-primary/10" : "hover:bg-muted")}>
                <button className="flex-1 text-left" onClick={() => setSelId(c.id)}>{c.name} <span className="text-xs text-muted-foreground">({c.product_collections?.length ?? 0})</span></button>
                <button aria-label="Move up" onClick={() => reorder(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></button>
                <button aria-label="Move down" onClick={() => reorder(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-6">
          <Panel title={selId ? `Edit — ${current?.name}` : "New collection"} actions={selId && <button className="text-xs text-destructive" onClick={() => { if (confirm("Delete this collection?")) mut.mutate({ table: "collections", op: "delete", ids: [selId] }, { onSuccess: () => setSelId(null) }); }}><Trash2 className="inline h-3.5 w-3.5" /> Delete</button>}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, ...(selId ? {} : { slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }) })} /></Field>
              <Field label="URL slug"><input className={inputCls} value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></Field>
              <div className="md:col-span-2"><Field label="Description"><textarea rows={2} className={inputCls + " h-auto py-2"} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
              <Field label="Banner image">
                <div className="flex items-center gap-3">
                  {f.image_url && <img src={f.image_url} alt="" className="h-14 w-24 rounded-sm object-cover" />}
                  <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary"><Upload className="h-3.5 w-3.5" /> Upload<input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, image_url: await uploadMedia(file, "collections") }); } catch (er) { toast.error(readError(er)); } }} /></label>
                </div>
              </Field>
              <label className="flex items-center justify-between self-end text-sm">Featured on homepage <Switch checked={f.is_featured} onCheckedChange={(v) => setF({ ...f, is_featured: v })} /></label>
              <Field label="Meta title" hint={<Count n={f.meta_title.length} max={60} />}><input className={inputCls} value={f.meta_title} onChange={(e) => setF({ ...f, meta_title: e.target.value })} /></Field>
              <Field label="Meta description" hint={<Count n={f.meta_description.length} max={160} />}><input className={inputCls} value={f.meta_description} onChange={(e) => setF({ ...f, meta_description: e.target.value })} /></Field>
              <div className="md:col-span-2"><Serp title={f.meta_title || `${f.name} — Maryam Fashions`} description={f.meta_description || f.description} url={`pakistani-elegance.lovable.app › collections › ${f.slug}`} /></div>
            </div>
            <Button className="mt-4" onClick={save} disabled={mut.isPending}>Save collection</Button>
          </Panel>
          {selId && (
            <Panel title="Products in this collection">
              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={assigned.includes(p.id)} onChange={(e) => mut.mutate(e.target.checked ? { table: "product_collections", op: "insert", values: { product_id: p.id, collection_id: selId } } : { table: "product_collections", op: "delete", match: { product_id: p.id, collection_id: selId } })} />
                    {p.name}
                  </label>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
