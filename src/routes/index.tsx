import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroDesktop from "@/assets/maryam-hero-desktop.webp.asset.json";
import heroMobile from "@/assets/maryam-hero-mobile.webp.asset.json";
import { products } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";
import { ProductGrid, SectionTitle, TrustStrip } from "@/components/sections";

export const Route = createFileRoute("/")({
  head:()=>({meta:[{title:"Maryam Fashions — Pakistani Lawn & Embroidered Suits"},{name:"description",content:"Shop premium Pakistani lawn, luxury pret, festive and embroidered suits with free nationwide delivery."},{property:"og:title",content:"Maryam Fashions — Pakistani Lawn & Embroidered Suits"},{property:"og:description",content:"Discover the Sapphire Cotton Collection and timeless Pakistani womenswear."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}],links:[{rel:"canonical",href:"/"},{rel:"preload",as:"image",href:heroDesktop.url,media:"(min-width: 640px)"},{rel:"preload",as:"image",href:heroMobile.url,media:"(max-width: 639px)"}],scripts:[{type:"application/ld+json",children:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:"Maryam Fashions",telephone:"+923064777251"})},{type:"application/ld+json",children:JSON.stringify({"@context":"https://schema.org","@type":"WebSite",name:"Maryam Fashions",url:"/",potentialAction:{"@type":"SearchAction",target:"/search?q={search_term_string}","query-input":"required name=search_term_string"}})}]}),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const [tab,setTab]=useState("riwaayat"); const [time,setTime]=useState(8*3600+42*60+18);
  useEffect(()=>{const t=setInterval(()=>setTime(v=>v>0?v-1:24*3600),1000);return()=>clearInterval(t)},[]);
  const fmt=(n:number)=>String(n).padStart(2,"0");
  return <>
    <section className="relative bg-foreground"><picture><source media="(max-width: 639px)" srcSet={heroMobile.url}/><img src={heroDesktop.url} alt="Sapphire Cotton Collection by Maryam Fashions, teal embroidered suits in a garden" width={1370} height={688} fetchPriority="high" className="h-[76vh] min-h-[560px] w-full object-cover sm:h-auto sm:min-h-0"/></picture><div className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:bottom-10"><Link to="/collections/$slug" params={{slug:"luxury-lawn"}} className="inline-flex bg-primary px-7 py-3 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground shadow-xl">Shop the collection</Link></div></section>
    <section className="mx-auto max-w-5xl px-4 py-10"><h1 className="sr-only">Maryam Fashions Pakistani lawn and embroidered suits</h1><div className="flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-5">{([{i:0,n:"New Arrivals",slug:"new-arrivals"},{i:4,n:"Eid Edit",slug:"eid-collection"},{i:8,n:"Luxury Pret",slug:"luxury-pret"},{i:10,n:"Riwaayat",slug:"riwaayat"},{i:7,n:"Sale",slug:"sale"}] as const).map(({i,n,slug})=>{const product=products[i];if(!product)return null;return <Link key={slug} to="/collections/$slug" params={{slug}} className="min-w-24 snap-start text-center"><ProductImage product={product} className="mx-auto aspect-square w-24 rounded-full border-2 border-background shadow-md sm:w-full"/><span className="mt-3 block text-xs font-semibold uppercase tracking-wider">{n}</span></Link>})}</div></section>
    <section className="bg-muted py-14"><div className="mx-auto max-w-[1440px] px-4 lg:px-8"><div className="mb-8 flex flex-col gap-2 border-y border-primary py-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-bold uppercase tracking-[.2em] text-primary">Flat 30% Off — Limited Time</span><div className="font-display text-2xl">Sale ends in {fmt(Math.floor(time/3600))}:{fmt(Math.floor(time%3600/60))}:{fmt(time%60)}</div></div><div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 lg:gap-6">{products.slice(0,7).map(p=><div key={p.slug} className="w-[74vw] max-w-[300px] shrink-0 snap-start sm:w-[40vw] lg:w-[calc((100%-4.5rem)/4)] lg:max-w-none"><ProductCard product={p}/></div>)}</div></div></section>
    <section className="mx-auto max-w-[1440px] px-4 py-16 lg:px-8"><SectionTitle kicker="Just landed" title="New Arrivals" link="new-arrivals"/><ProductGrid items={products.slice(0,8)}/></section>
    <section className="border-y border-border py-16"><div className="mx-auto max-w-[1440px] px-4 lg:px-8"><SectionTitle kicker="A season in bloom" title="Summer Collection"/><div className="mb-8 flex justify-center gap-6">{([{slug:"riwaayat",name:"Riwaayat"},{slug:"luxury-pret",name:"Luxury Pret"},{slug:"sale",name:"Sale"}] as const).map(x=><button key={x.slug} onClick={()=>setTab(x.slug)} className={`border-b-2 pb-2 text-xs font-bold uppercase tracking-widest ${tab===x.slug?"border-primary text-primary":"border-transparent"}`}>{x.name}</button>)}</div><ProductGrid items={products.filter(p=>tab==="sale"||p.collection===tab).slice(0,4)}/></div></section><TrustStrip/>
  </>;
}
