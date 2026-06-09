'use client';
import { useState } from 'react';

interface ContactSellerModalProps {
  whatsappNumber?: string;
  phoneNumber?: string;
  listingTitle: string;
  sellerName: string;
}

export default function ContactSellerModal({
  whatsappNumber,
  phoneNumber,
  listingTitle,
  sellerName,
}: ContactSellerModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full btn-primary py-3 rounded-xl text-base">
        Contact Seller
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-1">Contact {sellerName}</h2>
            <p className="text-gray-500 text-sm mb-5">About: {listingTitle}</p>

            <div className="space-y-3">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi! I'm interested in: ${encodeURIComponent(listingTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-sm font-bold">WhatsApp</p>
                    <p className="text-xs text-green-100">{whatsappNumber}</p>
                  </div>
                </a>
              )}
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center gap-3 bg-[#0B3D91] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#082d6b] transition-colors"
                >
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-sm font-bold">Call</p>
                    <p className="text-xs text-blue-200">{phoneNumber}</p>
                  </div>
                </a>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">⚠️ Always meet in a safe public place.</p>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
