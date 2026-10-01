import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, PageHeader, Panel, Pill, statusTone, th, td, inputCls } from "@/components/admin/ui";
import { db, fmtDate, rs, useAdminMutate, useAdminQuery } from "@/components/admin/lib";
import { PAY } from "./admin.orders.index";

export const Route = createFileRoute("/admin/orders/$id")({ component: OrderDetail });

function OrderDetail() {
  const { id } = Route.useParams();
  const { data: o } = useAdminQuery<any>(["order", id], () => db.from("orders").select("*,order_items(*),order_status_history(*)").eq("id", id).single());
  const [f, setF] = useState({ status: "placed", payment_status: "pending", courier: "", tracking_number: "", note: "" });
  const mut = useAdminMutate("Order updated");
  useEffect(() => { if (o) setF({ status: o.status, payment_status: o.payment_status, courier: o.courier ?? "", tracking_number: o.tracking_number ?? "", note: "" }); }, [o]);
  if (!o) return <p className="text-muted-foreground">Loading…</p>;
  const history = [...(o.order_status_history ?? [])].sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at));

  const save = () => mut.mutate({ table: "orders", op: "update", ids: [id], values: { status: f.status, payment_status: f.payment_status, courier: f.courier || null, tracking_number: f.tracking_number || null } }, {
    onSuccess: () => { if (f.status !== o.status || f.note) mut.mutate({ table: "order_status_history", op: "insert", values: { order_id: id, status: f.status, note: f.note || null } }); },
  });

  return (
    <>
      <div className="print:hidden"><PageHeader title={`Order ${o.order_number}`} subtitle={new Date(o.created_at).toLocaleString("en-PK")} actions={<><Button variant="outline" asChild><Link to="/admin/orders">Back</Link></Button><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Invoice</Button></>} /></div>
      <div className="mb-6 hidden print:block"><p className="font-serif text-2xl">Maryam Fashions</p><p className="text-sm">Invoice {o.order_number} · {fmtDate(o.created_at)}</p></div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Items">
            <table className="-m-4 w-[calc(100%+2rem)] text-sm">
              <thead className="bg-muted/50"><tr><th className={th}>Item</th><th className={th}>Variant</th><th className={th}>Qty</th><th className={th + " text-right"}>Amount</th></tr></thead>
              <tbody>
                {o.order_items.map((i: any) => <tr key={i.id} className="border-t border-border"><td className={td}>{i.product_name}</td><td className={td}>{i.color} / {i.size}</td><td className={td}>{i.quantity} × {rs(i.unit_price)}</td><td className={td + " text-right tabular-nums"}>{rs(i.quantity * i.unit_price)}</td></tr>)}
                <tr className="border-t border-border"><td colSpan={3} className={td + " text-right text-muted-foreground"}>Subtotal</td><td className={td + " text-right"}>{rs(o.subtotal)}</td></tr>
                {o.discount > 0 && <tr><td colSpan={3} className={td + " text-right text-muted-foreground"}>Discount {o.discount_code}</td><td className={td + " text-right"}>−{rs(o.discount)}</td></tr>}
                <tr><td colSpan={3} className={td + " text-right text-muted-foreground"}>Shipping</td><td className={td + " text-right"}>{rs(o.shipping)}</td></tr>
                <tr className="font-semibold"><td colSpan={3} className={td + " text-right"}>Total</td><td className={td + " text-right"}>{rs(o.total)}</td></tr>
              </tbody>
            </table>
          </Panel>
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Customer"><p className="font-medium">{o.full_name}</p><p className="text-sm">{o.email}</p><p className="text-sm">{o.phone}</p></Panel>
            <Panel title="Shipping address"><p className="text-sm">{o.address_line}</p><p className="text-sm">{o.city} {o.postal_code}</p>{o.notes && <p className="mt-2 text-xs text-muted-foreground">Note: {o.notes}</p>}</Panel>
          </div>
        </div>
        <div className="space-y-6 print:hidden">
          <Panel title="Fulfilment">
            <div className="space-y-3">
              <p className="text-sm">Payment: <strong>{PAY[o.payment_method] ?? o.payment_method}</strong></p>
              <Field label="Order status"><select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{["placed", "processing", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s === "placed" ? "pending" : s}</option>)}</select></Field>
              <Field label="Payment status"><select className={inputCls} value={f.payment_status} onChange={(e) => setF({ ...f, payment_status: e.target.value })}>{["pending", "paid", "refunded", "failed"].map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Courier"><input className={inputCls} placeholder="TCS, Leopards, M&P…" value={f.courier} onChange={(e) => setF({ ...f, courier: e.target.value })} /></Field>
              <Field label="Tracking number"><input className={inputCls} value={f.tracking_number} onChange={(e) => setF({ ...f, tracking_number: e.target.value })} /></Field>
              <Field label="Note for history" hint="optional"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
              <Button className="w-full" onClick={save} disabled={mut.isPending}>Update order</Button>
            </div>
          </Panel>
          <Panel title="Status history">
            <ol className="space-y-3 text-sm">
              {history.map((h: any) => <li key={h.id}><Pill tone={statusTone(h.status)}>{h.status}</Pill> <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("en-PK")}</span>{h.note && <p className="mt-0.5 text-muted-foreground">{h.note}</p>}</li>)}
              <li><Pill>placed</Pill> <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-PK")}</span></li>
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
