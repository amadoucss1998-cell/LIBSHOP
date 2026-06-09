'use client';
import Link from 'next/link';
import type { Category } from '@/lib/types';

export default function CategoryBar({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/"
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
          !activeSlug
            ? 'bg-[#BF1F2E] text-white border-[#BF1F2E]'
            : 'bg-white text-gray-600 border-gray-200 hover:border-[#BF1F2E]'
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/?category=${cat.slug}`}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            activeSlug === cat.slug
              ? 'bg-[#BF1F2E] text-white border-[#BF1F2E]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#BF1F2E]'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
