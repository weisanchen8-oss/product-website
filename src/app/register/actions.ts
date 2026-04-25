/**
 * 文件作用：
 * 定义用户注册相关的服务端动作。
 * 当前阶段负责将注册用户真实写入数据库。
 */

"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function registerUserAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !companyName || !phone || !email || !password) {
    redirect("/register?error=missing-required");
  }

  if (password.length < 6) {
    redirect("/register?error=password-too-short");
  }

  if (password !== confirmPassword) {
    redirect("/register?error=password-not-match");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/register?error=email-exists");
  }

  await prisma.user.create({
    data: {
      name,
      companyName,
      phone,
      email,
      passwordHash: hashPassword(password),
    },
  });

  redirect("/login?success=registered");
}