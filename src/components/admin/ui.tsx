import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const tones: Record<string, string> = {
  good: "bg-whatsapp/15 text-foreground border-whatsapp/40",
  warn: "bg-accent/20 text-foreground border-accent/40",
  bad: "bg-destructive/10 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
};
export function Pill({ tone = "neutral", children }: { tone?: keyof typeof tones | string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide", tones[tone] ?? tones.neutral)}>{children}</span>;
}

export const statusTone = (s: string) =>
  ({ delivered: "good", paid: "good", approved: "good", active: "good", replied: "good", shipped: "warn", processing: "warn", pending: "warn", placed: "warn", new: "warn", draft: "neutral", read: "neutral", cancelled: "bad", rejected: "bad", out_of_stock: "bad", archived: "neutral", failed: "bad", refunded: "neutral" })[s] ?? "neutral";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-xs font-medium text-foreground">
        {label}
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
export const td = "px-3 py-2 align-middle";

export function Serp({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="truncate text-xs text-muted-foreground">{url}</p>
      <p className="truncate text-lg leading-snug text-[oklch(0.45_0.18_265)]">{title || "Page title"}</p>
      <p className="line-clamp-2 text-sm text-muted-foreground">{description || "Meta description preview appears here."}</p>
    </div>
  );
}

export const Count = ({ n, max }: { n: number; max: number }) => <span className={n > max ? "text-destructive" : ""}>{n}/{max}</span>;
