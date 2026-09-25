import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { collections, money, products } from "@/lib/catalog";
import { ProductGrid } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const PRICE_MIN = 2500;
const PRICE_MAX = 15000;
const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const Route=createFileRoute("/collections/$slug")({beforeLoad:({params})=>{if(!collections.some(c=>c[0]===params.slug))throw notFound()},head:({params})=>{const n=collections.find(c=>c[0]===params.slug)?.[1]??"Collection";return{meta:[{title:`${n} — Maryam Fashions`},{name:"description",content:`Shop ${n.toLowerCase()} at Maryam Fashions. Premium Pakistani suits with free nationwide delivery.`},{property:"og:title",content:`${n} — Maryam Fashions`},{property:"og:description",content:`Explore our curated ${n.toLowerCase()} collection.`},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}],links:[{rel:"canonical",href:`/collections/${params.slug}`}]}},component:CollectionPage});
function CollectionPage() {
  const { slug } = Route.useParams();
  const name = collections.find(c => c[0] === slug)?.[1] ?? "Collection";
  const [sort, setSort] = useState("featured");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState([PRICE_MIN, PRICE_MAX]);

  const list = useMemo(() => {
    const minPrice = price[0] ?? PRICE_MIN;
    const maxPrice = price[1] ?? PRICE_MAX;
    const filtered = products.filter(p =>
      (slug === "sale" || slug === "flat-30-off" || slug === "new-arrivals" || p.collection === slug || (slug === "summer-collection" && p.fabric.includes("Lawn"))) &&
      (!fabric || p.fabric === fabric) && p.price >= minPrice && p.price <= maxPrice
    );
    // Every current style is offered in XS–XL; choosing a size retains all available styles.
    return filtered.sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.rating - a.rating);
  }, [slug, sort, fabric, price]);

  const clearFilters = () => { setFabric(""); setSize(""); setPrice([PRICE_MIN, PRICE_MAX]); };

  return <div>
    <div className="bg-muted px-4 py-14 text-center"><p className="text-xs uppercase tracking-[.25em] text-gold">Maryam Fashions</p><h1 className="mt-2 font-display text-4xl md:text-5xl">{name}</h1><p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Curated Pakistani craftsmanship, considered color and beautifully finished fabric.</p></div>
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-[220px_1fr] lg:px-8">
      <aside aria-label="Filter products" className="min-w-0">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-widest"><SlidersHorizontal className="size-4"/>Filter</div>
        <label className="block text-xs font-semibold uppercase">Fabric
          <span className="relative mt-2 block">
            <select value={fabric} onChange={e=>setFabric(e.target.value)} className="h-11 w-full appearance-none rounded-sm border border-input bg-background py-2 pl-3 pr-11 text-sm font-normal normal-case text-foreground">
              <option value="">All fabrics</option>{[...new Set(products.map(p=>p.fabric))].map(x=><option key={x}>{x}</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
          </span>
        </label>
        <div className="mt-6"><p className="text-xs font-semibold uppercase">Size</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">{SIZES.map(x=><Button key={x} size="icon" variant="outline" aria-label={`Size ${x}`} aria-pressed={size===x} onClick={()=>setSize(size===x?"":x)} className={`h-10 w-full min-w-0 px-0 tracking-normal ${size===x?"border-primary bg-primary text-primary-foreground hover:bg-primary/90":""}`}>{x}</Button>)}</div>
        </div>
        <div className="mt-6"><p className="text-xs font-semibold uppercase">Price</p>
          <p aria-live="polite" className="mt-3 text-sm text-foreground">{money(price[0] ?? PRICE_MIN)} — {money(price[1] ?? PRICE_MAX)}</p>
          <Slider aria-label="Price range" min={PRICE_MIN} max={PRICE_MAX} step={100} minStepsBetweenThumbs={1} value={price} onValueChange={setPrice} className="mt-4 h-5"/>
        </div>
        <Button variant="link" size="sm" onClick={clearFilters} disabled={!fabric&&!size&&price[0]===PRICE_MIN&&price[1]===PRICE_MAX} className="mt-5 h-auto px-0 text-xs font-semibold normal-case tracking-normal">Clear Filters</Button>
      </aside>
      <section className="min-w-0"><div className="mb-6 flex items-center justify-between"><p className="text-sm text-muted-foreground">{list.length} styles</p><select value={sort} onChange={e=>setSort(e.target.value)} className="border border-input bg-background p-2 text-sm"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div><ProductGrid items={list}/><div className="mt-12 flex justify-center gap-2"><button className="grid size-10 place-items-center bg-primary text-primary-foreground">1</button><button className="grid size-10 place-items-center border border-border">2</button></div></section>
    </div>
  </div>;
}