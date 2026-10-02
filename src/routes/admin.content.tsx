import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bold, Heading2, Italic, List, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, PageHeader, Panel, inputCls } from "@/components/admin/ui";
import { db, useAdminMutate, useAdminQuery } from "@/components/admin/lib";

export const Route = createFileRoute("/admin/content")({ component: Content });

function Content() {
  const { data: pages = [] } = useAdminQuery<any[]>(["pages"], () => db.from("content_pages").select("*").order("title"));
  const { data: faqs = [] } = useAdminQuery<any[]>(["faqs"], () => db.from("faqs").select("*").order("sort_order"));
  const [slug, setSlug] = useState("privacy-policy");
  const page = pages.find((p) => p.slug === slug);
  const ref = useRef<HTMLDivElement>(null);
  const mut = useAdminMutate("Saved");
  const [nf, setNf] = useState({ question: "", answer: "" });
  useEffect(() => { if (ref.current) ref.current.innerHTML = page?.body ?? ""; }, [page?.slug, page?.updated_at]);
  const cmd = (c: string, v?: string) => { document.execCommand(c, false, v); ref.current?.focus(); };

  return (
    <>
      <PageHeader title="Content" subtitle="Page text and FAQ shown on the storefront" />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel title="Pages" actions={<select className={inputCls + " h-8 w-48"} value={slug} onChange={(e) => setSlug(e.target.value)}>{pages.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}</select>}>
          <div className="mb-2 flex gap-1 border-b border-border pb-2">
            {[[Bold, "bold"], [Italic, "italic"], [Heading2, "formatBlock", "h2"], [List, "insertUnorderedList"]].map(([Icon, c, v]: any) => (
              <button key={c + (v ?? "")} type="button" className="rounded p-1.5 hover:bg-muted" onMouseDown={(e) => { e.preventDefault(); cmd(c, v); }} aria-label={c}><Icon className="h-4 w-4" /></button>
            ))}
            <button type="button" className="rounded p-1.5 hover:bg-muted" aria-label="Link" onMouseDown={(e) => { e.preventDefault(); const u = prompt("Link URL"); if (u) cmd("createLink", u); }}><Link2 className="h-4 w-4" /></button>
          </div>
          <div ref={ref} contentEditable suppressContentEditableWarning className="prose prose-sm min-h-[360px] max-w-none rounded-md border border-input bg-background p-4 outline-none focus:ring-2 focus:ring-ring [&_h2]:mt-4 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-5" />
          <p className="mt-2 text-xs text-muted-foreground">Leave empty to keep the built-in page text.</p>
          <Button className="mt-3" disabled={!page || mut.isPending} onClick={() => mut.mutate({ table: "content_pages", op: "upsert", values: { slug, title: page.title, body: ref.current?.innerHTML === "<br>" ? "" : ref.current?.innerHTML ?? "" } })}>Save page</Button>
        </Panel>
        <Panel title="FAQ (single source for widget + schema)">
          <div className="space-y-3">
            {faqs.map((q, i) => <FaqRow key={q.id} q={q} i={i} />)}
            <div className="space-y-2 rounded-md border border-dashed border-border p-3">
              <Field label="New question"><input className={inputCls} value={nf.question} onChange={(e) => setNf({ ...nf, question: e.target.value })} /></Field>
              <Field label="Answer"><textarea rows={3} className={inputCls + " h-auto py-2"} value={nf.answer} onChange={(e) => setNf({ ...nf, answer: e.target.value })} /></Field>
              <Button size="sm" onClick={() => mut.mutate({ table: "faqs", op: "insert", values: { ...nf, sort_order: faqs.length } }, { onSuccess: () => setNf({ question: "", answer: "" }) })}><Plus className="h-3.5 w-3.5" /> Add FAQ</Button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function FaqRow({ q, i }: { q: any; i: number }) {
  const [f, setF] = useState({ question: q.question, answer: q.answer });
  const mut = useAdminMutate("FAQ saved");
  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <input className={inputCls + " font-medium"} value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} />
      <textarea rows={2} className={inputCls + " h-auto py-2"} value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} />
      <div className="flex justify-between">
        <Button size="sm" variant="outline" onClick={() => mut.mutate({ table: "faqs", op: "update", ids: [q.id], values: { ...f, sort_order: i } })}>Save</Button>
        <button aria-label="Delete FAQ" onClick={() => confirm("Delete FAQ?") && mut.mutate({ table: "faqs", op: "delete", ids: [q.id] })}><Trash2 className="h-4 w-4 text-destructive" /></button>
      </div>
    </div>
  );
}
