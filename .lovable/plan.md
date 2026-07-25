
# Biosphere App — Build Plan

A mobile-first plant care & gardening services app with 5 main tabs: Home, Services, Bookings, Shop, Profile. Built entirely as a frontend prototype with mock/in-memory data (no backend yet). Reference HTML/screenshots inform structure and vibe; content follows your written spec exactly.

## Scope & assumptions
- **Frontend only, mock data.** No Lovable Cloud, no auth, no payments SDK. Cart, orders, bookings, profile edits, and AI Plant Doctor results are simulated in local state (Zustand + localStorage). This keeps the build focused on UX. Real backend/auth/payments/AI can be added in a follow-up.
- **AI Plant Doctor** shows a canned diagnosis + Neerva recommendation after upload (no real model call).
- **Mobile-first** layout (max-width container), sticky top header + bottom nav on all main tabs.
- **Design**: clean botanical theme — off-white background, deep green primary, soft cards, rounded-2xl, subtle shadows. Not the generic purple-gradient look.
- **Currency** ₹. **Reviews, products, offers, tips** are seeded fake data.

## Routes (TanStack Start, file-based)
```
/                     Home
/services             Services list + search + filter + offers
/services/$slug       Service detail (with subcategories)
/services/$slug/book  Booking flow (date/address → notes/extras → payment)
/bookings             Upcoming | Past tabs
/bookings/$id         Booking detail (manage / reschedule / rate / photos)
/shop                 Shop grid + categories + search + orders drawer
/shop/$productId      Product detail (Neerva page fully written)
/cart                 Cart + checkout
/orders               Order history (from cart icon in header)
/profile              Profile hub
/profile/edit         Edit info
/profile/bookings     My bookings shortcut
/profile/green-points Redeem (Neerva @ 2500 pts)
/profile/membership   Basic / Pro / Elite plans
/profile/settings     Settings
/profile/support      Help & Support (WhatsApp / email / phone)
/consult              Virtual botanist booking
```

## Shared UI
- **AppHeader**: Biosphere logo + name (left); Orders, Cart (badge), Profile avatar (right).
- **BottomNav**: Home · Services · Bookings · Shop · Profile.
- Both rendered inside a `_app` layout wrapping all tab routes.

## Home (`/`)
1. Header
2. Search bar (services & products)
3. Offers carousel (fake promos)
4. **AI Plant Doctor** card — upload/camera input → mock analysis → diagnosis + recommended Biovelocity product (Neerva)
5. **Virtual Botanist Consultation** card → `/consult` booking
6. **Shop Categories** — 4 tiles + "View all" → `/shop`
7. **Popular Services** — 3 cards + "View all" → `/services`
8. **Seasonal Tips** — daily tip (mock geo/season)
9. **Reviews** — 6 realistic fake reviews (name, rating, service, short human copy)
10. BottomNav

## Services (`/services`)
- Search + filter icon (opens filter sheet: price, rating, category)
- Offers strip (service-only offers)
- Categorized list with these exact categories/subs:
  - **Plant Setup**: Indoor, Outdoor, Balcony, Terrace, Kitchen (+ "others coming soon")
  - **Plant Care & Maintenance**:
    - Basic maintenance → watering, pruning, repotting
    - Garden care → fertilizer, pest control, plant health, weed removal
    - Lawn & Garden Care → mowing, hedge trimming, weed removal
  - **Gardening Consultation**: Video Consultation, Garden Inspection, Soil Testing Guidance
  - **All Services** tab
- Service detail page: description, price, duration, subcategory chooser (multi-select where applicable), reviews, **Book Service** CTA.

## Booking flow (`/services/$slug/book`)
Stepper with 3 steps:
1. **Date & Address**: calendar → available time slots → pick/add address
2. **Notes & Extras**: free-text note; "Extend previous service?" checklist (last 5 bookings, pick gardener → shows availability or "not available"); featured Biovelocity products to add to cart
3. **Payment**: itemized summary (service + extras + taxes) + Pay button (mock success)

## Bookings (`/bookings`)
- Tabs: **Upcoming** | **Past**
- Upcoming card: date/time/service/gardener → **Manage details** + **Reschedule**
  - Reschedule: shows 10% fee, slot picker locked to ≥24h ahead of original slot, checkout
- Past card: → **Details** (info + gardener's post-service photos + **Rate service**) + **Rebook**

## Shop (`/shop`)
- Search (left) + Orders (right, opens order list w/ details, invoice download stub, track package stub)
- Filter button
- Category chips: All, Plants, Tools, Biovelocity, [+ small extras]
- Product grid with fake images (Unsplash hotlinks) + prices in ₹
- **Neerva product page** fully written: shake/dilute/apply/repeat, dilution table (foliar 70–80ml, drench 150–170ml, drip), best practices ✅/❌, size **1 L – ₹249 · Most Popular**

## Cart & Orders
- Cart: line items, qty, remove, subtotal, checkout (mock)
- Orders: past orders w/ status, invoice/track stubs

## Profile (`/profile`)
- Avatar + name + email
- 3 stat tiles: Green Points · My Bookings · (Orders)
- Sections list:
  1. My Profile → edit
  2. My Bookings
  3. **Redeem Green Points** — earn rule shown (₹100 spent = 50 pts; 1 pt = ₹0.10). Redeem tile: **Neerva — 2500 pts**
  4. **Membership Pass** — Basic ₹199 / Pro ₹399 / Elite ₹699 (monthly/yearly toggle) with the exact perks you listed
  5. Settings (notifications, language, units, location, privacy, logout)
  6. Help & Support (WhatsApp chatbot link, email, phone)

## State (client-only)
- `useCartStore`, `useBookingsStore`, `useOrdersStore`, `useProfileStore`, `useGreenPointsStore` — Zustand + `persist` to localStorage.
- Seed data files: `services.ts`, `products.ts`, `offers.ts`, `reviews.ts`, `tips.ts`, `bookings.seed.ts`.

## Tech
- TanStack Start (existing template), Tailwind v4, shadcn components (Button, Card, Sheet, Dialog, Tabs, Input, Calendar, Badge, Avatar), lucide-react icons, Zustand for state.
- Design tokens updated in `src/styles.css`: green-based palette, off-white bg.
- Each route sets its own `head()` (title/description/og).

## Out of scope (flag for later)
- Real auth, real payments, real AI vision, real geolocation, real invoices/tracking, backend persistence, push notifications, membership billing.

## Build order
1. Design tokens + AppHeader + BottomNav + `_app` layout
2. Seed data + Zustand stores
3. Home
4. Services list + detail + booking flow
5. Bookings tabs + detail + reschedule
6. Shop + Neerva product + Cart + Orders
7. Profile hub + subpages (edit, green points, membership, settings, support)
8. Polish, empty states, head() metadata per route
