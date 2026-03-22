'use client'

import { useState } from 'react'

interface BadgeImageProps {
  src: string | null
  alt: string
  className?: string
}

export default function BadgeImage({ src, alt, className }: BadgeImageProps) {
  // src가 없으면 바로 기본 이미지, 있으면 해당 src로 초기화
  const [imgSrc, setImgSrc] = useState(src || '/badges/default.svg')

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      // 로딩 실패 시 기본 이미지로 교체 (무한 루프 방지를 위해 한 번만 작동하도록 설계)
      onError={() => {
        if (imgSrc !== '/badges/default.svg') {
          setImgSrc('/badges/default.svg')
        }
      }}
    />
  )
}
