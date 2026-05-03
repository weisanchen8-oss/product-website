/**
 * 文件作用：
 * 定义产品详情页图片画廊组件。
 * 支持：
 * - 点击缩略图切换主图
 * - 缩略图横向排列，避免纵向堆叠导致排版混乱
 * - 图片为空时根据 locale 显示中文 / 英文提示
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
      <div className="flex aspect-[4/3] items-center justify-center rounded-[24px] bg-[#EAF1F8] text-sm font-semibold text-[#1E3A5F]/60">
        {isEn ? "No image" : "暂无图片"}
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border bg-slate-100 transition ${
              index === activeIndex
                ? "border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20"
                : "border-slate-200 hover:border-[#1E3A5F]/40"
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}