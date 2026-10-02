import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Count, Field, PageHeader, Panel, Serp, th, td, inputCls } from "@/components/admin/ui";
import { db, fmtDate, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/seo")({ component: Seo });

const schemaMap = [
  ["Homepage", "Organization, WebSite"], ["Collection page", "BreadcrumbList, ItemList"], ["Product page", "Product (Offer, AggregateRating), BreadcrumbList"],
  ["Contact / About", "Organization, BreadcrumbList"], ["FAQ widget", "FAQPage (from Content → FAQ)"], ["Policy pages", "BreadcrumbList"],
];

function Seo() {
  const { data: settings = [] } = useAdminQuery<any[]>(["settings"], () => db.from("site_settings").select("*"));
  const { data: redirects = [] } = useAdminQuery<any[]>(["redirects"], () => db.from("redirects").select("*").order("created_at", { ascending: false }));
  const seo = settings.find((s) => s.key === "seo")?.value;
  const sitemap = settings.find((s) => s.key === "sitemap")?.value;
  const [f, setF] = useState({ title_template: "", default_description: "", og_image: "", robots: "" });
  const [r, setR] = useState({ from_path: "", to_path: "" });
  const [preview, setPreview] = useState({ title: "Luxury Lawn Collection", description: "", path: "/collections/luxury-lawn" });
  const mut = useAdminMutate("Saved");
  useEffect(() => { if (seo) setF({ title_template: "", default_description: "", og_image: "", robots: "", ...seo }); }, [seo]);

  return (
    <>
      <PageHeader title="SEO Center" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Site-wide defaults">
          <div className="space-y-3">
            <Field label="Title template" hint="%s = page name"><input className={inputCls} value={f.title_template} onChange={(e) => setF({ ...f, title_template: e.target.value })} /></Field>
            <Field label="Default meta description" hint={<Count n={f.default_description.length} max={160} />}><textarea rows={2} className={inputCls + " h-auto py-2"} value={f.default_description} onChange={(e) => setF({ ...f, default_description: e.target.value })} /></Field>
            <Field label="Default share image URL"><input className={inputCls} value={f.og_image} onChange={(e) => setF({ ...f, og_image: e.target.value })} placeholder="https://…" /></Field>
            <Field label="robots.txt"><textarea rows={6} className={inputCls + " h-auto py-2 font-mono text-xs"} value={f.robots} onChange={(e) => setF({ ...f, robots: e.target.value })} /></Field>
            <Button onClick={() => mut.mutate({ table: "site_settings", op: "upsert", values: { key: "seo", value: f } })}>Save defaults</Button>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="SERP preview">
            <div className="space-y-3">
              <Field label="Path"><input className={inputCls} value={preview.path} onChange={(e) => setPreview({ ...preview, path: e.target.value })} /></Field>
              <Field label="Title" hint={<Count n={preview.title.length} max={60} />}><input className={inputCls} value={preview.title} onChange={(e) => setPreview({ ...preview, title: e.target.value })} /></Field>
              <Field label="Description" hint={<Count n={preview.description.length} max={160} />}><textarea rows={2} className={inputCls + " h-auto py-2"} value={preview.description} onChange={(e) => setPreview({ ...preview, description: e.target.value })} /></Field>
              <Serp title={(f.title_template || "%s").replace("%s", preview.title)} description={preview.description || f.default_description} url={`pakistani-elegance.lovable.app${preview.path.replace(/\//g, " › ")}`} />
            </div>
          </Panel>
          <Panel title="Sitemap">
            <p className="text-sm">Sitemap is generated from active products and collections. Last regenerated: <strong>{sitemap?.generated_at ? fmtDate(sitemap.generated_at) : "never"}</strong></p>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => mut.mutate({ table: "site_settings", op: "upsert", values: { key: "sitemap", value: { generated_at: new Date().toISOString() } } })}>Regenerate</Button>
          </Panel>
        </div>
        <Panel title="301 redirects">
          <div className="mb-3 flex flex-wrap gap-2">
            <input className={inputCls + " flex-1"} placeholder="/old-path" value={r.from_path} onChange={(e) => setR({ ...r, from_path: e.target.value })} />
            <input className={inputCls + " flex-1"} placeholder="/new-path" value={r.to_path} onChange={(e) => setR({ ...r, to_path: e.target.value })} />
            <Button onClick={() => mut.mutate({ table: "redirects", op: "upsert", values: r }, { onSuccess: () => setR({ from_path: "", to_path: "" }) })}>Add</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className={th}>From</th><th className={th}>To</th><th className={th} /></tr></thead>
            <tbody>{redirects.map((x) => <tr key={x.id} className="border-t border-border"><td className={td + " font-mono text-xs"}>{x.from_path}</td><td className={td + " font-mono text-xs"}>{x.to_path}</td><td className={td + " text-right"}><button aria-label="Delete redirect" onClick={() => mut.mutate({ table: "redirects", op: "delete", ids: [x.id] })}><Trash2 className="h-4 w-4 text-destructive" /></button></td></tr>)}
              {!redirects.length && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No redirects.</td></tr>}</tbody>
          </table>
        </Panel>
        <Panel title="Structured data by page type">
          <table className="w-full text-sm"><tbody>{schemaMap.map(([p, s]) => <tr key={p} className="border-t border-border first:border-0"><td className={td + " font-medium"}>{p}</td><td className={td + " text-muted-foreground"}>{s}</td></tr>)}</tbody></table>
        </Panel>
      </div>
    </>
  );
}
