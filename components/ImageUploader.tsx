'use client';
import { useState } from 'react';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ onFilesChange, maxFiles = 5 }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).slice(0, maxFiles - files.length);
    const updated = [...files, ...newFiles];
    setFiles(updated);
    onFilesChange(updated);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const remove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onFilesChange(updatedFiles);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {previews.map((src, i) => (
        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
          >✕</button>
        </div>
      ))}
      {files.length < maxFiles && (
        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#BF1F2E] text-gray-400 text-xs text-center">
          <span className="text-2xl">+</span>
          <span>Add Photo</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}
