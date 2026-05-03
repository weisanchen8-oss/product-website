/**
 * 文件作用：
 * 旧版产品中心路径兼容页。
 * 当前前台已经统一使用多语言路径：
 * - /zh/products
 * - /en/products
 *
 * 因此访问 /products 时，自动跳转到默认中文产品中心。
 */

import { redirect } from "next/navigation";

export default function ProductsPageRedirect() {
  redirect("/zh/products");
}