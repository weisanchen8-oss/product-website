/**
 * 文件作用：
 * Prisma 7 的 CLI 配置文件。
 * 在 Prisma 7 中，数据库连接 URL、schema 路径等配置放在这里，而不是 schema.prisma。
 */

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});