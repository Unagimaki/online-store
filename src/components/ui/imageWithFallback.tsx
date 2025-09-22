// components/ImageWithFallback.tsx
import { useState } from 'react';
import placeholderImage from '@/assets/no-image.jpg';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = placeholderImage,
  className = ''
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy" // Ленивая загрузка
    />
  );
};