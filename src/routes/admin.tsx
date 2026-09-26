import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, Package, FolderTree, ShoppingBag, Users, Star, TicketPercent, Inbox, FileText, Search, Settings, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Maryam Fashions" }, { name: "robots", content: "noindex,nofollow" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login" });
    }
    return { adminEmail: data.user.email ?? "" };
  },
  component: AdminLayout,
});

const nav = [
  { group: "Store", items: [
    { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/collections", label: "Collections", icon: FolderTree },
    { to: "/admin/customers", label: "Customers", icon: Users },
  ]},
  { group: "Marketing", items: [
    { to: "/admin/reviews", label: "Reviews", icon: Star },
    { to: "/admin/discounts", label: "Discounts", icon: TicketPercent },
    { to: "/admin/inbox", label: "Inbox", icon: Inbox },
  ]},
  { group: "Site", items: [
    { to: "/admin/content", label: "Content", icon: FileText },
    { to: "/admin/seo", label: "SEO Center", icon: Search },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ]},
] as const;

function AdminLayout() {
  const { adminEmail } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };
  const sidebar = (
    <nav className="flex h-full flex-col bg-footer text-background">
      <div className="flex h-14 items-center justify-between border-b border-background/10 px-5">
        <span className="font-serif text-lg tracking-wide">Maryam <span className="text-gold">Admin</span></span>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((g) => (
          <div key={g.group} className="mb-5">
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-background/45">{g.group}</p>
            {g.items.map((i) => (
              <Link key={i.to} to={i.to} onClick={() => setOpen(false)} activeOptions={{ exact: "exact" in i }}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-background/75 transition-colors hover:bg-background/10 hover:text-background"
                activeProps={{ className: "bg-primary !text-primary-foreground hover:bg-primary" }}>
                <i.icon className="h-4 w-4" /> {i.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-background/10 p-3 text-xs">
        <a href="/" target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 px-2 py-1.5 text-background/70 hover:text-background"><ExternalLink className="h-3.5 w-3.5" /> View storefront</a>
        <p className="truncate px-2 text-background/50">{adminEmail}</p>
        <button onClick={logout} className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-background/80 hover:bg-background/10"><LogOut className="h-4 w-4" /> Log out</button>
      </div>
    </nav>
  );
  return (
    <div className="min-h-screen bg-muted/40 font-sans">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{sidebar}</aside>
      <div className={cn("fixed inset-0 z-40 lg:hidden", open ? "" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-foreground/40 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <aside className={cn("absolute inset-y-0 left-0 w-64 transition-transform", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</aside>
      </div>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="font-serif">Maryam Admin</span>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
