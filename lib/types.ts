export interface Profile {
  id: string;
  full_name: string;
  phone_number?: string;
  whatsapp_number?: string;
  location: string;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  category_id: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'For Parts';
  location: string;
  county: string;
  images: string[];
  is_sold: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
  categories?: Category;
}

export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'For Parts';

export const LIBERIA_COUNTIES = [
  'Montserrado', 'Margibi', 'Bong', 'Nimba', 'Lofa',
  'Grand Bassa', 'Grand Cape Mount', 'Grand Gedeh', 'Grand Kru',
  'Maryland', 'Sinoe', 'River Cess', 'River Gee', 'Gbarpolu'
];
