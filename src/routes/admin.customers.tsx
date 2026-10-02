import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Panel, Pill, statusTone, th, td, inputCls } from "@/components/admin/ui";
import { db, fmtDate, rs, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

function Customers() {
  const { data: orders = [] } = useAdminQuery<any[]>(["orders-cust"], () => db.from("orders").select("id,order_number,user_id,email,full_name,phone,city,total,status,created_at").order("created_at", { ascending: false }));
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const customers = useMemo(() => {
    const m = new Map<string, any>();
    for (const o of orders) {
      const k = o.email.toLowerCase();
      const c = m.get(k) ?? { email: o.email, name: o.full_name, phone: o.phone, city: o.city, user_id: o.user_id, orders: [], ltv: 0 };
      c.orders.push(o); if (o.status !== "cancelled") c.ltv += o.total; if (o.user_id) c.user_id = o.user_id;
      m.set(k, c);
    }
    return [...m.values()].sort((a, b) => b.ltv - a.ltv);
  }, [orders]);
  const rows = customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));
  const cur = customers.find((c) => c.email === sel);
  const { data: wish = [] } = useAdminQuery<any[]>(["wish", cur?.user_id ?? "none"], () => (cur?.user_id ? db.from("wishlist_items").select("id,products(name,slug)").eq("user_id", cur.user_id) : Promise.resolve({ data: [], error: null })));

  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} customers · ${customers.filter((c) => c.user_id).length} with accounts`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div>
          <input className={inputCls + " mb-3 max-w-xs"} placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className={th}>Customer</th><th className={th}>City</th><th className={th}>Orders</th><th className={th}>Lifetime value</th><th className={th}>Account</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.email} onClick={() => setSel(c.email)} className={"cursor-pointer border-t border-border " + (sel === c.email ? "bg-primary/5" : "hover:bg-muted/30")}>
                    <td className={td}><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.email}</p></td>
                    <td className={td}>{c.city}</td><td className={td}>{c.orders.length}</td><td className={td + " tabular-nums"}>{rs(c.ltv)}</td>
                    <td className={td}>{c.user_id ? <Pill tone="good">Registered</Pill> : <Pill>Guest</Pill>}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customers yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {cur ? (
          <div className="space-y-4">
            <Panel title="Customer"><p className="font-medium">{cur.name}</p><p className="text-sm">{cur.email}</p><p className="text-sm">{cur.phone}</p><p className="mt-2 text-sm">Lifetime value: <strong>{rs(cur.ltv)}</strong></p></Panel>
            <Panel title="Order history"><ul className="space-y-2 text-sm">{cur.orders.map((o: any) => <li key={o.id} className="flex justify-between"><Link to="/admin/orders/$id" params={{ id: o.id }} className="text-primary">{o.order_number}</Link><span className="text-muted-foreground">{fmtDate(o.created_at)}</span><Pill tone={statusTone(o.status)}>{o.status}</Pill><span className="tabular-nums">{rs(o.total)}</span></li>)}</ul></Panel>
            <Panel title="Wishlist">{cur.user_id ? (wish.length ? <ul className="space-y-1 text-sm">{wish.map((w: any) => <li key={w.id}>{w.products?.name}</li>)}</ul> : <p className="text-sm text-muted-foreground">Empty wishlist.</p>) : <p className="text-sm text-muted-foreground">Guest checkout — no wishlist.</p>}</Panel>
          </div>
        ) : <p className="text-sm text-muted-foreground">Select a customer to see details.</p>}
      </div>
    </>
  );
}
