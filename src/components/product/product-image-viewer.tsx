"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  url: string;
};

type Props = {
  images: ProductImage[];
};

export function ProductImageViewer({ images }: Props) {
  const validImages = images.filter((item) => item.url);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (validImages.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl bg-gray-100 text-sm text-slate-400">
        暂无图片
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            alert("ProductImageViewer 被点击了");
            setPreviewOpen(true);
          }}
          className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-gray-100"
        >
          <Image
            src={currentImage.url}
            alt="product"
            fill
            className="object-cover transition duration-300 hover:scale-105"
          />

          <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            点击放大
          </span>
        </button>

        <div className="flex gap-2 overflow-x-auto">
          {validImages.map((img, index) => (
            <button
              type="button"
              key={`${img.url}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border ${
                index === currentIndex
                  ? "border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20"
                  : "border-gray-200"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
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
              关闭
            </button>

            <Image
              src={currentImage.url}
              alt="preview"
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