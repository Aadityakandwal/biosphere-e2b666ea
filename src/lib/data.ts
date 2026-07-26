import neervaAsset from "@/assets/neerva-bottle.png.asset.json";
import snakePlantImg from "@/assets/product-snake-plant.jpg";
import prunerImg from "@/assets/product-pruner.jpg";
import lawnCareImg from "@/assets/service-lawn-care.jpg";
import gardenCareImg from "@/assets/service-garden-care.jpg";

export type Sub = { id: string; name: string; price: number };
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
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800" },
  { slug: "outdoor-setup", name: "Outdoor Plant Setup", category: "setup", emoji: "🌳", price: 1499, duration: "2-3 hrs", rating: 4.7, reviews: 132,
    description: "Design and plant your outdoor greens with soil prep, drainage, and seasonal picks.",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800" },
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
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800" },
  { slug: "garden-inspection", name: "Garden Inspection", category: "consult", emoji: "🔍", price: 599, duration: "1 hr", rating: 4.8, reviews: 143,
    description: "In-person walkthrough with a detailed report on soil, pests, and layout.",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800" },
  { slug: "soil-testing", name: "Soil Testing Guidance", category: "consult", emoji: "🧪", price: 449, duration: "45 min", rating: 4.7, reviews: 87,
    description: "Guided sampling and lab-grade analysis of your soil health.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800" },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  category: "plants" | "tools" | "biovelocity" | "pots";
  image: string;
  short: string;
  popular?: boolean;
};

export const products: Product[] = [
  { id: "neerva", name: "Neerva — Bio Growth Tonic (1L)", price: 249, category: "biovelocity", popular: true,
    image: neervaAsset.url,
    short: "Microbial bio-formula for foliar, soil, and drip application." },
  { id: "monstera", name: "Monstera Deliciosa", price: 649, category: "plants",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800",
    short: "Iconic split-leaf indoor plant." },
  { id: "snake", name: "Snake Plant", price: 349, category: "plants",
    image: snakePlantImg,
    short: "Low-light hardy indoor purifier." },
  { id: "pruner", name: "Bypass Pruner", price: 499, category: "tools",
    image: prunerImg,
    short: "Precision pruning for stems up to 20mm." },
  { id: "trowel", name: "Steel Hand Trowel", price: 249, category: "tools",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    short: "Ergonomic grip, forged steel." },
  { id: "biobloom", name: "BioBloom Flower Booster", price: 349, category: "biovelocity",
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800",
    short: "Organic bloom accelerator." },
  { id: "biorooter", name: "BioRooter Starter", price: 199, category: "biovelocity",
    image: "https://images.unsplash.com/photo-1462530260150-162092dbf011?w=800",
    short: "Microbial root activator." },
  { id: "terracotta", name: "Terracotta Pot (Medium)", price: 179, category: "pots",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800",
    short: "Breathable classic clay pot." },
  { id: "ceramic", name: "Matte Ceramic Planter", price: 549, category: "pots",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800",
    short: "Minimalist indoor planter." },
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
