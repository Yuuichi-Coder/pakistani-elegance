import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, PageHeader, Panel, Pill, th, td, inputCls } from "@/components/admin/ui";
import { db, fmtDate, rs, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/discounts")({ component: Discounts });

const blank = { code: "", kind: "percent", value: 10, min_order: 0, usage_limit: "", expires_at: "", is_active: true };

function Discounts() {
  const { data: codes = [] } = useAdminQuery<any[]>(["discounts"], () => db.from("discount_codes").select("*").order("created_at", { ascending: false }));
  const [f, setF] = useState<any>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const mut = useAdminMutate("Discount saved");
  const save = () => {
    const values = { code: f.code, kind: f.kind, value: Number(f.value), min_order: Number(f.min_order), usage_limit: f.usage_limit ? Number(f.usage_limit) : null, expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : null, is_active: f.is_active };
    mut.mutate(editId ? { table: "discount_codes", op: "update", ids: [editId], values } : { table: "discount_codes", op: "insert", values }, { onSuccess: () => { setF(blank); setEditId(null); } });
  };
  return (
    <>
      <PageHeader title="Discounts" subtitle="Promo codes customers enter at checkout" />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className={th}>Code</th><th className={th}>Value</th><th className={th}>Min order</th><th className={th}>Used</th><th className={th}>Expires</th><th className={th}>Status</th><th className={th} /></tr></thead>
            <tbody>
              {codes.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className={td + " font-mono font-semibold"}>{c.code}</td>
                    <td className={td}>{c.kind === "percent" ? `${c.value}%` : rs(c.value)}</td>
                    <td className={td}>{rs(c.min_order)}</td>
                    <td className={td}>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                    <td className={td}>{c.expires_at ? fmtDate(c.expires_at) : "—"}</td>
                    <td className={td}>{expired ? <Pill tone="bad">Expired</Pill> : c.is_active ? <Pill tone="good">Active</Pill> : <Pill>Paused</Pill>}</td>
                    <td className={td + " whitespace-nowrap text-right"}>
                      <button className="text-xs text-primary" onClick={() => { setEditId(c.id); setF({ ...c, usage_limit: c.usage_limit ?? "", expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "" }); }}>Edit</button>
                      <button className="ml-3 text-xs text-destructive" onClick={() => confirm("Delete code?") && mut.mutate({ table: "discount_codes", op: "delete", ids: [c.id] })}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!codes.length && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No discount codes yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <Panel title={editId ? "Edit code" : "New code"}>
          <div className="space-y-3">
            <Field label="Code"><input className={inputCls + " font-mono uppercase"} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="EID20" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select className={inputCls} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="percent">Percentage</option><option value="fixed">Fixed (Rs.)</option></select></Field>
              <Field label="Value"><input type="number" className={inputCls} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></Field>
              <Field label="Min order (Rs.)"><input type="number" className={inputCls} value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} /></Field>
              <Field label="Usage limit"><input type="number" className={inputCls} value={f.usage_limit} onChange={(e) => setF({ ...f, usage_limit: e.target.value })} placeholder="Unlimited" /></Field>
            </div>
            <Field label="Expiry date"><input type="date" className={inputCls} value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} /></Field>
            <label className="flex items-center justify-between text-sm">Active <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /></label>
            <div className="flex gap-2"><Button onClick={save} disabled={mut.isPending}>Save</Button>{editId && <Button variant="outline" onClick={() => { setEditId(null); setF(blank); }}>Cancel</Button>}</div>
          </div>
        </Panel>
      </div>
    </>
  );
}
