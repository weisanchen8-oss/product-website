/**
 * 文件作用：
 * 提供用户登录识别、管理员识别、后台权限强制校验工具。
 * 当前使用 cookie 保存登录用户 ID，并通过 ADMIN_EMAILS 判断后台管理员。
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "b2b_user_id";

function getAdminEmailList() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

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

  const adminEmails = getAdminEmailList();

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

  const adminEmails = getAdminEmailList();

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

/**
 * 后台页面专用：
 * 未登录跳转登录页，非管理员跳转首页。
 */
export async function requireAdminPage() {
  const accessStatus = await getAdminAccessStatus();

  if (accessStatus.status === "not-logged-in") {
    redirect("/login?next=/admin");
  }

  if (accessStatus.status === "not-admin") {
    redirect("/");
  }

  return accessStatus.user;
}

/**
 * 后台服务端动作专用：
 * 用在 create / update / delete 等 server action 里。
 */
export async function requireAdminAction() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    throw new Error("无权限操作：请使用管理员账号登录。");
  }

  return adminUser;
}