"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

export async function toggleCustomerImportantAction(formData: FormData) {
  const id = Number(formData.get("id"));

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isImportant: !user.isImportant,
    },
  });

  await createAdminLog({
    module: "customer",
    action: updated.isImportant ? "mark_important" : "unmark_important",
    targetId: updated.id,
    targetName: updated.name,
    note: updated.isImportant ? "标记为重点客户" : "取消重点客户",
    beforeData: user,
    afterData: updated,
  });

  revalidatePath("/admin/customers");
}