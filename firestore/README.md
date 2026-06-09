# Firestore Setup

## 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** → Start in production mode
5. Enable **Storage** → Start in production mode

## 2. Firestore Security Rules
Paste into Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /profiles/{userId} {
      allow read: if true;
      allow create, update: if request.auth.uid == userId;
    }

    match /listings/{listingId} {
      allow read: if resource.data.is_active == true;
      allow create: if request.auth != null && request.resource.data.seller_id == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.seller_id;
    }
  }
}
```

## 3. Storage Security Rules
Paste into Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listing-images/{listingId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 4. Required Firestore Indexes
Create composite indexes in Firestore → Indexes → Composite:

| Collection | Fields | Order |
|------------|--------|-------|
| listings | is_active ASC, is_sold ASC, created_at DESC |
| listings | is_active ASC, is_sold ASC, category_slug ASC, created_at DESC |
| listings | seller_id ASC, created_at DESC |
| listings | is_active ASC, is_sold ASC, title_lower ASC |

## 5. Collections Structure

### `profiles/{uid}`
```json
{
  "id": "uid",
  "full_name": "John Doe",
  "phone_number": "+231123456",
  "whatsapp_number": "+231123456",
  "location": "Monrovia",
  "created_at": "ISO string"
}
```

### `listings/{autoId}`
```json
{
  "seller_id": "uid",
  "seller_name": "John Doe",
  "seller_whatsapp": "+231123456",
  "seller_phone": "+231123456",
  "seller_location": "Monrovia",
  "title": "Samsung Galaxy A54",
  "title_lower": "samsung galaxy a54",
  "description": "...",
  "price": 150,
  "is_negotiable": false,
  "category_slug": "electronics",
  "condition": "Good",
  "location": "Monrovia",
  "county": "Montserrado",
  "images": ["https://..."],
  "is_sold": false,
  "is_active": true,
  "view_count": 0,
  "created_at": "ISO string",
  "updated_at": "ISO string"
}
```
