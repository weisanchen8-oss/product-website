/**
 * 文件作用：
 * 封装 remove.bg 图片去背景 API 调用。
 * API Key 只在服务端读取，不暴露到前端。
 */

import fs from "node:fs/promises";

const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

export async function removeBackgroundWithRemoveBg(inputFilePath: string) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error("缺少 REMOVE_BG_API_KEY，请先在 .env.local 中配置。");
  }

  const imageBuffer = await fs.readFile(inputFilePath);

  const formData = new FormData();

  formData.append(
    "image_file",
    new Blob([new Uint8Array(imageBuffer)], {
      type: "image/png",
    }),
    "product-image.png"
  );

  formData.append("size", "auto");
  formData.append("format", "png");

  const response = await fetch(REMOVE_BG_API_URL, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`remove.bg错误: ${response.status} ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}