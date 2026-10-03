import { catalogImages } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Renders uploaded image URLs, or the built-in catalog photos (stored as "catalog-<set>-<panel>"). */
export function AdminThumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const m = /^catalog-(\d+)-(\d+)$/.exec(src);
  if (m) {
    const sheet = (catalogImages as Record<string | number, string>)[Number(m[1])] ?? (catalogImages as Record<string | number, string>)[m[1] as string];
    return <div className={cn("product-image overflow-hidden bg-muted", className)}><img src={sheet} alt={alt} className={`catalog-sheet panel-${m[2]}`} /></div>;
  }
  return <img src={src} alt={alt} className={cn("object-contain bg-muted", className)} />;
}
