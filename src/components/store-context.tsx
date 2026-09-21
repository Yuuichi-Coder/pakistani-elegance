import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";

export type CartItem = { product: Product; size: string; quantity: number };
type Store = { cart: CartItem[]; wishlist: string[]; cartOpen: boolean; quick: Product | null; add: (p: Product, size?: string) => void; remove: (slug: string) => void; setQty: (slug: string, qty: number) => void; toggleWish: (slug: string) => void; setCartOpen: (v: boolean) => void; setQuick: (p: Product | null) => void; clear: () => void };
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]); const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false); const [quick, setQuick] = useState<Product | null>(null);
  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("mf-cart") ?? "[]")); setWishlist(JSON.parse(localStorage.getItem("mf-wishlist") ?? "[]")); } catch { /* clean start */ } }, []);
  useEffect(() => localStorage.setItem("mf-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("mf-wishlist", JSON.stringify(wishlist)), [wishlist]);
  const value = useMemo<Store>(() => ({ cart, wishlist, cartOpen, quick,
    add: (product, size="M") => { setCart((items) => { const found=items.find((i)=>i.product.slug===product.slug&&i.size===size); return found ? items.map((i)=>i===found?{...i,quantity:i.quantity+1}:i) : [...items,{product,size,quantity:1}]; }); setCartOpen(true); },
    remove: (slug) => setCart((items)=>items.filter((i)=>i.product.slug!==slug)), setQty: (slug, quantity) => setCart((items)=>items.map((i)=>i.product.slug===slug?{...i,quantity:Math.max(1,quantity)}:i)),
    toggleWish: (slug) => setWishlist((w)=>w.includes(slug)?w.filter((x)=>x!==slug):[...w,slug]), setCartOpen, setQuick, clear:()=>setCart([]),
  }), [cart,wishlist,cartOpen,quick]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){ const value=useContext(StoreContext); if(!value) throw new Error("StoreProvider missing"); return value; }
