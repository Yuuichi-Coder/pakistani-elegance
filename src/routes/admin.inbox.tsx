import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Pill, statusTone, th, td, inputCls } from "@/components/admin/ui";
import { db, downloadCsv, fmtDate, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/inbox")({ component: InboxPage });

function InboxPage() {
  const [tab, setTab] = useState<"messages" | "subscribers">("messages");
  const { data: msgs = [] } = useAdminQuery<any[]>(["contacts"], () => db.from("contact_submissions").select("*").order("created_at", { ascending: false }));
  const { data: subs = [] } = useAdminQuery<any[]>(["subs"], () => db.from("newsletter_subscribers").select("id,email,created_at").order("created_at", { ascending: false }));
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const mut = useAdminMutate();
  const rows = msgs.filter((m) => `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q.toLowerCase()));
  const cur = msgs.find((m) => m.id === open);
  const setStatus = (id: string, status: string) => mut.mutate({ table: "contact_submissions", op: "update", ids: [id], values: { status } });

  return (
    <>
      <PageHeader title="Inbox" actions={<>
        <Button size="sm" variant={tab === "messages" ? "default" : "outline"} onClick={() => setTab("messages")}>Messages ({msgs.filter((m) => m.status === "new").length} new)</Button>
        <Button size="sm" variant={tab === "subscribers" ? "default" : "outline"} onClick={() => setTab("subscribers")}>Newsletter ({subs.length})</Button>
      </>} />
      {tab === "messages" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div>
            <input className={inputCls + " mb-3 max-w-xs"} placeholder="Search messages" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="divide-y divide-border rounded-md border border-border bg-card">
              {rows.map((m) => (
                <button key={m.id} onClick={() => { setOpen(m.id); if (m.status === "new") setStatus(m.id, "read"); }} className={"block w-full px-4 py-3 text-left " + (open === m.id ? "bg-primary/5" : "hover:bg-muted/30")}>
                  <div className="flex items-center gap-2 text-sm"><span className={m.status === "new" ? "font-semibold" : ""}>{m.name}</span><Pill tone={statusTone(m.status)}>{m.status}</Pill><span className="ml-auto text-xs text-muted-foreground">{fmtDate(m.created_at)}</span></div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{m.message}</p>
                </button>
              ))}
              {!rows.length && <p className="p-8 text-center text-sm text-muted-foreground">No messages.</p>}
            </div>
          </div>
          {cur && (
            <Panel title="Message">
              <p className="font-medium">{cur.name}</p>
              <p className="text-sm"><a className="text-primary" href={`mailto:${cur.email}`}>{cur.email}</a>{cur.phone && ` · ${cur.phone}`}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{cur.message}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => setStatus(cur.id, "replied")}>Mark replied</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(cur.id, "new")}>Mark unread</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm("Delete message?") && mut.mutate({ table: "contact_submissions", op: "delete", ids: [cur.id] }, { onSuccess: () => setOpen(null) })}>Delete</Button>
              </div>
            </Panel>
          )}
        </div>
      ) : (
        <Panel title="Subscribers" actions={<Button size="sm" variant="outline" onClick={() => downloadCsv("newsletter-subscribers.csv", subs.map((s) => ({ email: s.email, subscribed: s.created_at })))}><Download className="h-3.5 w-3.5" /> Export CSV</Button>}>
          <table className="-m-4 w-[calc(100%+2rem)] text-sm">
            <thead className="bg-muted/50"><tr><th className={th}>Email</th><th className={th}>Subscribed</th><th className={th} /></tr></thead>
            <tbody>{subs.map((s) => <tr key={s.id} className="border-t border-border"><td className={td}>{s.email}</td><td className={td}>{fmtDate(s.created_at)}</td><td className={td + " text-right"}><button className="text-xs text-destructive" onClick={() => mut.mutate({ table: "newsletter_subscribers", op: "delete", ids: [s.id] })}>Remove</button></td></tr>)}</tbody>
          </table>
        </Panel>
      )}
    </>
  );
}
