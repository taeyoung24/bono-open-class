'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonImageProps extends ImageProps {
  wrapperClassName?: string;
}

export default function SkeletonImage({
  src,
  alt,
  className,
  wrapperClassName,
  onClick,
  ...props
}: SkeletonImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`${styles.imageWrapper} ${className || ''} ${wrapperClassName || ''}`}
      onClick={onClick}
    >
      {/* Skeleton Overlay - Fades out when image is loaded */}
      <div className={`${styles.overlay} ${isLoaded ? styles.hidden : ''}`}>
        <div className={styles.shimmer} />
      </div>

      <Image
        src={src}
        alt={alt}
        className={`${className || ''}`}
        onLoadingComplete={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
