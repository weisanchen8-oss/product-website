/**
 * 文件作用：
 * 添加左上角品牌水印（高级版）
 * 特点：
 * - 左上角布局
 * - 黑色文字（带透明度）
 * - 优雅字体（更接近品牌感）
 * - 轻微阴影增强可读性
 */

import sharp from "sharp";

function escapeSvgText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function createTextWatermarkImage(options: {
  inputFilePath: string;
  watermarkText: string;
}) {
  const image = sharp(options.inputFilePath);
  const metadata = await image.metadata();

  const width = metadata.width ?? 800;
  const height = metadata.height ?? 800;

  const safeText = escapeSvgText(
    options.watermarkText.trim() || "Sanwei Trade"
  );

  // 字体大小自适应
  const fontSize = Math.max(28, Math.round(width * 0.045));

  // 边距
  const padding = Math.round(width * 0.03);

  const svg = `
    <svg width="${width}" height="${height}">
      
      <!-- 阴影（增强可读性） -->
      <text
        x="${padding + 2}"
        y="${padding + fontSize + 2}"
        font-size="${fontSize}"
        font-family="Helvetica, Arial, sans-serif"
        font-weight="600"
        fill="rgba(255,255,255,0.4)"
      >
        ${safeText}
      </text>

      <!-- 主文字 -->
      <text
        x="${padding}"
        y="${padding + fontSize}"
        font-size="${fontSize}"
        font-family="Helvetica, Arial, sans-serif"
        font-weight="600"
        fill="rgba(0,0,0,0.65)"
      >
        ${safeText}
      </text>

    </svg>
  `;

  return image
    .composite([
      {
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
}