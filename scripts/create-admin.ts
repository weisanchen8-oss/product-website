/**
 * 文件作用：
 * 创建作品集上线版管理员账号。
 * 用于 Supabase PostgreSQL 数据库初始化后台登录用户。
 */

import "dotenv/config";
import crypto from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  const email = "weisanchen8@gmail.com";
  const password = "Admin123456";
  const name = "管理员";

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      companyName: "作品集演示公司",
      phone: "000-00000000",
      passwordHash: hashPassword(password),
    },
    create: {
      name,
      companyName: "作品集演示公司",
      phone: "000-00000000",
      email,
      passwordHash: hashPassword(password),
    },
  });

  console.log("✅ 管理员账号创建成功");
  console.log(`邮箱：${email}`);
  console.log(`密码：${password}`);
}

main()
  .catch((error) => {
    console.error("❌ 管理员账号创建失败：", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });