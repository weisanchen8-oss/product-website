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
  const [previewOpen, setPreviewOpen] = useState(false);
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
    <>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[24px] bg-slate-100"
        >
          <Image
            src={activeImage.url}
            alt={activeImage.alt}
            fill
            className="object-contain transition duration-300 hover:scale-105"
            priority
          />

          <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {isEn ? "Click to enlarge" : "点击放大"}
          </span>
        </button>

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

      {previewOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow"
            >
              {isEn ? "Close" : "关闭"}
            </button>

            <Image
              src={activeImage.url}
              alt={activeImage.alt}
              width={1400}
              height={1000}
              className="max-h-[86vh] w-full rounded-2xl object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}