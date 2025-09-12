'use client'

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ImageCarouselGalleryProps {
  images: string[];
}

export default function ImageCarouselGallery({ images }: ImageCarouselGalleryProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!api) return;
    // This is where you could add event listeners to the carousel API if needed
  }, [api])
  
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <Carousel
        setApi={setApi}
        className="w-full relative"
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1, 
        }}
        plugins={[
          Autoplay({
            delay: 10000,
            stopOnInteraction: true,
          }),
        ]}
      >
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div 
                className="p-1 md:p-2 cursor-pointer"
                onClick={() => handleImageClick(src)}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={src}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Removed responsive classes to make arrows always visible */}
        <CarouselPrevious className="absolute md:-left-8 left-2 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute md:-right-8 right-2 top-1/2 -translate-y-1/2 z-10" />
      </Carousel>

      {/* Enlarged Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4 cursor-pointer"
          onClick={closeModal}
        >
          <Card
            className="relative bg-background rounded-lg shadow-xl w-auto h-auto max-w-[75vw] max-h-[75vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 z-10 bg-background rounded-full p-1 text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Enlarged gallery view"
                width={1200}
                height={800}
                className="object-contain w-full h-full max-w-[calc(75vw-1rem)] max-h-[calc(75vh-1rem)]"
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}