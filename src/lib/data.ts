import neervaAsset from "@/assets/neerva-bottle-full.png.asset.json";
import biobloomAsset from "@/assets/biobloom-yardhak.png.asset.json";
import snakePlantImg from "@/assets/product-snake-plant.jpg";
import prunerImg from "@/assets/product-pruner.jpg";
import lawnCareImg from "@/assets/service-lawn-care.jpg";
import gardenCareImg from "@/assets/service-garden-care.jpg";
import videoConsultImg from "@/assets/service-video-consult.jpg";
import gardenInspectionImg from "@/assets/service-garden-inspection.jpg";
import soilTestingImg from "@/assets/service-soil-testing.jpg";

export type Sub = { id: string; name: string; price: number };
export type Pkg = {
  id: string;
  name: string;
  includes: string[];
  price: number;
  priceMax: number;
};
export type Service = {
  slug: string;
  name: string;
  category: string;
  emoji: string;
  price: number;
  duration: string;
  description: string;
  image: string;
  subs?: Sub[];
  packages?: Pkg[];
  rating: number;
  reviews: number;
};

export const categories = [
  { id: "setup", name: "Plant Setup", emoji: "🌱" },
  { id: "care", name: "Plant Care & Maintenance", emoji: "🌿" },
  { id: "consult", name: "Gardening Consultation", emoji: "👨‍🌾" },
];

export const services: Service[] = [
  // Plant Setup
  { slug: "indoor-setup", name: "Indoor Plant Setup", category: "setup", emoji: "🪴", price: 799, duration: "1-2 hrs", rating: 4.8, reviews: 214,
    description: "Transform your indoor space with expert placement, potting, and starter plants suited to light and humidity in your home.",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800",
    packages: [
      { id: "sqft-50-100", name: "50–100 sq. ft.", price: 8999, priceMax: 10999,
        includes: ["6 plants", "6 pots", "Grill", "Grow lights", "Healthy soil"] },
      { id: "sqft-100-200", name: "100–200 sq. ft.", price: 14999, priceMax: 17999,
        includes: ["12 plants", "12 pots", "Grill", "Grow lights", "Healthy soil"] },
      { id: "sqft-200-300", name: "200–300 sq. ft.", price: 27999, priceMax: 34999,
        includes: ["25 plants", "25 pots", "Grill", "Grow lights", "Healthy soil"] },
    ] },

  { slug: "outdoor-setup", name: "Outdoor Plant Setup", category: "setup", emoji: "🌳", price: 1499, duration: "2-3 hrs", rating: 4.7, reviews: 132,
    description: "Design and plant your outdoor greens with soil prep, drainage, and seasonal picks.",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
    packages: [
      { id: "sqft-50-100", name: "50–100 sq. ft. (up to 11 sq. gaj)", price: 6999, priceMax: 8499,
        includes: ["6 plants", "6 pots", "Grill / plant stand", "Healthy soil"] },
      { id: "sqft-100-200", name: "100–200 sq. ft.", price: 11999, priceMax: 13999,
        includes: ["12 plants", "12 pots", "Grill / plant stand", "Healthy soil"] },
      { id: "sqft-200-300", name: "200–300 sq. ft.", price: 22999, priceMax: 26999,
        includes: ["25 plants", "25 pots", "Grill / plant stand", "Healthy soil"] },
    ] },
  { slug: "balcony-garden", name: "Balcony Garden Setup", category: "setup", emoji: "🌻", price: 1299, duration: "2 hrs", rating: 4.9, reviews: 341,
    description: "Compact planters, vertical trellises, and low-maintenance flowering plants for balconies of any size.",
    image: "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=800" },
  { slug: "terrace-garden", name: "Terrace Garden Setup", category: "setup", emoji: "🏡", price: 2999, duration: "half day", rating: 4.8, reviews: 98,
    description: "Full terrace transformation with waterproofing-safe planters, seating, and edible or ornamental themes.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800" },
  { slug: "kitchen-garden", name: "Kitchen Garden Setup", category: "setup", emoji: "🥬", price: 999, duration: "2 hrs", rating: 4.9, reviews: 187,
    description: "Grow herbs, greens, and everyday vegetables right outside your kitchen.",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800" },
  // Plant Care
  { slug: "basic-maintenance", name: "Basic Maintenance", category: "care", emoji: "💧", price: 499, duration: "1 hr", rating: 4.7, reviews: 512,
    description: "Routine care by trained gardeners — pick what you need below.",
    image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800",
    subs: [
      { id: "watering", name: "Watering", price: 199 },
      { id: "pruning", name: "Pruning", price: 249 },
      { id: "repotting", name: "Repotting", price: 349 },
    ] },
  { slug: "garden-care", name: "Garden Care", category: "care", emoji: "🌾", price: 799, duration: "1-2 hrs", rating: 4.8, reviews: 289,
    description: "Deeper care for established gardens with health-first practices.",
    image: gardenCareImg,
    subs: [
      { id: "fertilizer", name: "Fertilizer Application", price: 349 },
      { id: "pest", name: "Pest Control", price: 499 },
      { id: "health", name: "Plant Health Check", price: 299 },
      { id: "weed", name: "Weed Removal", price: 249 },
    ] },
  { slug: "lawn-garden", name: "Lawn & Garden Care", category: "care", emoji: "🌱", price: 899, duration: "2 hrs", rating: 4.6, reviews: 156,
    description: "Keep your lawn and edges sharp season after season.",
    image: lawnCareImg,
    subs: [
      { id: "mowing", name: "Lawn Mowing", price: 399 },
      { id: "hedge", name: "Hedge Trimming", price: 449 },
      { id: "weed2", name: "Weed Removal", price: 249 },
    ] },
  // Consultation
  { slug: "video-consult", name: "Video Consultation", category: "consult", emoji: "📹", price: 299, duration: "30 min", rating: 4.9, reviews: 620,
    description: "One-on-one video call with a certified botanist.",
    image: videoConsultImg },
  { slug: "garden-inspection", name: "Garden Inspection", category: "consult", emoji: "🔍", price: 599, duration: "1 hr", rating: 4.8, reviews: 143,
    description: "In-person walkthrough with a detailed report on soil, pests, and layout.",
    image: gardenInspectionImg },
  { slug: "soil-testing", name: "Soil Testing Guidance", category: "consult", emoji: "🧪", price: 449, duration: "45 min", rating: 4.7, reviews: 87,
    description: "Guided sampling and lab-grade analysis of your soil health.",
    image: soilTestingImg },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  /** Original list price (MRP) when the item is discounted. */
  mrp?: number;
  category: "plants" | "tools" | "biovelocity" | "pots";
  image: string;
  short: string;
  /** Long-form product story shown on the detail page. */
  description: string;
  /** Quick bullet highlights shown as a spec list. */
  highlights: string[];
  /** Care / usage guidance shown under the description. */
  care?: string;
  popular?: boolean;
};

export const products: Product[] = [
  { id: "neerva", name: "Neerva — Bio Growth Tonic (1L)", price: 249, mrp: 300, category: "biovelocity", popular: true,
    image: neervaAsset.url,
    short: "Microbial bio-formula for foliar, soil, and drip application.",
    description: "Neerva Biovelocity is a live microbial bio-liquid that rebuilds soil biology instead of force-feeding the plant. The consortium of beneficial bacteria fixes nitrogen, unlocks bound phosphorus and potassium, and improves root uptake — so leaves green up, flowering improves and stress recovery is faster. Safe for edibles, indoor pots and full field use.",
    highlights: ["1 litre concentrate — up to 12 L of spray", "Works as foliar spray, soil drench or drip", "100% organic, residue-free, safe for edibles", "Visible response in 10–14 days"],
    care: "Shake well, dilute with non-chlorinated water and apply early morning or late evening every 7–15 days." },

  { id: "monstera", name: "Monstera Deliciosa", price: 649, category: "plants",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800",
    short: "Iconic split-leaf indoor plant.",
    description: "The Monstera Deliciosa is the statement plant of Indian living rooms — glossy, deeply fenestrated leaves that keep getting bigger as the plant matures. Ours are nursery-grown for at least 8 months, hardened for indoor light, and shipped in a nursery pot with well-draining aroid mix.",
    highlights: ["Height 40–55 cm at delivery", "Bright indirect light", "Air-purifying, pet-caution (mildly toxic if chewed)", "Comes in a nursery pot with aroid mix"],
    care: "Water when the top 2 inches of soil feel dry, wipe leaves fortnightly and feed once a month during monsoon and summer." },

  { id: "snake", name: "Snake Plant", price: 349, category: "plants",
    image: snakePlantImg,
    short: "Low-light hardy indoor purifier.",
    description: "Sansevieria — the plant that forgives everything. It survives low light, irregular watering and air-conditioned rooms, while releasing oxygen at night, which makes it a favourite for bedrooms and study corners. Upright architectural leaves with soft golden margins.",
    highlights: ["Height 30–45 cm at delivery", "Thrives in low to medium light", "Releases oxygen at night", "Needs watering only every 10–15 days"],
    care: "Let the soil dry out fully between waterings. Never let water sit in the saucer — root rot is the only thing that kills it." },

  { id: "pruner", name: "Bypass Pruner", price: 499, category: "tools",
    image: prunerImg,
    short: "Precision pruning for stems up to 20mm.",
    description: "A bypass pruner cuts like scissors rather than crushing the stem, so cuts heal cleanly and disease doesn't get a foothold. Hardened carbon-steel blade with a non-stick coating, ergonomic non-slip handles and a safety lock for storage — comfortable enough for a full afternoon of deadheading.",
    highlights: ["Cuts green stems up to 20 mm", "Non-stick hardened carbon steel blade", "Cushioned anti-slip grip with safety lock", "Replaceable spring, sharpenable blade"],
    care: "Wipe the blade dry after every use and oil the pivot monthly to keep the action smooth." },

  { id: "trowel", name: "Steel Hand Trowel", price: 249, category: "tools",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    short: "Ergonomic grip, forged steel.",
    description: "A single-piece forged steel trowel that won't bend at the neck like pressed-metal ones do. The narrow scoop is sized for potting, transplanting seedlings and mixing compost into pots, with depth markings on the blade so you can plant bulbs at the right depth.",
    highlights: ["One-piece forged steel head", "Depth markings on the blade", "Rust-resistant powder coating", "Hanging loop on the handle"],
    care: "Rinse off soil and dry after use; store indoors during monsoon." },

  { id: "biobloom", name: "BioBloom Flower Booster", price: 349, category: "biovelocity",
    image: biobloomAsset.url,
    short: "Organic bloom accelerator.",
    description: "BioBloom is a potassium- and phosphorus-rich organic bloom stimulant for flowering and fruiting plants. It encourages more flower buds, deeper petal colour and better fruit set in hibiscus, rose, jasmine, chilli and tomato — without the salt build-up you get from chemical bloom boosters.",
    highlights: ["500 ml concentrate", "Boosts bud count and petal colour", "Organic, residue-free on edibles", "Best used through the flowering cycle"],
    care: "Mix 5 ml per litre of water and apply every 10 days from bud formation until flowering ends." },

  { id: "biorooter", name: "BioRooter Starter", price: 199, category: "biovelocity",
    image: "https://images.unsplash.com/photo-1462530260150-162092dbf011?w=800",
    short: "Microbial root activator.",
    description: "BioRooter is a mycorrhiza and beneficial-bacteria blend for the first weeks of a plant's life in your garden. Use it at planting, repotting or on cuttings to trigger faster white-root development, reduce transplant shock and improve water uptake in poor or compacted soil.",
    highlights: ["250 ml root activator", "Ideal for cuttings, seedlings and repotting", "Reduces transplant shock", "Improves water and nutrient uptake"],
    care: "Dilute 10 ml per litre and drench the root zone at planting, then repeat once after 15 days." },

  { id: "terracotta", name: "Terracotta Pot (Medium)", price: 179, category: "pots",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800",
    short: "Breathable classic clay pot.",
    description: "Hand-thrown natural terracotta that breathes — clay walls wick away excess moisture, which is exactly what succulents, herbs and root-rot-prone plants need. Unglazed finish that ages into a beautiful patina, with a wide drainage hole at the base.",
    highlights: ["8 inch diameter, 7 inch depth", "Natural unglazed breathable clay", "Single wide drainage hole", "Suits herbs, succulents and small foliage"],
    care: "Soak a new pot in water for an hour before first planting so it doesn't pull moisture from the soil." },

  { id: "ceramic", name: "Matte Ceramic Planter", price: 549, category: "pots",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800",
    short: "Minimalist indoor planter.",
    description: "A matte-glazed ceramic planter made for indoor styling — soft neutral finish, clean silhouette and a weighted base that keeps top-heavy plants stable. Comes with a matching saucer so it can sit safely on wooden furniture.",
    highlights: ["7 inch diameter with matching saucer", "Matte glaze, neutral finish", "Drainage hole with removable plug", "Stable weighted base for tall plants"],
    care: "Wipe with a damp cloth; keep the drainage plug out when the plant is actively growing." },
];


export const offers = [
  {
    id: "o1",
    title: "First booking 20% OFF",
    subtitle: "Use code BIO20 on checkout",
    code: "BIO20",
    emoji: "🌿",
    gradient: "from-leaf to-emerald-600",
    text: "text-leaf-foreground",
  },
  {
    id: "o2",
    title: "Buy 2 Biovelocity get 1 free",
    subtitle: "Stock up on Neerva & BioBloom",
    code: "BIO3",
    emoji: "🧪",
    gradient: "from-amber-300 to-orange-400",
    text: "text-amber-950",
  },
  {
    id: "o3",
    title: "Free consultation on setup",
    subtitle: "Book any setup + video call FREE",
    code: "FREEDR",
    emoji: "📹",
    gradient: "from-sky-300 to-blue-500",
    text: "text-sky-950",
  },
];

export const reviews = [
  { name: "Priya S.", rating: 5, service: "Balcony Garden Setup", text: "Ravi turned our tiny 4x6 balcony into a proper green corner. He explained sun timings and even labelled the pots. Two weeks in and everything's thriving." },
  { name: "Aditya M.", rating: 5, service: "AI Plant Doctor", text: "Uploaded a pic of my curling money plant leaves — got a solid answer in seconds. Bought the recommended Neerva, leaves look better already." },
  { name: "Sneha R.", rating: 4, service: "Video Consultation", text: "Booked a 30 min call for our terrace. Botanist was patient and gave a plant list within our budget. Would've liked a followup summary email but overall great." },
  { name: "Karthik N.", rating: 5, service: "Garden Care", text: "The gardener showed up on time, cleaned up after pruning, and told me exactly when to fertilise next. Solid work." },
  { name: "Meera V.", rating: 5, service: "Kitchen Garden Setup", text: "Coriander, methi, mint and tulsi all in raised planters — my kid loves watering them every evening now. Worth every rupee." },
  { name: "Rohan D.", rating: 4, service: "Lawn Mowing", text: "Neat job, edges done properly. Just wish they carried away the clippings, small thing." },
];

export type SeasonalTip = {
  id: string;
  tag: string;
  title: string;
  description: string;
  readTime: string;
  image: string;
};

export const seasonalTips: SeasonalTip[] = [
  {
    id: "t1",
    tag: "Summer Care",
    title: "Beat the heat without burning leaves",
    description: "Water early morning or after sunset to avoid leaf scorch and evaporation loss.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400",
  },
  {
    id: "t2",
    tag: "Monsoon Care",
    title: "Drainage is everything",
    description: "Check pot drainage holes weekly — waterlogged roots are the #1 killer this season.",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400",
  },
  {
    id: "t3",
    tag: "Winter Care",
    title: "Keep tropicals cosy",
    description: "Move tropical plants away from cold window glass at night and avoid overwatering.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
  },
  {
    id: "t4",
    tag: "Autumn Prep",
    title: "Slow down on fertiliser",
    description: "Reduce fertiliser as growth naturally slows down; let plants rest before winter.",
    readTime: "2 min read",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
  },
  {
    id: "t5",
    tag: "Pest Control",
    title: "Spot pests before they spread",
    description: "Inspect leaf undersides every few days; neem oil works wonders on early infestations.",
    readTime: "5 min read",
    image: gardenCareImg,
  },
  {
    id: "t6",
    tag: "Repotting",
    title: "Roots need room to breathe",
    description: "If roots peek through the drainage hole, it's time to repot in fresh, airy soil.",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400",
  },
  {
    id: "t7",
    tag: "Indoor Plants",
    title: "Rotate for even growth",
    description: "Give your pots a quarter turn every week so all sides get balanced light.",
    readTime: "2 min read",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
  },
  {
    id: "t8",
    tag: "Kitchen Garden",
    title: "Harvest herbs the right way",
    description: "Snip herbs from the top to encourage bushier growth and a longer harvest window.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400",
  },
];

export const initialBookings = [
  { id: "b1", serviceSlug: "balcony-garden", date: "2026-08-02", time: "10:00 AM", gardener: "Ravi K.", address: "Flat 402, Green Meadows", status: "upcoming" as const, price: 1299 },
  { id: "b2", serviceSlug: "video-consult", date: "2026-07-30", time: "6:00 PM", gardener: "Dr. Anita R.", address: "Video call", status: "upcoming" as const, price: 299 },
  { id: "b3", serviceSlug: "basic-maintenance", date: "2026-06-10", time: "9:00 AM", gardener: "Suresh P.", address: "Flat 402, Green Meadows", status: "past" as const, price: 499, photos: ["https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600"] },
  { id: "b4", serviceSlug: "kitchen-garden", date: "2026-05-22", time: "11:00 AM", gardener: "Ravi K.", address: "Flat 402, Green Meadows", status: "past" as const, price: 999, photos: ["https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600"] },
];

export const initialOrders = [
  {
    id: "ord-1051",
    date: "2026-07-24",
    total: 747,
    items: ["Neerva — Bio Growth Tonic (1L) x2", "BioRooter Starter"],
    status: "Out for delivery",
    eta: "Arriving today by 7 PM",
    stage: 2,
    address: "Flat 402, Green Meadows, Greenwich",
    images: [neervaAsset.url, "https://images.unsplash.com/photo-1462530260150-162092dbf011?w=400"],
  },
  {
    id: "ord-1048",
    date: "2026-07-21",
    total: 1198,
    items: ["Monstera Deliciosa", "Matte Ceramic Planter"],
    status: "Shipped",
    eta: "Arriving Tue, 28 Jul",
    stage: 1,
    address: "Flat 402, Green Meadows, Greenwich",
    images: [
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400",
    ],
  },
  {
    id: "ord-1042",
    date: "2026-07-12",
    total: 498,
    items: ["Neerva — Bio Growth Tonic (1L) x2"],
    status: "Delivered",
    deliveredOn: "Delivered on Sat, 14 Jul",
    stage: 3,
    address: "Flat 402, Green Meadows, Greenwich",
    images: [neervaAsset.url],
  },
  {
    id: "ord-1039",
    date: "2026-06-28",
    total: 1198,
    items: ["Monstera Deliciosa", "Matte Ceramic Planter"],
    status: "Delivered",
    deliveredOn: "Delivered on Mon, 30 Jun",
    stage: 3,
    address: "Flat 402, Green Meadows, Greenwich",
    images: [
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400",
    ],
  },
];


export const membershipPlans = [
  { id: "basic", name: "Basic", price: 199, perks: ["6 AI Scans/day", "5% OFF paid gardener visits", "1 Free Video Call/mo", "Green Points"] },
  { id: "pro", name: "Pro", price: 399, popular: true, perks: ["15 AI Scans/day", "10% OFF paid gardener visits", "2 Free Video Calls/mo", "Double Green Points", "1 quarterly/monthly inspection visit"] },
  { id: "elite", name: "Elite", price: 699, perks: ["Unlimited AI Scans", "15% OFF paid gardener visits", "3 Free Video Calls/mo", "VIP Priority", "1 On-site Visit/month included"] },
];
