import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminMutate } from "@/lib/admin.functions";

export const rs = (n: number | null | undefined) => `Rs. ${(n ?? 0).toLocaleString("en-PK")}`;
export const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
export const db = supabase as any;

export function useAdminQuery<T = any>(key: unknown[], fn: () => PromiseLike<{ data: any; error: any }>) {
  return useQuery<T>({
    queryKey: ["admin", ...key],
    queryFn: async () => {
      const { data, error } = await fn();
      if (error) throw new Error(error.message);
      return data as T;
    },
  });
}

type MutateInput = { table: string; op: "insert" | "update" | "delete" | "upsert"; ids?: string[]; match?: Record<string, string>; values?: unknown };

export function useAdminMutate(success?: string) {
  const fn = useServerFn(adminMutate);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: MutateInput) => fn({ data: d as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      if (success) toast.success(success);
    },
    onError: (e: Error) => toast.error(readError(e)),
  });
}

export function readError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  try {
    const j = JSON.parse(m);
    if (Array.isArray(j)) return j.map((x) => `${x.path?.join(".")}: ${x.message}`).join(", ");
  } catch {}
  return m;
}

export async function uploadMedia(file: File, folder: string) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw new Error(e2?.message ?? "Upload failed");
  return data.signedUrl;
}

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export const LOW_STOCK = 5;
