'use client'

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

// Define the props, extending the standard ImageProps from next/image
interface CollectibleImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc: string;
}

export default function CollectibleImage({ src, fallbackSrc, ...props }: CollectibleImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  // When the src prop changes, reset the internal state
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt='Collectible Image'
      onError={() => {
        // Only update if the current src is not already the fallback
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
