/**
 * 文件作用：
 * 定义产品详情页图片画廊组件。
 * 支持点击缩略图切换主图，提升产品图片查看体验。
 */

"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryImage = {
  id: number;
  url: string;
  alt: string;
};

type ProductGalleryProps = {
  images: ProductGalleryImage[];
};

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="product-main-image">
        <span>暂无图片</span>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="product-gallery-viewer">
      <div className="product-main-image">
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          width={720}
          height={540}
          className="product-detail-main-image"
          priority
        />
      </div>

      <div className="product-thumb-row">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className={`product-thumb-button ${
              index === activeIndex ? "active" : ""
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={120}
              height={90}
              className="product-thumb-image"
            />
          </button>
        ))}
      </div>
    </div>
  );
}