import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, statusTone, th, td, inputCls } from "@/components/admin/ui";
import { db, LOW_STOCK, readError, rs, useAdminMutate, useAdminQuery } from "@/components/admin/lib";
import { bulkAdjustPrice, bulkSetStock } from "@/lib/admin.functions";
import { useQueryClient } from "@tanstack/react-query";
import { AdminThumb } from "@/components/admin/thumb";

export const Route = createFileRoute("/admin/products/")({ component: Products });

function Products() {
  const { data: products = [] } = useAdminQuery<any[]>(["products"], () => db.from("products").select("id,name,sku,slug,price,compare_at_price,status,is_featured,image_url,product_variants(stock)").order("created_at", { ascending: false }));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sel, setSel] = useState<string[]>([]);
  const mut = useAdminMutate("Products updated");
  const adj = useServerFn(bulkAdjustPrice);
  const stk = useServerFn(bulkSetStock);
  const qc = useQueryClient();
  const rows = useMemo(() => products.filter((p) => (status === "all" || p.status === status) && `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())), [products, q, status]);
  const run = async (f: () => Promise<unknown>) => { try { await f(); qc.invalidateQueries({ queryKey: ["admin"] }); toast.success("Products updated"); setSel([]); } catch (e) { toast.error(readError(e)); } };

  const bulk = (action: string) => {
    if (!sel.length) return;
    if (action === "price") { const v = Number(prompt("Adjust price by % (e.g. 10 or -15)")); if (v) run(() => adj({ data: { ids: sel, percent: v } })); }
    if (action === "stock") { const v = prompt("Set stock for every variant to:"); if (v !== null && v !== "") run(() => stk({ data: { ids: sel, stock: Number(v) } })); }
    if (["active", "draft", "out_of_stock", "archived"].includes(action)) mut.mutate({ table: "products", op: "update", ids: sel, values: { status: action, is_active: action === "active" || action === "out_of_stock" } }, { onSuccess: () => setSel([]) });
    if (action === "delete" && confirm(`Delete ${sel.length} product(s)? Products with orders should be archived instead.`)) mut.mutate({ table: "products", op: "delete", ids: sel }, { onSuccess: () => setSel([]) });
  };

  return (
    <>
      <PageHeader title="Products" subtitle={`${products.length} products`} actions={<Button asChild><Link to="/admin/products/$id" params={{ id: "new" }}><Plus className="h-4 w-4" /> New product</Link></Button>} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input className={inputCls + " max-w-xs"} placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls + " w-40"} value={status} onChange={(e) => setStatus(e.target.value)}>
          {["all", "active", "draft", "out_of_stock", "archived"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        {sel.length > 0 && (
          <select className={inputCls + " w-56 border-primary"} value="" onChange={(e) => bulk(e.target.value)} aria-label="Bulk actions">
            <option value="">Bulk actions ({sel.length})</option>
            <option value="price">Adjust price %</option><option value="stock">Set stock</option>
            <option value="active">Set active</option><option value="draft">Set draft</option><option value="out_of_stock">Set out of stock</option>
            <option value="archived">Archive</option><option value="delete">Delete</option>
          </select>
        )}
      </div>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className={th + " w-8"}><input type="checkbox" aria-label="Select all" checked={sel.length === rows.length && rows.length > 0} onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.id) : [])} /></th>
            <th className={th}>Product</th><th className={th}>SKU</th><th className={th}>Price</th><th className={th}>Stock</th><th className={th}>Status</th>
          </tr></thead>
          <tbody>
            {rows.map((p) => {
              const stock = (p.product_variants ?? []).reduce((a: number, v: any) => a + v.stock, 0);
              const low = (p.product_variants ?? []).some((v: any) => v.stock <= LOW_STOCK);
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className={td}><input type="checkbox" aria-label={`Select ${p.name}`} checked={sel.includes(p.id)} onChange={(e) => setSel(e.target.checked ? [...sel, p.id] : sel.filter((x) => x !== p.id))} /></td>
                  <td className={td}><Link to="/admin/products/$id" params={{ id: p.id }} className="flex items-center gap-3"><AdminThumb src={p.image_url} alt="" className="h-12 w-9 shrink-0 rounded-sm" /><span className="font-medium hover:text-primary">{p.name}</span>{p.is_featured && <Pill tone="warn">Featured</Pill>}</Link></td>
                  <td className={td + " font-mono text-xs"}>{p.sku}</td>
                  <td className={td + " tabular-nums"}>{rs(p.price)}{p.compare_at_price ? <span className="ml-1 text-xs text-muted-foreground line-through">{rs(p.compare_at_price)}</span> : null}</td>
                  <td className={td}><span className="inline-flex items-center gap-1 tabular-nums">{stock}{low && <AlertTriangle className="h-3.5 w-3.5 text-destructive" aria-label="Low stock" />}</span></td>
                  <td className={td}><Pill tone={statusTone(p.status)}>{p.status.replace("_", " ")}</Pill></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
