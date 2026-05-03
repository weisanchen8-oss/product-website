/**
 * 文件作用：
 * 旧版产品详情路径兼容页。
 * 当前前台已经统一使用多语言路径：
 * - /zh/product/[slug]
 * - /en/product/[slug]
 *
 * 因此访问 /product/[slug] 时，自动跳转到默认中文产品详情页。
 */

import { redirect } from "next/navigation";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPageRedirect({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  redirect(`/zh/product/${slug}`);
}