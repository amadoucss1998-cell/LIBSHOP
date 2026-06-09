'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, uploadListingImage } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/categories';
import { LIBERIA_COUNTIES, type ListingCondition } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const CONDITIONS: ListingCondition[] = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

export default function NewListingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] = useState<{ full_name: string; whatsapp_number?: string; phone_number?: string; location?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    is_negotiable: false,
    category_slug: '',
    condition: 'Good' as ListingCondition,
    location: 'Monrovia',
    county: 'Montserrado',
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/auth'); return; }
      setUserId(user.uid);
      // Fetch seller profile for denormalization
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'profiles', user.uid));
      if (snap.exists()) setSellerProfile(snap.data() as any);
    });
    return () => unsub();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError('');

    try {
      const listingId = uuidv4();

      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadListingImage(file, listingId);
        if (url) imageUrls.push(url);
      }

      const now = new Date().toISOString();
      await addDoc(collection(db, 'listings'), {
        seller_id: userId,
        seller_name: sellerProfile?.full_name ?? '',
        seller_whatsapp: sellerProfile?.whatsapp_number ?? '',
        seller_phone: sellerProfile?.phone_number ?? '',
        seller_location: sellerProfile?.location ?? 'Monrovia',
        title: form.title,
        title_lower: form.title.toLowerCase(),
        description: form.description,
        price: parseFloat(form.price),
        is_negotiable: form.is_negotiable,
        category_slug: form.category_slug,
        condition: form.condition,
        location: form.location,
        county: form.county,
        images: imageUrls,
        is_sold: false,
        is_active: true,
        view_count: 0,
        created_at: now,
        updated_at: now,
      });

      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post listing. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Post New Ad</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div className="card p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Photos <span className="font-normal text-gray-400">(up to 5)</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >✕</button>
              </div>
            ))}
            {imageFiles.length < 5 && (
              <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#BF1F2E] text-gray-400 text-xs text-center">
                <span className="text-2xl">+</span>
                <span>Add Photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Samsung Galaxy A54 - Excellent Condition"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your item — condition, reason for selling, features..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (USD) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_negotiable}
                  onChange={(e) => setForm({ ...form, is_negotiable: e.target.checked })}
                  className="w-4 h-4 accent-[#BF1F2E]"
                />
                <span className="text-sm text-gray-700">Negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Category & Condition */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
            <select
              required
              value={form.category_slug}
              onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Condition *</label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setForm({ ...form, condition: cond })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.condition === cond
                      ? 'bg-[#BF1F2E] text-white border-[#BF1F2E]'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City/Town *</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Monrovia"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">County *</label>
              <select
                required
                value={form.county}
                onChange={(e) => setForm({ ...form, county: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
              >
                {LIBERIA_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3.5 text-base rounded-xl disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Ad Free →'}
        </button>
      </form>
    </div>
  );
}
