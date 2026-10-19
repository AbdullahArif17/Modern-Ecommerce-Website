'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/sanity';
import { Product } from '@/lib/products';

interface ProductImageGalleryProps {
  product: Product;
}

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<any>(product.images && product.images.length > 0 ? product.images[0] : product.image);

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Main Image */}
      <div className="aspect-square relative rounded-2xl md:rounded-3xl overflow-hidden bg-secondary border border-border group cursor-zoom-in shadow-lg">
        {(() => {
          const mainUrl = getProductImageUrl({ image: selectedImage });
          return (
            <Image
              src={mainUrl}
              alt={product.title || product.name || 'Product Image'}
              fill
              unoptimized={mainUrl.startsWith('data:')}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          );
        })()}
      </div>

      {/* Thumbnails */}
      {product.images && product.images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {product.images.map((img: any, i: number) => {
            const imgUrl = getProductImageUrl({ image: img });
            const selectedUrl = getProductImageUrl({ image: selectedImage });
            const isSelected = imgUrl === selectedUrl;
            return (
              <div 
                key={i} 
                className={`aspect-square relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all shadow-md ${
                  isSelected 
                    ? 'border-primary scale-105 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:scale-105'
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={imgUrl}
                  alt={`${product.title || product.name} - Image ${i + 1}`}
                  fill
                  unoptimized={imgUrl.startsWith('data:')}
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 12.5vw"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
