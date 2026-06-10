export interface Profile {
  id: string;
  full_name: string;
  phone_number?: string;
  whatsapp_number?: string;
  location: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
  sort_order: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  category_id: number;
  condition: ListingCondition;
  location: string;
  county: string;
  images: string[];
  is_sold: boolean;
  is_active: boolean;
  view_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields (from Supabase select with joins)
  profiles?: Profile;
  categories?: Category;
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  details?: string;
  resolved: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
  listings?: Pick<Listing, 'id' | 'title' | 'images' | 'price' | 'is_sold'>;
  buyer?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  seller?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'For Parts';
export type ReportReason = 'spam' | 'misleading' | 'prohibited' | 'offensive' | 'scam' | 'other';

export const LIBERIA_COUNTIES = [
  'Montserrado', 'Margibi', 'Bong', 'Nimba', 'Lofa',
  'Grand Bassa', 'Grand Cape Mount', 'Grand Gedeh', 'Grand Kru',
  'Maryland', 'Sinoe', 'River Cess', 'River Gee', 'Gbarpolu',
] as const;

export const LISTING_CONDITIONS: ListingCondition[] = [
  'New', 'Like New', 'Good', 'Fair', 'For Parts',
];

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam',        label: 'Spam or repeated post' },
  { value: 'misleading',  label: 'Misleading or fake listing' },
  { value: 'prohibited',  label: 'Prohibited item' },
  { value: 'offensive',   label: 'Offensive content' },
  { value: 'scam',        label: 'Scam or fraud' },
  { value: 'other',       label: 'Other' },
];
