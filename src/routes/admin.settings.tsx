import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, PageHeader, Panel, inputCls } from "@/components/admin/ui";
import { db, PAY, readError, uploadMedia, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const PAY_KEYS = ["cod", "jazzcash", "easypaisa", "bank_transfer", "local_card"] as const;

function SettingsPage() {
  const { data: settings = [] } = useAdminQuery<any[]>(["settings"], () => db.from("site_settings").select("*"));
  const store = settings.find((s) => s.key === "store")?.value;
  const payments = settings.find((s) => s.key === "payments")?.value;
  const [f, setF] = useState<any>({ name: "", whatsapp: "", announcement: "", logo_url: "", social: { instagram: "", facebook: "", tiktok: "" }, footer_links: [] });
  const [p, setP] = useState<Record<string, boolean>>({});
  const mut = useAdminMutate("Settings saved");
  useEffect(() => { if (store) setF((x: any) => ({ ...x, ...store, social: { ...x.social, ...store.social } })); }, [store]);
  useEffect(() => { if (payments) setP(payments); }, [payments]);

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Store">
          <div className="space-y-3">
            <Field label="Store name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Logo">
              <div className="flex items-center gap-3">{f.logo_url && <img src={f.logo_url} alt="" className="h-10" />}
                <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary"><Upload className="h-3.5 w-3.5" /> Upload<input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, logo_url: await uploadMedia(file, "brand") }); } catch (er) { toast.error(readError(er)); } }} /></label></div>
            </Field>
            <Field label="WhatsApp number" hint="digits with country code"><input className={inputCls} value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value.replace(/\D/g, "") })} /></Field>
            <Field label="Announcement bar (one message per line)"><textarea rows={3} className={inputCls + " h-auto py-2"} value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} /></Field>
            {(["instagram", "facebook", "tiktok"] as const).map((k) => <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><input className={inputCls} value={f.social[k] ?? ""} onChange={(e) => setF({ ...f, social: { ...f.social, [k]: e.target.value } })} placeholder="https://…" /></Field>)}
            <Field label="Footer links">
              <div className="space-y-2">
                {f.footer_links.map((l: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input className={inputCls} placeholder="Label" value={l.label} onChange={(e) => setF({ ...f, footer_links: f.footer_links.map((x: any, n: number) => (n === i ? { ...x, label: e.target.value } : x)) })} />
                    <input className={inputCls} placeholder="/path" value={l.href} onChange={(e) => setF({ ...f, footer_links: f.footer_links.map((x: any, n: number) => (n === i ? { ...x, href: e.target.value } : x)) })} />
                    <button type="button" aria-label="Remove link" onClick={() => setF({ ...f, footer_links: f.footer_links.filter((_: any, n: number) => n !== i) })}><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                ))}
                <button type="button" className="inline-flex items-center gap-1 text-xs text-primary" onClick={() => setF({ ...f, footer_links: [...f.footer_links, { label: "", href: "" }] })}><Plus className="h-3.5 w-3.5" /> Add link</button>
              </div>
            </Field>
            <Button onClick={() => mut.mutate({ table: "site_settings", op: "upsert", values: { key: "store", value: f } })}>Save store settings</Button>
          </div>
        </Panel>
        <Panel title="Payment methods">
          <p className="mb-3 text-sm text-muted-foreground">Only Pakistani payment options are supported.</p>
          <div className="space-y-3">
            {PAY_KEYS.map((k) => <label key={k} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">{k === "local_card" ? "Card (Pakistani gateway)" : PAY[k]}<Switch checked={!!p[k]} onCheckedChange={(v) => setP({ ...p, [k]: v })} /></label>)}
          </div>
          <Button className="mt-4" onClick={() => mut.mutate({ table: "site_settings", op: "upsert", values: { key: "payments", value: Object.fromEntries(PAY_KEYS.map((k) => [k, !!p[k]])) } })}>Save payment methods</Button>
        </Panel>
      </div>
    </>
  );
}
