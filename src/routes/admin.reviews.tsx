import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, statusTone, inputCls } from "@/components/admin/ui";
import { db, fmtDate, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/reviews")({ component: Reviews });

function Reviews() {
  const { data: reviews = [] } = useAdminQuery<any[]>(["reviews"], () => db.from("reviews").select("*,products(name)").order("created_at", { ascending: false }));
  const [filter, setFilter] = useState("pending");
  const [replies, setReplies] = useState<Record<string, string>>({});
  const mut = useAdminMutate("Review updated");
  const rows = reviews.filter((r) => filter === "all" || r.status === filter || (filter === "featured" && r.is_featured));
  const upd = (id: string, values: object) => mut.mutate({ table: "reviews", op: "update", ids: [id], values });
  return (
    <>
      <PageHeader title="Reviews" subtitle={`${reviews.filter((r) => r.status === "pending").length} awaiting moderation`} />
      <div className="mb-4 flex gap-1">{["pending", "approved", "rejected", "featured", "all"].map((s) => <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">{s}</Button>)}</div>
      <div className="space-y-3">
        {rows.map((r) => (
          <article key={r.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="flex text-gold">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={"h-3.5 w-3.5 " + (i < r.rating ? "fill-current" : "opacity-30")} />)}</span>
              <strong>{r.title}</strong><Pill tone={statusTone(r.status)}>{r.status}</Pill>{r.is_featured && <Pill tone="warn">Featured</Pill>}
              <span className="ml-auto text-xs text-muted-foreground">{r.reviewer_name} · {r.products?.name} · {fmtDate(r.created_at)}</span>
            </div>
            <p className="mt-2 text-sm">{r.body}</p>
            {r.store_reply && <p className="mt-2 border-l-2 border-primary pl-3 text-sm text-muted-foreground"><strong>Maryam Fashions:</strong> {r.store_reply}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => upd(r.id, { status: "approved", is_approved: true })}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => upd(r.id, { status: "rejected", is_approved: false, is_featured: false })}>Reject</Button>
              <Button size="sm" variant="outline" onClick={() => upd(r.id, { is_featured: !r.is_featured })}>{r.is_featured ? "Unfeature" : "Feature"}</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm("Delete review?") && mut.mutate({ table: "reviews", op: "delete", ids: [r.id] })}>Delete</Button>
              <input className={inputCls + " h-8 min-w-[200px] flex-1"} placeholder="Reply as the store…" value={replies[r.id] ?? ""} onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })} />
              <Button size="sm" variant="outline" disabled={!replies[r.id]} onClick={() => upd(r.id, { store_reply: replies[r.id] })}>Reply</Button>
            </div>
          </article>
        ))}
        {!rows.length && <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No reviews here.</p>}
      </div>
    </>
  );
}
