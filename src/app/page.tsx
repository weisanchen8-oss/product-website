/**
 * 文件作用：
 * 根首页重定向页。
 * 解决 / 和 /zh 显示不同页面的问题。
 * 当前多语言系统中，真正的中文首页在 /zh，英文首页在 /en。
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/zh");
}