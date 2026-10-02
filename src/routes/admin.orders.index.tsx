import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Pill, statusTone, th, td, inputCls } from "@/components/admin/ui";
import { db, fmtDate, PAY, rs, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/orders/")({ component: Orders });



function Orders() {
  const { data: orders = [] } = useAdminQuery<any[]>(["orders"], () => db.from("orders").select("id,order_number,full_name,email,city,total,status,payment_method,payment_status,created_at").order("created_at", { ascending: false }).limit(500));
  const [status, setStatus] = useState("all");
  const [pay, setPay] = useState("all");
  const [q, setQ] = useState("");
  const rows = orders.filter((o) => (status === "all" || o.status === status || (status === "pending" && o.status === "placed")) && (pay === "all" || o.payment_method === pay) && `${o.order_number} ${o.full_name} ${o.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Orders" subtitle={`${rows.length} of ${orders.length}`} />
      <div className="mb-3 flex flex-wrap gap-2">
        <input className={inputCls + " max-w-xs"} placeholder="Search order, name, email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls + " w-40"} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">{["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => <option key={s}>{s}</option>)}</select>
        <select className={inputCls + " w-44"} value={pay} onChange={(e) => setPay(e.target.value)} aria-label="Payment method"><option value="all">All payments</option>{Object.entries(PAY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr><th className={th}>Order</th><th className={th}>Date</th><th className={th}>Customer</th><th className={th}>Payment</th><th className={th}>Total</th><th className={th}>Status</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                <td className={td}><Link to="/admin/orders/$id" params={{ id: o.id }} className="font-medium text-primary">{o.order_number}</Link></td>
                <td className={td + " text-muted-foreground"}>{fmtDate(o.created_at)}</td>
                <td className={td}>{o.full_name}<div className="text-xs text-muted-foreground">{o.city}</div></td>
                <td className={td}>{PAY[o.payment_method] ?? o.payment_method} <Pill tone={statusTone(o.payment_status)}>{o.payment_status}</Pill></td>
                <td className={td + " tabular-nums"}>{rs(o.total)}</td>
                <td className={td}><Pill tone={statusTone(o.status)}>{o.status === "placed" ? "pending" : o.status}</Pill></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
