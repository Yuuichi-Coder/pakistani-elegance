import catalogOne from "@/assets/catalog-set-1.jpg";
import catalogTwo from "@/assets/catalog-set-2.jpg";
import catalogThree from "@/assets/catalog-set-3.jpg";

export type Product = {
  slug: string; name: string; sku: string; price: number; compareAt: number;
  fabric: string; color: string; collection: string; set: 1 | 2 | 3; panel: number;
  rating: number; reviews: number; description: string;
};

export const collections = [
  ["new-arrivals", "New Arrivals"], ["eid-collection", "Eid Collection"],
  ["festive-wear", "Festive Wear"], ["luxury-lawn", "Luxury Lawn"],
  ["luxury-pret", "Luxury Pret"], ["riwaayat", "Riwaayat"], ["sale", "Sale"],
  ["flat-30-off", "Flat 30% Off"], ["wedding-wears", "Wedding Wears"],
  ["summer-collection", "Summer Collection"],
] as const;

export const products: Product[] = [
  { slug:"mehrunnisa-crimson-lawn", name:"Mehrunnisa Crimson Lawn", sku:"MF-SL-101", price:6290, compareAt:8990, fabric:"Embroidered Lawn", color:"Crimson", collection:"eid-collection", set:1, panel:0, rating:4.9, reviews:38, description:"A regal crimson three-piece lawn suit traced with antique gold embroidery and a sweeping printed dupatta." },
  { slug:"gul-e-rana-blush", name:"Gul-e-Rana Blush", sku:"MF-SL-102", price:5590, compareAt:6990, fabric:"Printed Lawn", color:"Blush Pink", collection:"new-arrivals", set:1, panel:1, rating:4.8, reviews:27, description:"A soft blush floral lawn set with delicate threadwork and an airy coordinated dupatta." },
  { slug:"aab-e-noor-aqua", name:"Aab-e-Noor Aqua", sku:"MF-SL-103", price:6490, compareAt:7990, fabric:"Embroidered Lawn", color:"Aqua", collection:"summer-collection", set:1, panel:2, rating:4.7, reviews:19, description:"Cool aqua lawn illuminated by ivory embroidery for effortless summer occasions." },
  { slug:"sapphire-meadow", name:"Sapphire Meadow", sku:"MF-SL-104", price:6990, compareAt:9990, fabric:"Luxury Lawn", color:"Teal", collection:"luxury-lawn", set:1, panel:3, rating:4.9, reviews:46, description:"Deep teal and ivory florals compose a graceful three-piece lawn ensemble." },
  { slug:"mahnoor-lilac", name:"Mahnoor Lilac", sku:"MF-RW-201", price:7490, compareAt:9490, fabric:"Organza Lawn", color:"Lilac", collection:"eid-collection", set:2, panel:0, rating:4.8, reviews:21, description:"A lilac embroidered silhouette with scalloped borders and subtle festive shimmer." },
  { slug:"gulnaar-rose", name:"Gulnaar Rose", sku:"MF-RW-202", price:7190, compareAt:8990, fabric:"Embroidered Lawn", color:"Dusty Rose", collection:"riwaayat", set:2, panel:1, rating:4.7, reviews:16, description:"Dusty rose threadwork and tonal embellishment create an elegant day-to-evening look." },
  { slug:"sabz-bahar", name:"Sabz Bahar", sku:"MF-RW-203", price:5890, compareAt:7490, fabric:"Printed Lawn", color:"Emerald", collection:"riwaayat", set:2, panel:2, rating:4.9, reviews:31, description:"Emerald botanical motifs meet a dramatic printed dupatta in this Riwaayat signature." },
  { slug:"rani-festive", name:"Rani Festive", sku:"MF-FW-204", price:7990, compareAt:10990, fabric:"Dobby Lawn", color:"Fuchsia", collection:"festive-wear", set:2, panel:3, rating:4.8, reviews:24, description:"Saturated fuchsia with antique gold embroidery for joyful festive dressing." },
  { slug:"siyah-zari-pret", name:"Siyah Zari Pret", sku:"MF-LP-301", price:10990, compareAt:13990, fabric:"Luxury Organza", color:"Black", collection:"luxury-pret", set:3, panel:0, rating:4.9, reviews:52, description:"Black luxury pret finished with ornate antique gold borders and a sheer dupatta." },
  { slug:"jamawar-plum", name:"Jamawar Plum", sku:"MF-WW-302", price:12490, compareAt:15990, fabric:"Chiffon", color:"Plum", collection:"wedding-wears", set:3, panel:1, rating:4.8, reviews:33, description:"Plum formalwear richly worked in tonal zari for wedding-season evenings." },
  { slug:"riwaayat-ivory-teal", name:"Riwaayat Ivory & Teal", sku:"MF-RW-303", price:8490, compareAt:10990, fabric:"Luxury Lawn", color:"Ivory & Teal", collection:"riwaayat", set:3, panel:2, rating:4.9, reviews:41, description:"An ivory canvas framed by teal heritage motifs and a jewel-toned dupatta." },
  { slug:"surkh-mehfil", name:"Surkh Mehfil", sku:"MF-WW-304", price:9990, compareAt:12990, fabric:"Jacquard", color:"Ruby Red", collection:"wedding-wears", set:3, panel:3, rating:4.8, reviews:29, description:"Ruby red formal lawn with intricate gold embroidery for celebratory gatherings." },
];

export const catalogImages = { 1: catalogOne, 2: catalogTwo, 3: catalogThree };
export const money = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
