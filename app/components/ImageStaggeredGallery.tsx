import Image from 'next/image';

interface ImageStaggeredGalleryProps {
  images: string[];
}

export default function ImageStaggeredGallery({ images }: ImageStaggeredGalleryProps) {
  // Return null if we don't have enough images to display
  if (!images || images.length < 4) {
    return null;
  }

  return (
    // REMOVED max-w-sm and mx-auto to allow the component to fill its parent
    <div className="flex w-full gap-2 md:gap-4">
      {/* Column 1 (Pushed Down with margin-top) */}
      <div className="flex flex-col w-1/2 gap-2 md:gap-4 mt-6 md:mt-10">
        {/* Rectangular Image */}
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg">
          <Image
            src={images[0]}
            alt="Gallery image 1"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        {/* Square Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
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
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
          <Image
            src={images[2]}
            alt="Gallery image 3"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        {/* Rectangular Image */}
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg">
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
  );
}