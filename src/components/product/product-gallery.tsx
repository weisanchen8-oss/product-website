/**
 * 文件作用：
 * 定义产品详情页图片画廊组件。
 * 支持：
 * - 点击缩略图切换主图
 * - 图片为空时根据 locale 显示中文 / 英文提示
 * - 避免服务端和客户端渲染结构不一致
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import type { FrontendLocale } from "@/lib/frontend-i18n";

type ProductGalleryImage = {
  id: number;
  url: string;
  alt: string;
};

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  locale?: FrontendLocale;
};

export function ProductGallery({ images, locale = "zh" }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isEn = locale === "en";

  if (images.length === 0) {
    return (
      <div className="product-image-placeholder">
        {isEn ? "No image" : "暂无图片"}
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="product-gallery">
      <div className="product-main-image">
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          width={720}
          height={540}
          className="product-main-image-content"
          priority
        />
      </div>

      <div className="product-thumb-list">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className={
              index === activeIndex
                ? "product-thumb-button active"
                : "product-thumb-button"
            }
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={96}
              height={72}
              className="product-thumb-image"
            />
          </button>
        ))}
      </div>
    </div>
  );
}