import type { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Electronics', icon: '📱', slug: 'electronics' },
  { id: 2, name: 'Vehicles', icon: '🚗', slug: 'vehicles' },
  { id: 3, name: 'Fashion', icon: '👗', slug: 'fashion' },
  { id: 4, name: 'Furniture', icon: '🛋️', slug: 'furniture' },
  { id: 5, name: 'Real Estate', icon: '🏠', slug: 'real-estate' },
  { id: 6, name: 'Farm & Food', icon: '🌽', slug: 'farm-food' },
  { id: 7, name: 'Services', icon: '🔧', slug: 'services' },
  { id: 8, name: 'Jobs', icon: '💼', slug: 'jobs' },
  { id: 9, name: 'Other', icon: '📦', slug: 'other' },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
