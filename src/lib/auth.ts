/**
 * 文件作用：
 * 提供前台用户认证和后台管理员识别工具。
 * 当前阶段使用 cookie 保存登录用户 ID，并通过 ADMIN_EMAILS 判断后台访问权限。
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "b2b_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userIdValue = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const userId = Number(userIdValue);

  if (!userId || Number.isNaN(userId)) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getCurrentAdminUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(currentUser.email.toLowerCase())) {
    return null;
  }

  return currentUser;
}

export async function getAdminAccessStatus() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      status: "not-logged-in" as const,
      user: null,
    };
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(currentUser.email.toLowerCase())) {
    return {
      status: "not-admin" as const,
      user: currentUser,
    };
  }

  return {
    status: "allowed" as const,
    user: currentUser,
  };
}