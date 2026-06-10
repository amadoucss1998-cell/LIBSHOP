# LibMarket 🇱🇷
**Liberia's Free Buy & Sell Marketplace**

## Setup Instructions

### 1. Supabase Setup
1. Create a free project at https://supabase.com
2. Go to SQL Editor → paste the full contents of `supabase/schema.sql` → Run
3. Go to Storage → Create bucket named `listing-images` → Set to **Public**
4. Go to Project Settings → API → copy your `URL` and `anon key`

### 2. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Deploy
Push to GitHub, connect to Vercel, add the same env vars in Vercel dashboard.

## MVP Features
- ✅ Browse listings by category
- ✅ Full-text search (Postgres tsvector)
- ✅ Post ads with up to 5 photos (Supabase Storage)
- ✅ Email auth (register / login via Supabase Auth)
- ✅ WhatsApp + Phone contact buttons
- ✅ All 14 Liberia counties
- ✅ Mark items as sold
- ✅ Seller profile with ad management
- ✅ Mobile-first, works on any phone

## Liberia-Specific Customizations
- USD pricing (standard in Liberia)
- WhatsApp as primary contact method
- All 14 Liberian counties in dropdowns
- Liberian flag 🇱🇷 branding (red/blue)
- Safety tip: "Meet in a safe public place"
- No credit card required to post

## Phase 2 Ideas (After MVP)
- [ ] Boost/featured listings (monetization)
- [ ] In-app messaging
- [ ] Save/favorite listings
- [ ] Seller ratings & reviews
- [ ] Push notifications
- [ ] PWA (installable on phone)
- [ ] Liberian Dollar (LRD) price toggle
