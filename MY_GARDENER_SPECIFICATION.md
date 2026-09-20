# MY GARDENER — Complete Platform Specification & AI Context Guide

> **Document Version:** 2.0  
> **Official Product Name:** MY GARDENER  
> **Core Philosophy:** *"My Gardener is a garden management platform, not simply a gardener-booking app. The entire experience revolves around the customer's actual garden, its health, its plants, its history, and its required care."*

---

## Table of Contents
1. [Executive Overview & Brand Identity](#1-executive-overview--brand-identity)
2. [Technology Stack & Architecture](#2-technology-stack--architecture)
3. [Design System & UI/UX Principles](#3-design-system--uiux-principles)
4. [Application Navigation & Route Map](#4-application-navigation--route-map)
5. [Core Feature Breakdown & Detailed User Flows](#5-core-feature-breakdown--detailed-user-flows)
   - [5.1 Home Screen](#51-home-screen)
   - [5.2 Free Garden Check (Acquisition Engine)](#52-free-garden-check-acquisition-engine)
   - [5.3 Garden Dashboard (The Digital Garden Record)](#53-garden-dashboard-the-digital-garden-record)
   - [5.4 AI Plant Doctor (Detailed AI Plant Health Analysis)](#54-ai-plant-doctor-detailed-ai-plant-health-analysis)
   - [5.5 AI → Garden Dashboard Approval Flow](#55-ai--garden-dashboard-approval-flow)
   - [5.6 Services: Garden Care Plans & One-Time Services](#56-services-garden-care-plans--one-time-services)
   - [5.7 Booking & Checkout Flow](#57-booking--checkout-flow)
   - [5.8 Botanical Shop & E-Commerce](#58-botanical-shop--e-commerce)
   - [5.9 Green Points Loyalty Program](#59-green-points-loyalty-program)
   - [5.10 Profile & Account Management](#510-profile--account-management)
6. [Data Models & State Management](#6-data-models--state-management)
7. [Database Schema (Supabase)](#7-database-schema-supabase)
8. [Third-Party Integrations & APIs](#8-third-party-integrations--apis)
9. [Key Business Rules & System Invariants](#9-key-business-rules--system-invariants)
10. [Project Directory & File Structure](#10-project-directory--file-structure)

---

## 1. Executive Overview & Brand Identity

### 1.1 Brand Identity
- **Product Name:** `MY GARDENER` (Always uppercase or capitalized as My Gardener).
- **Logo Asset:** `src/assets/my-garden-logo.png` (Must remain strictly unchanged).
- **Positioning:** Premium botanical technology and garden stewardship platform.
- **Terminology Rule:** Always use **"My Gardener professional"** (never "certified gardener" or "trained gardener" unless referring to a specific botanist degree).

### 1.2 What My Gardener Is vs. What It Is NOT
| What My Gardener IS | What My Gardener IS NOT |
| :--- | :--- |
| **A garden management platform** | A generic on-demand home services gig app (e.g. Urban Company) |
| **An ongoing digital record of your garden** | A simple one-off service booking marketplace |
| **An intelligent botanical diagnostic partner** | A generic AI wrapper that invents certainty |
| **Authentic data-first experience** | A dashboard filled with fake soil/moisture/sunlight sensors |
| **Calm, spacious, editorial, botanical aesthetic** | A cluttered, generic SaaS card-stack template |

---

## 2. Technology Stack & Architecture

### 2.1 Core Framework & Runtime
- **Frontend Framework:** `TanStack Start` (Fullstack React 19 framework with Server-Side Rendering / SSR).
- **Routing:** `@tanstack/react-router` (File-based route tree generated in `src/routeTree.gen.ts`).
- **Server Functions:** `createServerFn` from `@tanstack/react-start` for secure server-side API execution.
- **Language:** TypeScript 5.8+ (Strict type safety).
- **Styling Engine:** Tailwind CSS v4 with `@tailwindcss/vite` and custom CSS custom properties in `src/styles.css`.
- **Bundler / Dev Server:** Vite 8.

### 2.2 Backend, Storage & Integrations
- **Authentication & Database:** Supabase (`@supabase/supabase-js`) PostgreSQL database with Row Level Security (RLS).
- **AI Diagnostics:** Google Gemini API (`@google/genai` / `gemini-2.0-flash` endpoint) via server functions.
- **Payment Processing:** Razorpay checkout integration with custom server verification.
- **Local Persistence:** Zustand with `persist` middleware (local storage fallback for offline support).
- **Icons & UI Primitives:** `lucide-react` with Radix UI headless components (`@radix-ui/*`).

---

## 3. Design System & UI/UX Principles

### 3.1 Visual Language: Premium Botanical & Editorial
The design reflects high-end botanical stewardship rather than a SaaS dashboard or e-commerce marketplace:
- **Background Base:** Warm botanical cream / alabaster (`#FBF9F5` / `oklch(0.982 0.008 88)`).
- **Card Surfaces:** Warm ivory / off-white with micro-borders (`#FFFFFF` / `oklch(0.995 0.004 90)`).
- **Primary Brand Accent:** Deep botanical forest green (`#1A3D2F` / `oklch(0.35 0.085 152)`).
- **Secondary Natural Accents:**
  - Warm stone sage: `oklch(0.935 0.02 135)`
  - Terracotta earth: `oklch(0.64 0.13 45)`
  - Muted amber: `oklch(0.85 0.08 85)`
  - Deep slate charcoal text: `oklch(0.20 0.03 155)`
- **Typography:**
  - Display & Headings: `font-display` serif (`Fraunces, ui-serif, Georgia, serif`).
  - Body & Metadata: Clean, legible modern sans-serif (`system-ui, -apple-system, sans-serif`).
  - Section Overlines: Small tracked uppercase (`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em]`).

### 3.2 Spacing & Composition Rules
1. **No "Card Stack" Design:** Do not wrap every element inside a rounded box. Use open layouts, subtle horizontal dividers (`border-t border-border/70`), and generous vertical spacing (40–56px between major sections).
2. **Single Primary CTA per Viewport:** Avoid competing buttons. The primary action (e.g. *"Book Free Garden Check"*) stands out while secondary links use understated text-arrow styling.
3. **Restrained Animations:** Micro-interactions on touch/press (`active:scale-[0.985]`), subtle hover lifts, and smooth page transitions. No excessive floating or bouncy animations.

---

## 4. Application Navigation & Route Map

### 4.1 Global Header (`src/components/Shell.tsx`)
- Logo: Official My Gardener logo linking to `/`.
- Brand text: `My Gardener`.
- Location Picker: Trigger to request or display current service location (used only for service dispatch, not greetings).
- Quick Actions: Cart icon with item count badge (`/cart`), profile avatar shortcut (`/profile`).

### 4.2 Primary Bottom Navigation (5 Tabs)
1. **Home (`/`)**: Curated editorial entry point, Free Garden Check hero, garden overview, AI scanner entry, care plans intro.
2. **Garden (`/garden`)**: Dedicated Garden Dashboard — digital record of plants, issues, visit history, active plan, and saved AI records.
3. **Services (`/services`)**: Restructured into two major tiers: **Garden Care Plans** (recurring memberships) and **One-Time Services** (individual bookings).
4. **Shop (`/shop`)**: Curated botanical shop for nursery plants, precision tools, BioVelocity fertilizers, and planters.
5. **Profile (`/profile`)**: Account management, loyalty Green Points, past orders, settings, and support.

### 4.3 Complete Route Tree
| Route Path | Component File | Description |
| :--- | :--- | :--- |
| `/` | `src/routes/index.tsx` | Editorial Home screen |
| `/garden` | `src/routes/garden.tsx` | Dedicated Garden Dashboard (3-tab record) |
| `/plant-doctor` | `src/routes/plant-doctor.tsx` | AI Plant Doctor camera viewfinder & diagnosis |
| `/services` | `src/routes/services.index.tsx` | Care Plans & One-time services catalog |
| `/services/$slug` | `src/routes/services.$slug.index.tsx` | Service detail page |
| `/services/$slug/book` | `src/routes/services.$slug.book.tsx` | 3-step scheduling, add-ons, and payment/free confirmation |
| `/shop` | `src/routes/shop.index.tsx` | Botanical product catalog with category filter |
| `/shop/$productId` | `src/routes/shop.$productId.tsx` | Product story, specs, care instructions, and Add-to-Cart |
| `/cart` | `src/routes/cart.tsx` | Shopping cart drawer/page |
| `/checkout` | `src/routes/checkout.tsx` | Product checkout with Razorpay payment |
| `/consult` | `src/routes/consult.tsx` | 1-on-1 virtual botanical consultation booking |
| `/bookings` | `src/routes/bookings.index.tsx` | Bookings list (Upcoming vs Past appointments) |
| `/bookings/$id` | `src/routes/bookings.$id.tsx` | Detailed appointment view & gardener details |
| `/bookings/review` | `src/routes/bookings.review.tsx` | Post-service rating and gardener feedback |
| `/profile` | `src/routes/profile.index.tsx` | User profile hub |
| `/profile/membership` | `src/routes/profile.membership.tsx` | Garden Care Plan subscription & billing management |
| `/profile/activity` | `src/routes/profile.activity.tsx` | Unified history of visits and shop orders |
| `/profile/green-points`| `src/routes/profile.green-points.tsx` | Green Points balance and redemption catalog |
| `/profile/edit` | `src/routes/profile.edit.tsx` | Profile information editor |
| `/profile/settings` | `src/routes/profile.settings.tsx` | App preferences, motion toggle, and notifications |
| `/profile/support` | `src/routes/profile.support.tsx` | Customer support channels (WhatsApp, Call, Email) |
| `/auth` | `src/routes/auth.index.tsx` | Authentication (Email OTP / Magic link / Password) |
| `/auth/callback` | `src/routes/auth.callback.tsx` | Auth redirection handler |

---

## 5. Core Feature Breakdown & Detailed User Flows

---

### 5.1 Home Screen
The Home screen is an **editorial gateway**, not an admin dashboard:
1. **Primary Editorial Hero:**
   - **New / Eligible Users:** Large hero promoting the **Free Garden Check** (*"Your garden deserves a proper check."*), explaining the value, with a prominent primary CTA button: `[ Book Free Garden Check → ]`.
   - **Returning Users (Already Claimed):** Inspiring botanical hero (*"Your garden, thriving season after season."*) directing to `[ Open Garden Dashboard → ]`.
2. **My Garden (Compact Editorial Section):**
   - Summarizes real data only (e.g. `3 plants logged · Zero active issues · Next visit: 24 Sept` or `Your garden record starts here. No plants or visits logged yet.`).
   - Clean text link: `Open Garden →`.
3. **AI Plant Doctor Feature Entry:**
   - Highlights the diagnostic tool (*"Something wrong with a plant? Upload a photo for a Detailed AI Plant Health Analysis."*).
   - CTA button: `Scan a Plant with AI →`.
4. **Garden Care Plans Curated Introduction:**
   - Introduces monthly ongoing stewardship or highlights active plan status.
   - Link: `Explore Plans →`.
5. **One-Time Services Introduction:**
   - Highlights setups, maintenance, and consultations with link: `Explore Services →`.

---

### 5.2 Free Garden Check (Acquisition Engine)
A core growth feature offering first-time users a complimentary on-site visit:
- **Offer Details:** ₹0 cost, 45-minute on-site assessment by a My Gardener professional.
- **Scope of Assessment:** Overall layout inspection, plant health examination, soil condition & drainage check, creating the user's initial digital garden record.
- **Single-Claim Enforcement Rule:**
  - **Limit:** Exactly **ONE** Free Garden Check per registered phone number OR email.
  - **Verification:** Checked via `useGarden.getState().freeCheckClaimed` and database queries against existing `bookings` matching `service_slug = 'free-garden-check'`.
  - If a user attempts to book again, the system halts with a friendly message: *"Only 1 Free Garden Check is available per registered account. Browse our full care services!"*
- **Booking Flow:** User selects date & time slot → enters service address → confirms ₹0 booking → system creates an upcoming appointment in Supabase `bookings` with price `0`, flags `freeCheckClaimed = true`, and navigates to the Garden Dashboard.

---

### 5.3 Garden Dashboard (The Digital Garden Record)
Located at `/garden`, this is the permanent digital home of the customer's garden:

#### A. Authentic Data-Only Principle
- **Strict Invariant:** NO fabricated moisture %, soil %, sunlight sensors, or fake health scores.
- If data exists (plants/visits), health status is calculated:
  - *Healthy & Thriving* (92/100) if no active issues exist.
  - *Needs Attention* (78/100) if moderate issues exist.
  - *Requires Immediate Attention* (64/100) if high-severity issues exist.
- If no data exists, shows clean, realistic empty state: *"New Garden · Unassessed"*.

#### B. Hierarchical 3-Tab Structure
1. **Plants & Health Alerts Tab:**
   - Plant Roster: Cards showing plant name, botanical species, condition tag (*Healthy*, *Needs Attention*, *Requires Immediate Attention*), date added, and custom care notes.
   - Manual Plant Adder: Dialog allowing users to manually register plants with condition and notes.
   - Active Health Alerts: Unresolved pests/diseases with a one-click *"Resolve"* action.
2. **Visits & Service History Tab:**
   - Scheduled Visits: Upcoming appointments with date, slot, and gardener assignment.
   - Completed Visit Records: Real historical logs loaded from Supabase containing date, service performed, gardener name, and actual visit notes.
3. **Plan & Approved AI Records Tab:**
   - Active Plan Widget: Displays current membership status, total visits included, completed visits, and remaining visits.
   - Approved AI Diagnoses: Archive of plant diagnoses that the user explicitly approved to save.

---

### 5.4 AI Plant Doctor (Detailed AI Plant Health Analysis)
Located at `/plant-doctor`, providing structured botanical analysis powered by Google Gemini:

#### A. Viewfinder & Image Capture
- Live camera capture (environment camera) or file upload (up to 8MB).
- Daily scan allowance based on user plan: Free (2/day), Essential/Basic (6/day), Complete/Pro (15/day), Master/Elite (Unlimited).
- Optional description box for user observations.

#### B. Structured Output Schema (No Uncertainties as Facts)
Every analysis is divided into clear, rigorous botanical sections:
1. **Plant Identification:** Common name, botanical scientific name, confidence match score (%).
2. **Overall Condition:** Exactly one of: `Healthy`, `Needs Attention`, or `Requires Immediate Attention`.
3. **Possible Issue / Suspected Pathology:** Clearly identified as a *suspected* condition (not an absolute assertion).
4. **What We Observed (Visible Symptoms):** Bulleted list of visual cues (leaf chlorosis, necrosis, pest webs, edge scorch).
5. **Likely Underlying Cause:** Plain-language explanation of environmental, biological, or watering factors.
6. **Recommended Treatment Protocol:** Actionable step-by-step instructions.
   - **Organic Treatment:** Natural remedies (neem oil, soap spray, aeration).
   - **Conventional / Chemical:** Targeted fungicides/nutrients if symptoms persist.
7. **Prevention & Long-Term Health:** Cultural practices to avoid recurrence.
8. **Care Guidance:** Specific watering, sunlight, and bio-nutrition advice.
9. **My Gardener Recommendation:** Genuine suggestion of relevant on-site care (e.g. Garden Care visit or BioVelocity tonic) when appropriate.
10. **Disclaimer:** Explicit notice that visual AI analyses should be verified in person by a My Gardener professional.

---

### 5.5 AI → Garden Dashboard Approval Flow
- **User Control Rule:** The AI NEVER automatically alters the user's Garden Dashboard.
- **Approval Modal (`src/components/GardenApprovalModal.tsx`):**
  - Triggered by clicking *"Save Record"* on a completed diagnosis.
  - Dialog Title: *"Update Garden Dashboard?"*.
  - Summarizes the exact record to be created (Plant name, species, condition, suspected issue, treatment protocol).
  - Actions: `Cancel` or `Update Dashboard`.
  - Upon confirmation, writes the plant into `useGarden.plants`, logs any issue into `useGarden.issues`, stores the diagnostic summary in `useGarden.approvedDiagnoses`, and displays a confirmation toast.

---

### 5.6 Services: Garden Care Plans & One-Time Services
Located at `/services`, cleanly separated into two distinct modes:

#### A. Garden Care Plans (Recurring Botanical Stewardship)
Flexible subscription plans designed for ongoing garden maintenance:
1. **Essential Care (₹399/mo):** 1 monthly on-site visit, seasonal pruning & organic pest check, 5% off one-time services, 6 AI scans/day.
2. **Complete Care (₹799/mo — Most Popular):** 2 monthly on-site visits, repotting guidance, bio-tonic feeding, 10% off services, 15 AI scans/day, 1 free video consult/mo.
3. **Master Care (₹1,499/mo):** 4 monthly on-site visits (weekly stewardship), full lawn & terrace management, 15% off services, unlimited AI scans, VIP priority.
- **My Active Plan Card:** When subscribed, displays plan name, monthly visit quota, completed visits, and remaining visits for the current billing cycle.

#### B. One-Time Services (Categorized Catalog)
1. **Plant Setup:**
   - *Indoor Plant Setup* (₹799 base, or square footage packages up to 300 sq. ft.)
   - *Outdoor Plant Setup* (₹1,499 base, or square footage packages)
   - *Balcony Garden Setup* (₹1,299)
   - *Terrace Garden Setup* (₹2,999)
   - *Kitchen Garden Setup* (₹999)
2. **Plant Care & Maintenance:**
   - *Basic Maintenance* (₹499 — with sub-options: Watering ₹199, Pruning ₹249, Repotting ₹349)
   - *Garden Care* (₹799 — with sub-options: Fertilizer ₹349, Pest Control ₹499, Plant Health Check ₹299, Weed Removal ₹249)
   - *Lawn & Garden Care* (₹899 — with sub-options: Mowing ₹399, Hedge Trimming ₹449, Weed Removal ₹249)
3. **Gardening Consultation:**
   - *Free Garden Check* (₹0 — Complimentary first visit)
   - *Video Consultation* (₹299 — 30-min live session with a My Gardener professional)
   - *Garden Inspection* (₹599 — 1-hr in-person walkthrough report)
   - *Soil Testing Guidance* (₹449 — sampling and nutrient analysis)

---

### 5.7 Booking & Checkout Flow (`src/routes/services.$slug.book.tsx`)
A streamlined 3-step scheduling process:
1. **Step 1: Date, Slot & Address:**
   - Quick date selector (Next 7 days) + full calendar.
   - Time slots: `9:00 AM`, `10:30 AM`, `12:00 PM`, `2:00 PM`, `4:00 PM`, `6:00 PM`.
   - Saved address selector + *"Add New Address"* modal with full address fields (House, Area, Locality, Landmark, City, State, 6-digit Pincode).
2. **Step 2: Custom Notes & Add-Ons:**
   - Special instructions / notes textarea.
   - Recommended BioVelocity products (e.g. Neerva, BioBloom, BioRooter) as 1-click cart add-ons.
   - Option to request a specific previous gardener if returning.
3. **Step 3: Review & Payment / Confirmation:**
   - Order summary itemizing service base price, chosen packages, sub-options, add-ons, and 5% taxes.
   - **For Paid Bookings:** Triggers Razorpay modal. On payment success, creates Supabase booking row, awards Green Points (50 pts per ₹100 service spend), adds local booking, and redirects to `/garden`.
   - **For Free Garden Check:** Verifies eligibility, skips Razorpay, inserts ₹0 booking row into Supabase, marks `freeCheckClaimed = true`, and navigates directly to `/garden`.

---

### 5.8 Botanical Shop & E-Commerce (`src/routes/shop.index.tsx`)
- **Product Catalog:**
  - *BioVelocity Growth Tonics:* Neerva (1L microbial tonic ₹249), BioBloom (Flower Booster ₹349), BioRooter (Root Starter ₹199).
  - *Living Plants:* Monstera Deliciosa (₹649), Snake Plant (₹349), and seasonal plants.
  - *Precision Tools:* Bypass Pruner (₹499), Steel Hand Trowel (₹249).
  - *Planters:* Hand-thrown Terracotta Pot (₹179), Matte Ceramic Planter (₹549).
- **Product Detail (`/shop/$productId`):** Deep botanical story, technical specifications list, detailed care & application instructions, and quantity cart adder.
- **Cart & Order Flow (`/cart`, `/checkout`):** Persistent cart with item quantities, delivery address picker, Razorpay payment gateway, and order status tracking (Stages: Placed → Shipped → Out for delivery → Delivered).

---

### 5.9 Green Points Loyalty Program
- **Earning Mechanism:** Customers earn **50 Green Points for every ₹100** spent on core service value (taxes and products excluded).
- **Value:** `1 Green Point = ₹0.10` (100 points = ₹10).
- **Redemption (`/profile/green-points`):** Points can be redeemed for discounts on upcoming gardener visits, free nursery plants, or BioVelocity tonics.
- **Database Sync:** Points are stored in Supabase `profiles.green_points` and mirrored in Zustand `useProfile`.

---

### 5.10 Profile & Account Management
- **Profile Hub (`/profile`):** Avatar, active Care Plan badge, Green Points balance, visits count.
- **Fast Navigation to Sub-modules:**
  - *Garden Dashboard* (`/garden`)
  - *Garden Care Plan* (`/profile/membership`)
  - *Visits & Orders History* (`/profile/activity`)
  - *Green Points Rewards* (`/profile/green-points`)
  - *Personal Info* (`/profile/edit`)
  - *Settings & Motion Preferences* (`/profile/settings`)
  - *Support Channels* (`/profile/support` — direct WhatsApp & phone contact)

---

## 6. Data Models & State Management

### 6.1 Zustand Persistent Stores (`src/lib/stores.ts`)

#### 1. `useGarden` (Digital Garden Record)
```typescript
export type PlantCondition = "Healthy" | "Needs Attention" | "Requires Immediate Attention";

export type GardenPlant = {
  id: string;
  name: string;
  species?: string;
  condition: PlantCondition;
  addedAt: string; // YYYY-MM-DD
  notes?: string;
  image?: string;
  lastDiagnosis?: string;
};

export type GardenIssue = {
  id: string;
  title: string;
  plantName?: string;
  severity: "Low" | "Moderate" | "High";
  symptoms: string;
  status: "active" | "resolved";
  reportedAt: string;
  resolvedAt?: string;
};

export type ApprovedDiagnosis = {
  id: string;
  date: string;
  plantName: string;
  condition: PlantCondition;
  diseaseName: string;
  symptoms: string;
  treatment: string;
  image?: string;
};

export type ActivePlanDetails = {
  planId: string;
  planName: string;
  totalVisits: number;
  completedVisits: number;
  remainingVisits: number;
  validUntil: string;
  includedServices: string[];
};
```

#### 2. `useProfile` (User Profile & Scan Quota)
```typescript
export type PlanId = "free" | "basic" | "pro" | "elite";

export const SCAN_LIMITS: Record<PlanId, number | null> = {
  free: 2,
  basic: 6,
  pro: 15,
  elite: null, // Unlimited
};
```

#### 3. `useBookings` & `useOrders` & `useCart`
- `useBookings`: Stores upcoming and historical service appointments with status, notes, dates, and payment IDs.
- `useOrders`: Stores shop purchases with delivery status stages (1–3), items array, and total amount.
- `useCart`: Stores cart items with quantity modifier, item removal, and subtotal calculation.
- `useAddresses`: Manages saved user delivery & service addresses.

---

## 7. Database Schema (Supabase)

### 7.1 Database Tables & Columns

```sql
-- 1. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'basic', 'pro', 'elite'
  green_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bookings Table (Professional Visits & Free Checks)
CREATE TABLE public.bookings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_slug TEXT NOT NULL,
  booking_date TEXT,
  booking_time TEXT,
  gardener TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'completed', 'past', 'cancelled'
  price NUMERIC NOT NULL DEFAULT 0,
  note TEXT,
  rating NUMERIC,
  payment_id TEXT REFERENCES public.payments(id),
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Orders Table (Shop E-Commerce)
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Placed', -- 'Placed', 'Shipped', 'Out for delivery', 'Delivered'
  address TEXT,
  payment_id TEXT REFERENCES public.payments(id),
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Payments Table (Razorpay Ledger)
CREATE TABLE public.payments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  kind TEXT NOT NULL, -- 'service', 'membership', 'shop'
  label TEXT NOT NULL,
  receipt TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'created', -- 'created', 'paid', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.2 Auth & Synchronization (`src/components/AuthSync.tsx`)
- On user sign-in (`SIGNED_IN`), queries `profiles` by `auth.uid()` and updates the local Zustand profile store (name, phone, address, green points, active membership plan).
- On user sign-out (`SIGNED_OUT`), triggers `resetUserData()` to clear cached user states.

---

## 8. Third-Party Integrations & APIs

### 8.1 Google Gemini AI (`src/lib/plant-doctor.functions.ts`)
- **API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Authentication:** `process.env.GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`.
- **System Prompt Specification:** Instructs the model as a botanical pathologist to output structured JSON with symptoms, separated causes, actionable treatments (organic & chemical), prevention, and genuine My Gardener suggestions.
- **Fallback Engine:** Includes an offline botanical normalizer in case of rate limits or missing network connectivity.

### 8.2 Razorpay Payment Gateway (`src/lib/use-razorpay.ts`)
- Dynamically loads `https://checkout.razorpay.com/v1/checkout.js`.
- Key: `VITE_RAZORPAY_KEY_ID` or server generated order via `src/lib/razorpay.server.ts`.
- Handles success callback, failure alerts, and payment verification before recording database rows.

---

## 9. Key Business Rules & System Invariants

1. **Brand Identity:** Product name is strictly `MY GARDENER`. The logo `src/assets/my-garden-logo.png` must NEVER be altered or deleted.
2. **Professional Wording:** Always write **"My Gardener professional"** (never "certified gardener" or "worker").
3. **No Reminders / Alerts Feature:** My Gardener does NOT offer watering alerts, notification alarms, or scheduling reminders. Do NOT create or suggest automated reminder features.
4. **Authentic Data Only:** The Garden Dashboard must NEVER fabricate soil, moisture, or sunlight metrics. If unassessed, present realistic empty states inviting the user to book a Free Garden Check or scan with the AI Doctor.
5. **AI Uncertainty Distinction:** The AI Plant Doctor must never present unconfirmed hypotheses as hard facts. Symptoms observed must be separated from suspected issues and likely causes.
6. **AI-to-Garden Sync Approval:** Information from AI diagnoses must NEVER be written automatically to the Garden Dashboard without the user confirming via the `GardenApprovalModal`.
7. **Free Garden Check Limit:** Exactly ONE free assessment per registered contact/account.
8. **Services Division:** Services must always present **Garden Care Plans** (recurring) and **One-Time Services** (individual tasks) as distinct choices.
9. **Green Points Rate:** 50 points per ₹100 spent on service labor (1 point = ₹0.10 value).

---

## 10. Project Directory & File Structure

```
c:\Users\aadit\biosphere-e2b666ea\
├── public/                                # Static public assets
├── src/
│   ├── assets/
│   │   ├── my-garden-logo.png             # Official My Gardener logo (DO NOT MODIFY)
│   │   ├── neerva-bottle-full.png         # BioVelocity Neerva asset
│   │   ├── biobloom-yardhak.png           # BioVelocity BioBloom asset
│   │   └── ...                            # Botanical product and service images
│   ├── components/
│   │   ├── ui/                            # Radix UI primitive wrappers (Button, Dialog, etc.)
│   │   ├── AuthSync.tsx                   # Supabase authentication synchronization
│   │   ├── GardenApprovalModal.tsx        # Modal to approve AI diagnosis into Garden Dashboard
│   │   ├── SearchBar.tsx                  # Global product & service search
│   │   ├── Shell.tsx                      # App shell with header and 5-tab bottom navigation
│   │   ├── Reveal.tsx                     # Smooth animation wrapper
│   │   └── Skeletons.tsx                  # Loading skeleton placeholders
│   ├── integrations/
│   │   └── supabase/                      # Supabase client, types, and server middleware
│   ├── lib/
│   │   ├── data.ts                        # Master catalog: services, products, care plans, offers
│   │   ├── plant-doctor.functions.ts      # Gemini AI plant health server function & normalizer
│   │   ├── razorpay.functions.ts          # Server-side payment helper functions
│   │   ├── razorpay.server.ts             # Razorpay API order creation
│   │   ├── stores.ts                      # Zustand stores (useGarden, useProfile, useCart, etc.)
│   │   ├── supabase-env.ts                # Supabase environment configuration check
│   │   ├── use-auth.ts                    # Authentication hook
│   │   ├── use-location.ts                # Geolocation prompt & reverse geocoding
│   │   └── use-razorpay.ts                # Razorpay checkout hook
│   ├── routes/                            # TanStack Router page routes (see Route Map in Sec. 4)
│   ├── routeTree.gen.ts                   # Auto-generated TanStack route tree
│   ├── router.tsx                         # Router configuration
│   ├── server.ts                          # Nitro / SSR entry point
│   ├── start.ts                           # TanStack Start initialization
│   └── styles.css                         # Botanical design system CSS custom properties & utility classes
├── supabase/
│   └── migrations/                        # SQL database migrations
├── package.json                           # Dependencies & project scripts
├── vite.config.ts                         # Vite & TanStack Start build configuration
└── MY_GARDENER_SPECIFICATION.md           # Master Platform Specification Document (This File)
```

---

## 11. Summary for AI Assistants & Developers

When extending, maintaining, or modifying the My Gardener codebase:
- **Always preserve working backend functionality:** Supabase Auth, PostgreSQL schema, Razorpay payment flows, and Gemini AI endpoints.
- **Maintain the design language:** Keep the editorial, spacious botanical aesthetic (warm cream base, deep forest green accents, refined serif titles).
- **Enforce authenticity:** Only display real data provided by the user, recorded during visits by My Gardener professionals, or confirmed via AI diagnosis approval.
