/**
 * 文件作用：
 * 后台图片点击放大预览组件。
 * 用于产品图片、分类图片等后台图片预览场景。
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import "./admin-image-preview-modal.css";

type AdminImagePreviewModalProps = {
  src: string;
  alt: string;
  thumbClassName?: string;
};

export function AdminImagePreviewModal({
  src,
  alt,
  thumbClassName,
}: AdminImagePreviewModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-image-preview-button"
        title="点击放大预览"
      >
        <Image
          src={src}
          alt={alt}
          width={120}
          height={90}
          className={thumbClassName}
        />
      </button>

      {open ? (
        <div className="admin-image-modal" onClick={() => setOpen(false)}>
          <div className="admin-image-modal-content">
            <button
              type="button"
              className="admin-image-modal-close"
              onClick={() => setOpen(false)}
            >
              关闭
            </button>

            <Image
              src={src}
              alt={alt}
              width={1000}
              height={760}
              className="admin-image-modal-img"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}