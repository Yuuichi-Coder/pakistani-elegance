import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin sign in — Maryam Fashions" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) { setErr("Incorrect email or password."); setBusy(false); return; }
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) { await supabase.auth.signOut(); setErr("This account does not have admin access."); setBusy(false); return; }
    navigate({ to: "/admin" });
  };
  return (
    <main className="grid min-h-screen place-items-center bg-footer px-4 font-sans">
      <form onSubmit={submit} className="w-full max-w-sm rounded-md bg-background p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Lock className="h-4 w-4" /></span>
          <div><p className="font-serif text-xl">Maryam Fashions</p><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin console</p></div>
        </div>
        <label className="mb-3 block text-xs font-medium">Email<input type="email" required autoComplete="username" className={inputCls + " mt-1.5"} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="mb-4 block text-xs font-medium">Password<input type="password" required autoComplete="current-password" className={inputCls + " mt-1.5"} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {err && <p role="alert" className="mb-3 text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>
    </main>
  );
}
