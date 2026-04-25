/**
 * 文件作用：
 * 定义用户退出登录动作。
 * 当前阶段负责清除登录 cookie 并跳转首页。
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function logoutUserAction() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);

  redirect("/");
}