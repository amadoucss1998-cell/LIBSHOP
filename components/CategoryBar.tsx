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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4">
      <Link
        href="/"
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
          !activeSlug
            ? 'bg-[#F7501F] text-white border-[#F7501F]'
            : 'bg-white text-[#444] border-[#E8E8E8] hover:border-[#F7501F]'
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/?category=${cat.slug}`}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            activeSlug === cat.slug
              ? 'bg-[#F7501F] text-white border-[#F7501F]'
              : 'bg-white text-[#444] border-[#E8E8E8] hover:border-[#F7501F]'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
