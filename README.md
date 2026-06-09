# LibMarket 🇱🇷
**Liberia's Free Buy & Sell Marketplace**

## Setup Instructions

### 1. Firebase Setup
See `firestore/README.md` for full Firestore + Storage security rules and index setup.

Quick steps:
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Enable **Storage**
5. Go to Project Settings → Your apps → Add Web App → copy config

### 2. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Deploy
Push to GitHub → connect to Vercel → add the env vars in Vercel dashboard.

## MVP Features
- ✅ Browse listings by category
- ✅ Title-prefix search
- ✅ Post ads with up to 5 photos (Firebase Storage)
- ✅ Email auth (register / login via Firebase Auth)
- ✅ WhatsApp + Phone contact buttons
- ✅ All 14 Liberia counties
- ✅ Mark items as sold
- ✅ Seller profile with ad management
- ✅ Mobile-first, works on any phone

## Architecture
- **Auth**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (listing images)
- **Frontend**: Next.js 14 App Router (all client components)
- **Seller info** is denormalized into each listing document for fast reads without joins

## Phase 2 Ideas
- [ ] Boost/featured listings (monetization)
- [ ] In-app messaging
- [ ] Save/favorite listings
- [ ] Seller ratings & reviews
- [ ] Push notifications (FCM)
- [ ] PWA (installable on phone)
- [ ] Liberian Dollar (LRD) price toggle
- [ ] Algolia integration for full-text search
