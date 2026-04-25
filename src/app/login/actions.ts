/**
 * 文件作用：
 * 定义用户登录相关服务端动作。
 * 当前阶段负责校验邮箱密码，并通过 cookie 保存登录状态。
 */

"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSafeRedirectTo(value: FormDataEntryValue | null) {
  const redirectTo = String(value ?? "/").trim();

  // 只允许站内相对路径，防止跳转到外部恶意网址
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return "/";
}

export async function loginUserAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirectTo(formData.get("redirectTo"));

  if (!email || !password) {
    redirect("/login?error=missing-required");
  }

  if (!isValidEmail(email)) {
    redirect("/login?error=invalid-email-format");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login?error=email-not-found");
  }

  if (user.passwordHash !== hashPassword(password)) {
    redirect("/login?error=wrong-password");
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(redirectTo);
}