/**
 * 文件作用：
 * 使用 sharp 为产品图片添加 Logo 图片水印。
 * 当前默认将 Logo 放在左上角，自动缩放并保持透明度。
 */

import sharp from "sharp";

export async function createLogoWatermarkImage(options: {
  inputFilePath: string;
  logoFilePath: string;
}) {
  const image = sharp(options.inputFilePath);
  const metadata = await image.metadata();

  const width = metadata.width ?? 800;

  // Logo 宽度约为产品图宽度的 18%，避免过大遮挡产品
  const logoWidth = Math.max(80, Math.round(width * 0.18));
  const padding = Math.max(20, Math.round(width * 0.035));

  const logoBuffer = await sharp(options.logoFilePath)
    .resize({
      width: logoWidth,
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  return image
    .composite([
      {
        input: logoBuffer,
        top: padding,
        left: padding,
        blend: "over",
      },
    ])
    .png()
    .toBuffer();
}