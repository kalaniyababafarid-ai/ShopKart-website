import React, { useState } from 'react';
import { getProductFallbackSvg } from '../../utils/imageFallback';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  title?: string;
  categoryName?: string;
  brandName?: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  title,
  categoryName,
  brandName,
  className = '',
  loading = 'lazy',
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  // Sync if prop changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasFailed(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (hasFailed) return;
    setHasFailed(true);
    const fallbackSvg = getProductFallbackSvg(title || alt, categoryName, brandName);
    setCurrentSrc(fallbackSvg);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ShopKart Image Recovery]: Fallback SVG activated for "${title || alt}".`);
    }
  };

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={handleError}
      className={className}
    />
  );
};
