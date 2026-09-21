import { Heart, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { money, type Product } from "@/lib/catalog";
import { ProductImage } from "./product-image";
import { useStore } from "./store-context";
import { Button } from "./ui/button";

export function ProductCard({ product }: { product: Product }) { const s=useStore(); const off=Math.round((1-product.price/product.compareAt)*100);
  return <article className="group min-w-0">
    <div className="relative overflow-hidden bg-muted">
      <Link to="/product/$slug" params={{slug:product.slug}} aria-label={`View ${product.name}`}><ProductImage product={product} className="aspect-[2/3] transition duration-500 group-hover:scale-[1.02]" /></Link>
      <span className="absolute left-2 top-2 bg-primary px-2 py-1 text-[10px] font-bold uppercase text-primary-foreground">Sale</span>
      <button onClick={()=>s.toggleWish(product.slug)} aria-label={`Add ${product.name} to wishlist`} className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-background/95 shadow-sm"><Heart className={`size-4 ${s.wishlist.includes(product.slug)?"fill-primary text-primary":""}`} /></button>
      <Button onClick={()=>s.setQuick(product)} className="absolute inset-x-3 bottom-3 translate-y-16 bg-background text-foreground opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100"><Eye className="size-4"/> Quick view</Button>
    </div>
    <div className="pt-3 text-center"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{product.fabric}</p><Link to="/product/$slug" params={{slug:product.slug}} className="mt-1 block font-display text-lg leading-tight hover:text-primary">{product.name}</Link><div className="mt-1 flex items-center justify-center gap-2 text-sm"><span className="text-muted-foreground line-through">{money(product.compareAt)}</span><strong className="text-primary">{money(product.price)}</strong><span className="bg-sale-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">-{off}%</span></div></div>
  </article>;
}
