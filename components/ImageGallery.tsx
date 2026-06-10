'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  title: string;
  isSold: boolean;
}

export default function ImageGallery({ images, title, isSold }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {/* Main image — slightly smaller with rounded corners and margin */}
      <div className="px-4 pt-3 pb-1">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-[#F5F5F5] cursor-zoom-in"
          style={{ aspectRatio: '4/3' }}
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[active]}
            alt={title}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 672px) 100vw, 672px"
          />
          {isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
              <span className="bg-white text-[#222] font-black text-lg px-5 py-2 rounded uppercase tracking-wider">Sold</span>
            </div>
          )}
          {/* Zoom hint */}
          <div className="absolute bottom-2 right-2 bg-black/40 rounded-full px-2 py-1 flex items-center gap-1">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0zM11 8v6M8 11h6" />
            </svg>
            <span className="text-white text-[10px] font-semibold">Tap to zoom</span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/40 rounded-full px-2 py-1">
              <span className="text-white text-[10px] font-semibold">{active + 1} / {images.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-[#F5F5F5] transition-all ${
                active === i ? 'ring-2 ring-[#F7501F] ring-offset-1' : 'opacity-60'
              }`}
            >
              <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={() => setLightbox(false)}
        >
          {/* Close button */}
          <div className="flex-shrink-0 flex justify-end px-4 pt-4 pb-2">
            <button
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
              onClick={() => setLightbox(false)}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Full image — pinch-to-zoom via touch-action */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden"
            style={{ touchAction: 'pinch-zoom' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[active]}
              alt={title}
              className="max-w-full max-h-full object-contain select-none"
              style={{ touchAction: 'pinch-zoom' }}
            />
          </div>

          {/* Thumbnail strip inside lightbox */}
          {images.length > 1 && (
            <div
              className="flex-shrink-0 flex gap-2 px-4 py-4 overflow-x-auto justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    active === i ? 'ring-2 ring-white' : 'opacity-50'
                  }`}
                >
                  <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
