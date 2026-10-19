'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Star, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  helperText?: string;
}

// Client-side image compression helper
async function compressImageFile(file: File, maxDimension = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, preserve directly as data URL to keep animation/vector
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Prefer WebP if supported, fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {}

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
  multiple = true,
  maxFiles = 10,
  label = 'Product Images',
  helperText = 'Upload from your computer (PNG, JPG, WEBP, GIF up to 10MB)',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (fileArray.length === 0) return;

      setIsProcessing(true);
      try {
        const compressedPromises = fileArray.map((f) => compressImageFile(f));
        const newImages = await Promise.all(compressedPromises);

        if (multiple) {
          const updated = [...images, ...newImages].slice(0, maxFiles);
          onChange(updated);
        } else {
          onChange([newImages[0]]);
        }
      } catch (err) {
        console.error('Error processing images:', err);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, multiple, maxFiles, onChange]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    onChange([target, ...remaining]);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (multiple) {
      onChange([...images, urlInput.trim()].slice(0, maxFiles));
    } else {
      onChange([urlInput.trim()]);
    }
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-bold text-xs uppercase tracking-wider text-primary">
            {label} {multiple && `(${images.length}/${maxFiles})`}
          </label>
          <p className="text-[11px] text-muted-foreground">{helperText}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 font-semibold transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? 'Hide URL Option' : 'Or paste URL'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border/80 hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div>
          <p className="font-bold text-sm text-foreground">
            {isProcessing ? (
              <span className="text-primary font-bold">Optimizing & Uploading images...</span>
            ) : (
              <>
                <span className="text-primary underline decoration-primary/40 underline-offset-4">
                  Click to browse
                </span>{' '}
                or drag & drop image{multiple ? 's' : ''} here
              </>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            PNG, JPG, WEBP, or GIF • Automatically optimized for web & mobile
          </p>
        </div>
      </div>

      {/* Optional URL Input */}
      {showUrlInput && (
        <div className="flex gap-2 p-3 bg-secondary/30 rounded-xl border border-border/60 animate-in fade-in duration-200">
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-background border border-border/60 text-foreground focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {images.map((url, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl overflow-hidden border aspect-square bg-secondary/30 shadow-sm transition-all hover:shadow-md ${
                index === 0 ? 'border-primary ring-2 ring-primary/30' : 'border-border/60'
              }`}
            >
              <Image
                src={url}
                alt={`Image preview ${index + 1}`}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, 150px"
              />

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 z-10 bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Primary
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2 z-20">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-1 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors shadow-md"
                    title="Delete image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {multiple && index !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(index);
                    }}
                    className="w-full py-1 px-1.5 bg-white/90 text-black text-[9px] font-bold rounded-md hover:bg-white transition-colors text-center"
                  >
                    Set as Primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
