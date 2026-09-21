import { catalogImages, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";
export function ProductImage({ product, className, priority=false }: { product: Product; className?: string; priority?: boolean }) {
  return <div className={cn("product-image overflow-hidden bg-muted", className)}><img src={catalogImages[product.set]} className={`catalog-sheet panel-${product.panel}`} alt={`${product.name} ${product.color} Pakistani embroidered suit`} width={1600} height={1200} loading={priority?"eager":"lazy"} /></div>;
}
