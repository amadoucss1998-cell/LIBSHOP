'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, uploadListingImages, validateImageFile } from '@/lib/supabase';
import { LIBERIA_COUNTIES, LISTING_CONDITIONS, type Category, type ListingCondition } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function NewListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    is_negotiable: false,
    category_id: '',
    condition: 'Good' as ListingCondition,
    location: 'Monrovia',
    county: 'Montserrado',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return; }
      setUserId(data.user.id);
    });
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data ?? []);
    });
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    const validationErrors: string[] = [];
    const valid: File[] = [];

    for (const file of incoming) {
      const err = validateImageFile(file);
      if (err) validationErrors.push(err);
      else valid.push(file);
    }

    if (validationErrors.length) {
      setError(validationErrors.join(' '));
      return;
    }

    const toAdd = valid.slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
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

    // Client-side validation
    if (form.title.trim().length < 3) { setError('Title must be at least 3 characters.'); return; }
    if (form.description.trim().length < 10) { setError('Description must be at least 10 characters.'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0 || price > 999999) { setError('Price must be between $0 and $999,999.'); return; }

    setLoading(true);
    setError('');

    try {
      const listingId = uuidv4();
      const imageUrls = await uploadListingImages(imageFiles, listingId);

      if (imageFiles.length > 0 && imageUrls.length === 0) {
        throw new Error('All image uploads failed. Check your connection and try again.');
      }

      const { error: insertError } = await supabase.from('listings').insert({
        id: listingId,
        seller_id: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        is_negotiable: form.is_negotiable,
        category_id: parseInt(form.category_id),
        condition: form.condition,
        location: form.location.trim(),
        county: form.county,
        images: imageUrls,
      });

      if (insertError) throw insertError;
      router.push(`/listings/${listingId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-[104px] z-10 bg-white border-b border-[#F0F0F0] px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-[#222]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[#222] font-bold text-lg">What are you selling?</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">

        {/* Photo upload */}
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-3">
            Photos <span className="normal-case font-normal">(JPG/PNG/WebP, max 5 MB each)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#F5F5F5]">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">Cover</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center"
                >✕</button>
              </div>
            ))}
            {imageFiles.length < 5 && (
              <label className="w-24 h-24 flex flex-col items-center justify-center bg-[#F5F5F5] rounded-xl cursor-pointer hover:bg-[#EFEFEF] transition-colors text-[#aaa]">
                <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold">Add photo</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <p className="text-[#bbb] text-xs mt-2">{imageFiles.length}/5 photos added</p>
        </div>

        <div className="border-t border-[#F0F0F0]" />

        {/* Title */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[#888] text-xs font-semibold uppercase tracking-wider">Title *</label>
            <span className={`text-xs ${form.title.length > 140 ? 'text-red-400' : 'text-[#bbb]'}`}>{form.title.length}/150</span>
          </div>
          <input
            required
            minLength={3}
            maxLength={150}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Samsung Galaxy A54 — excellent condition"
            className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[#888] text-xs font-semibold uppercase tracking-wider">Description *</label>
            <span className={`text-xs ${form.description.length > 2800 ? 'text-red-400' : 'text-[#bbb]'}`}>{form.description.length}/3000</span>
          </div>
          <textarea
            required
            minLength={10}
            maxLength={3000}
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what you're selling — features, reason for selling, defects..."
            className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Price (USD) *</label>
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] font-bold text-sm">$</span>
              <input
                required
                type="number"
                min="0"
                max="999999"
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="w-full bg-[#F5F5F5] rounded-xl pl-8 pr-4 py-3 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
              />
            </div>
            <label className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_negotiable}
                onChange={(e) => setForm({ ...form, is_negotiable: e.target.checked })}
                className="w-4 h-4 accent-[#F7501F]"
              />
              <span className="text-[#222] text-sm font-medium whitespace-nowrap">Negotiable</span>
            </label>
          </div>
          <p className="text-[#bbb] text-xs mt-1.5">Enter 0 for free items</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Category *</label>
          {categories.length === 0 ? (
            <p className="text-[#bbb] text-sm bg-[#F5F5F5] rounded-xl px-4 py-3">Loading categories…</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, category_id: String(c.id) })}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-colors ${
                    form.category_id === String(c.id)
                      ? 'bg-[#F7501F]/10 border-[#F7501F] text-[#F7501F]'
                      : 'bg-[#F5F5F5] border-transparent text-[#444]'
                  }`}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-[11px] font-semibold leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {/* hidden required input to trigger form validation */}
          <input type="text" required value={form.category_id} onChange={() => {}} className="sr-only" aria-hidden="true" />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Condition *</label>
          <div className="flex gap-2 flex-wrap">
            {LISTING_CONDITIONS.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => setForm({ ...form, condition: cond })}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  form.condition === cond
                    ? 'bg-[#F7501F] text-white border-[#F7501F]'
                    : 'bg-white text-[#444] border-[#E8E8E8]'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Location *</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City / Town"
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
            />
            <select
              required
              value={form.county}
              onChange={(e) => setForm({ ...form, county: e.target.value })}
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#222] text-sm focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30 appearance-none"
            >
              {LIBERIA_COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F7501F] hover:bg-[#d94218] text-white font-bold py-4 rounded-xl text-base transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Posting...
            </span>
          ) : 'Post for free'}
        </button>

        <p className="text-center text-[#888] text-xs pb-4">
          By posting, you agree to our Terms of Service. Keep it legal — no weapons, drugs, or stolen goods.
        </p>
      </form>
    </div>
  );
}
