import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, Pill, statusTone, th, td } from "@/components/admin/ui";
import { db, fmtDate, LOW_STOCK, rs, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/")({ component: Overview });

function Overview() {
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: orders = [] } = useAdminQuery<any[]>(["orders-30"], () => db.from("orders").select("id,order_number,full_name,total,status,payment_method,created_at").gte("created_at", since).order("created_at", { ascending: false }));
  const { data: recent = [] } = useAdminQuery<any[]>(["orders-recent"], () => db.from("orders").select("id,order_number,full_name,total,status,payment_method,created_at").order("created_at", { ascending: false }).limit(10));
  const { data: pending = [] } = useAdminQuery<any[]>(["orders-pending"], () => db.from("orders").select("id").in("status", ["placed", "pending", "processing"]));
  const { data: low = [] } = useAdminQuery<any[]>(["low-stock"], () => db.from("product_variants").select("product_id").lte("stock", LOW_STOCK));
  const { data: msgs = [] } = useAdminQuery<any[]>(["msgs-new"], () => db.from("contact_submissions").select("id").eq("status", "new"));
  const { data: subs = [] } = useAdminQuery<any[]>(["subs-week"], () => db.from("newsletter_subscribers").select("id").gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()));

  const today = new Date().toDateString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const live = orders.filter((o) => o.status !== "cancelled");
  const stats = [
    { label: "Today's orders", value: orders.filter((o) => new Date(o.created_at).toDateString() === today).length },
    { label: "Pending orders", value: pending.length, to: "/admin/orders" },
    { label: "Revenue this month", value: rs(live.filter((o) => new Date(o.created_at) >= monthStart).reduce((a, o) => a + o.total, 0)) },
    { label: "Low-stock products", value: new Set(low.map((l) => l.product_id)).size, to: "/admin/products" },
    { label: "New messages", value: msgs.length, to: "/admin/inbox" },
    { label: "Signups (7 days)", value: subs.length, to: "/admin/inbox" },
  ];
  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5);
    return { day: d.toLocaleDateString("en-PK", { day: "numeric", month: "short" }), revenue: live.filter((o) => new Date(o.created_at).toDateString() === d.toDateString()).reduce((a, o) => a + o.total, 0) };
  });

  return (
    <>
      <PageHeader title="Overview" subtitle="Live store performance" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
            {s.to && <Link to={s.to} className="mt-1 inline-block text-xs text-primary hover:underline">View</Link>}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Panel title="Revenue — last 30 days" className="xl:col-span-3">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => rs(v)} />
                <Area dataKey="revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Recent orders" className="xl:col-span-2" actions={<Link to="/admin/orders" className="text-xs text-primary">All orders</Link>}>
          <div className="-m-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Total</th><th className={th}>Status</th></tr></thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className={td}><Link to="/admin/orders/$id" params={{ id: o.id }} className="font-medium text-primary">{o.order_number}</Link><div className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</div></td>
                    <td className={td}>{o.full_name}</td>
                    <td className={td + " tabular-nums"}>{rs(o.total)}</td>
                    <td className={td}><Pill tone={statusTone(o.status)}>{o.status}</Pill></td>
                  </tr>
                ))}
                {!recent.length && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
