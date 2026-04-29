/**
 * 文件作用：
 * 将 AI 抠图后的透明 PNG 合成为白底电商标准图。
 * 当前用于产品图片 AI 优化后的 processedUrl 生成。
 */

import sharp from "sharp";

export async function createWhiteBackgroundImage(inputBuffer: Buffer) {
  return sharp(inputBuffer)
    .flatten({
      background: {
        r: 255,
        g: 255,
        b: 255,
      },
    })
    .png()
    .toBuffer();
}