/**
 * 文件作用：
 * 封装后台通用操作日志写入逻辑。
 * 支持记录操作前后数据快照，以及回滚来源日志 ID。
 * 日志写入失败时，不阻断主业务操作。
 */

import { prisma } from "@/lib/prisma";

type AdminLogInput = {
  module: "product" | "category" | "inquiry" | "customer" | "system";
  action: string;
  targetId?: number;
  targetName?: string;
  note?: string;
  operatorName?: string;
  beforeData?: unknown;
  afterData?: unknown;
  rollbackFromLogId?: number;
};

function toSnapshot(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({
      error: "snapshot_failed",
    });
  }
}

export async function createAdminLog({
  module,
  action,
  targetId,
  targetName,
  note,
  operatorName = "管理员",
  beforeData,
  afterData,
  rollbackFromLogId,
}: AdminLogInput) {
  try {
    await prisma.adminLog.create({
      data: {
        module,
        action,
        targetId,
        targetName,
        note,
        operatorName,
        beforeData: toSnapshot(beforeData),
        afterData: toSnapshot(afterData),
        rollbackFromLogId,
      },
    });
  } catch (error) {
    console.error("AdminLog 写入失败：", error);
  }
}