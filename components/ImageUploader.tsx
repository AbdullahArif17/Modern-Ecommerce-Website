'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Star,
  Link as LinkIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Plus,
  LayoutGrid,
  Film,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  helperText?: string;
}

// Client-side image compression helper with high quality and mobile memory protection
async function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Preserve animated GIF or vector SVG
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
  maxFiles = 12,
  label = 'Product Media & Images',
  helperText = 'Upload photos from your device. The first photo serves as the primary storefront image.',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'strip'>('grid');
  const [activeStripIndex, setActiveStripIndex] = useState(0);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalIndex, setPreviewModalIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe file handler with batch-sequential processing for mobile memory safety
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (fileArray.length === 0) return;

      const remainingSlots = multiple ? maxFiles - images.length : 1;
      if (remainingSlots <= 0) return;

      const toProcess = fileArray.slice(0, remainingSlots);
      setIsProcessing(true);
      setProcessingProgress({ current: 0, total: toProcess.length });

      try {
        const compressedResults: string[] = [];
        for (let i = 0; i < toProcess.length; i++) {
          setProcessingProgress({ current: i + 1, total: toProcess.length });
          const compressed = await compressImageFile(toProcess[i]);
          compressedResults.push(compressed);
        }

        if (multiple) {
          const updated = [...images, ...compressedResults].slice(0, maxFiles);
          onChange(updated);
          // Auto select latest in strip mode
          if (viewMode === 'strip') {
            setActiveStripIndex(Math.max(0, updated.length - 1));
          }
        } else {
          onChange([compressedResults[0]]);
          setActiveStripIndex(0);
        }
      } catch (err) {
        console.error('Error processing images:', err);
      } finally {
        setIsProcessing(false);
        setProcessingProgress({ current: 0, total: 0 });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, multiple, maxFiles, onChange, viewMode]
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
    if (activeStripIndex >= updated.length) {
      setActiveStripIndex(Math.max(0, updated.length - 1));
    }
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    onChange([target, ...remaining]);
    setActiveStripIndex(0);
  };

  const moveImage = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    if (viewMode === 'strip') {
      setActiveStripIndex(targetIndex);
    }
  };

  const clearAllImages = () => {
    if (window.confirm('Are you sure you want to remove all uploaded photos?')) {
      onChange([]);
      setActiveStripIndex(0);
    }
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

  const openLightbox = (url: string, index: number) => {
    setPreviewModalUrl(url);
    setPreviewModalIndex(index);
  };

  const hasMaxImages = multiple && images.length >= maxFiles;

  return (
    <div className="space-y-3">
      {/* Top Header & Mobile Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <label className="font-bold text-xs uppercase tracking-wider text-primary truncate">
              {label}
            </label>
            {multiple && (
              <span
                className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                  hasMaxImages
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {images.length}/{maxFiles}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{helperText}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {images.length > 1 && (
            <div className="flex items-center bg-secondary/80 rounded-xl p-0.5 border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all text-[11px] font-bold ${
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('strip')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all text-[11px] font-bold ${
                  viewMode === 'strip'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Filmstrip compact layout for small screens"
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Strip</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-muted-foreground hover:text-primary px-2 py-1 rounded-lg hover:bg-secondary/60 flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{showUrlInput ? 'Hide URL' : 'URL'}</span>
          </button>

          {images.length > 0 && multiple && (
            <button
              type="button"
              onClick={clearAllImages}
              className="text-[11px] font-bold text-destructive/80 hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 flex items-center gap-1 transition-colors"
              title="Remove all images"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
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

      {/* Optional URL Input Dropdown */}
      {showUrlInput && (
        <div className="flex gap-2 p-2.5 bg-secondary/40 rounded-2xl border border-border/70 animate-in fade-in duration-200">
          <input
            type="url"
            placeholder="Paste direct image link (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-background border border-border/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
      )}

      {/* Processing / Progress State */}
      {isProcessing && (
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 animate-in fade-in">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Optimizing & preparing photos for web...</span>
              <span className="text-primary font-black">
                {processingProgress.current} / {processingProgress.total}
              </span>
            </div>
            <div className="w-full bg-secondary/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{
                  width: `${
                    processingProgress.total > 0
                      ? (processingProgress.current / processingProgress.total) * 100
                      : 20
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CASE A: No Images Yet -> Friendly, mobile-optimized Dropzone */}
      {images.length === 0 && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-7 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border/80 hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40'
          }`}
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="font-bold text-xs sm:text-sm text-foreground">
              <span className="text-primary underline decoration-primary/40 underline-offset-4">
                Tap to choose photos
              </span>{' '}
              or drag & drop
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              PNG, JPG, WEBP • Automatically compressed for instant mobile loading
            </p>
          </div>
        </div>
      )}

      {/* CASE B: Images Exist -> Compact, small-screen-friendly Gallery */}
      {images.length > 0 && (
        <div className="space-y-2.5">
          {/* Quick Add Bar (Takes minimal vertical space!) */}
          {!hasMaxImages && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-secondary/30 border border-border/50">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-95 active:scale-95 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload More Photos</span>
              </button>
              <span className="text-[11px] text-muted-foreground font-semibold pr-1">
                {maxFiles - images.length} spots left
              </span>
            </div>
          )}

          {/* VIEW MODE 1: GRID VIEW (Bounded scroll container for mobile!) */}
          {viewMode === 'grid' && (
            <div className="max-h-[290px] sm:max-h-[360px] overflow-y-auto p-1.5 rounded-2xl border border-border/60 bg-secondary/15 custom-scrollbar">
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2.5">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className={`group relative rounded-xl sm:rounded-2xl overflow-hidden border aspect-square bg-card shadow-xs transition-all ${
                      index === 0
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border/70 hover:border-border'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Photo ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 140px"
                    />

                    {/* Always-visible Position Badge */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      {index === 0 ? (
                        <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Cover
                        </span>
                      ) : (
                        <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Permanent Touch-Friendly Delete Button for Small Screens */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform sm:opacity-90 group-hover:opacity-100"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    {/* Lightbox Tap Overlay */}
                    <button
                      type="button"
                      onClick={() => openLightbox(url, index)}
                      className="absolute inset-0 z-0 cursor-pointer"
                      title="Click to preview enlarged"
                    />

                    {/* Bottom Action Strip (Permanently accessible & clean on touch) */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1 pt-3 flex items-center justify-between text-white z-10 pointer-events-auto">
                      <div className="flex items-center gap-0.5">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveImage(index, 'prev');
                            }}
                            className="w-5 h-5 rounded-md bg-white/20 hover:bg-white/40 flex items-center justify-center text-white active:scale-90 transition-all"
                            title="Move earlier"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveImage(index, 'next');
                            }}
                            className="w-5 h-5 rounded-md bg-white/20 hover:bg-white/40 flex items-center justify-center text-white active:scale-90 transition-all"
                            title="Move later"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {multiple && index !== 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimary(index);
                          }}
                          className="px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[8px] font-black hover:opacity-95 active:scale-90 transition-all shadow-xs"
                          title="Set as storefront cover image"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Inline "+ Add More" Tile */}
                {!hasMaxImages && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40 rounded-xl sm:rounded-2xl aspect-square flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: FILMSTRIP / CAROUSEL VIEW (Ultra compact for mobile!) */}
          {viewMode === 'strip' && (
            <div className="space-y-2 rounded-2xl border border-border/60 bg-secondary/15 p-2 sm:p-3">
              {/* Main Focused Preview */}
              <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-card border border-border/70 group shadow-xs">
                <Image
                  src={images[activeStripIndex] || images[0]}
                  alt="Active preview"
                  fill
                  unoptimized
                  className="object-contain"
                />

                {/* Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {activeStripIndex === 0 ? (
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      Cover Image
                    </span>
                  ) : (
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      Photo #{activeStripIndex + 1} of {images.length}
                    </span>
                  )}
                </div>

                {/* Actions overlay */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox(images[activeStripIndex] || images[0], activeStripIndex)
                    }
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs backdrop-blur-xs active:scale-90 transition-all"
                    title="Enlarge preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(activeStripIndex)}
                    className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs active:scale-90 transition-all shadow-md"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Strip navigation arrows */}
                {activeStripIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveStripIndex((prev) => Math.max(0, prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all active:scale-90 z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {activeStripIndex < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStripIndex((prev) => Math.min(images.length - 1, prev + 1))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all active:scale-90 z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Cover status button */}
                {activeStripIndex !== 0 && multiple && (
                  <button
                    type="button"
                    onClick={() => setPrimary(activeStripIndex)}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 fill-current" />
                    Set as Storefront Cover
                  </button>
                )}
              </div>

              {/* Horizontal Scroll Thumbnail Rail */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 custom-scrollbar">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStripIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border-2 transition-all ${
                      activeStripIndex === idx
                        ? 'border-primary ring-2 ring-primary/40 scale-105'
                        : 'border-border/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={url} alt={`Thumb ${idx + 1}`} fill unoptimized className="object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}

                {!hasMaxImages && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl flex-shrink-0 border-2 border-dashed border-border/80 hover:border-primary/60 bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-bold">Add</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            {/* Header / Actions */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="text-xs font-bold">
                Photo {previewModalIndex + 1} of {images.length}
                {previewModalIndex === 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full">
                    Cover Photo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {multiple && previewModalIndex !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrimary(previewModalIndex);
                      setPreviewModalIndex(0);
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-95"
                  >
                    Make Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    removeImage(previewModalIndex);
                    setPreviewModalUrl(null);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center border border-white/10">
              <Image
                src={previewModalUrl}
                alt="Enlarged view"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
