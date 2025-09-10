import Image from 'next/image';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ImageStaggeredGalleryProps {
  images: string[];
}

export default function ImageStaggeredGallery({ images }: ImageStaggeredGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!images || images.length < 4) {
    return null;
  }

  return (
    <>
    <div className="flex w-full gap-2 md:gap-4">
      {/* Column 1 (Pushed Down with margin-top) */}
      <div className="flex flex-col w-1/2 gap-2 md:gap-4 mt-6 md:mt-10">
        {/* Rectangular Image */}
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl" onClick={() => handleImageClick(images[0])}>
          <Image
            src={images[0]}
            alt="Gallery image 1"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        {/* Square Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl" onClick={() => handleImageClick(images[0])}>
          <Image
            src={images[1]}
            alt="Gallery image 2"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Column 2 (Pushed Up with margin-bottom) */}
      <div className="flex flex-col w-1/2 gap-2 md:gap-4 mb-6 md:mb-10">
        {/* Square Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl" onClick={() => handleImageClick(images[0])}>
          <Image
            src={images[2]}
            alt="Gallery image 3"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        {/* Rectangular Image */}
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl" onClick={() => handleImageClick(images[0])}>
          <Image
            src={images[3]}
            alt="Gallery image 4"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      </div>
    </div>
    {/* Enlarged Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4 cursor-pointer"
          onClick={closeModal}
        >
          <Card
            className="relative bg-background rounded-lg shadow-xl w-auto h-auto max-w-[75vw] max-h-[75vh] p-2"
            onClick={(e) => e.stopPropagation()} // Prevent click inside from closing modal
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