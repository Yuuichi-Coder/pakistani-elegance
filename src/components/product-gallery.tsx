import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

const photos = import.meta.glob("../assets/product-gallery/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const views = [
  { suffix: "full", label: "Full outfit" },
  { suffix: "embroidery", label: "Embroidery detail" },
  { suffix: "finish", label: "Hem and trouser detail" },
] as const;

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const gallery = views.flatMap(({ suffix, label }) => {
    const src = photos[`../assets/product-gallery/${product.slug}-${suffix}.jpg`];
    return src ? [{ src, label }] : [];
  });
  const current = gallery[selected] ?? gallery[0];

  if (!current) return null;

  function goTo(offset: number) {
    setSelected((index) => (index + offset + gallery.length) % gallery.length);
  }

  return (
    <div className="w-full max-w-[440px] min-w-0 justify-self-center md:justify-self-start" aria-label={`${product.name} photo gallery`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <img
          src={current.src}
          alt={`${product.name} — ${current.label.toLowerCase()}`}
          className="h-full w-full object-contain"
          loading="eager"
          fetchPriority="high"
        />
        {gallery.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goTo(-1)}
              aria-label="Previous product image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 shadow-sm"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goTo(1)}
              aria-label="Next product image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 shadow-sm"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product image thumbnails">
          {gallery.map((image, index) => (
            <Button
              key={image.src}
              variant="outline"
              onClick={() => setSelected(index)}
              aria-label={`View ${image.label.toLowerCase()}`}
              aria-pressed={index === selected}
              className={`size-[76px] shrink-0 overflow-hidden rounded-none p-0 ${index === selected ? "border-2 border-primary" : "border border-border"}`}
            >
              <img src={image.src} alt="" className="h-full w-full object-contain" loading="lazy" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}