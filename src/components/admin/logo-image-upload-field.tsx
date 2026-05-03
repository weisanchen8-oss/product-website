/**
 * 文件作用：
 * Logo 水印图片上传控件。
 * 在前端提前拦截非图片文件和过大的图片，避免 Server Action 直接报错。
 */

"use client";

import { useState } from "react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function LogoImageUploadField() {
  const [error, setError] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setError("");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("只支持 JPG / PNG / WEBP 格式图片。");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Logo 图片大小不能超过 2MB。");
      event.target.value = "";
      return;
    }

    setError("");
  }

  return (
    <div className="form-field">
      <label htmlFor="logoFile">Logo 图片</label>

      <input
        id="logoFile"
        name="logoFile"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
      />

      <p className="admin-help-text">
        支持 JPG / PNG / WEBP，单张图片不超过 2MB。
      </p>

      {error ? <p className="admin-error-text">{error}</p> : null}
    </div>
  );
}