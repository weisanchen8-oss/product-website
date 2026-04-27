/**
 * 文件作用：
 * 定义后台操作日志变更详情页。
 * 展示 AdminLog 的 beforeData / afterData 快照对比。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";

type AdminLogDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SnapshotRecord = Record<string, unknown>;

function getModuleText(moduleName: string) {
  switch (moduleName) {
    case "product":
      return "产品";
    case "category":
      return "分类";
    case "inquiry":
      return "询单";
    case "customer":
      return "客户";
    case "system":
      return "系统";
    default:
      return moduleName || "未知";
  }
}

function parseSnapshot(value: string | null): SnapshotRecord | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as SnapshotRecord;
    }

    return {
      value: parsed,
    };
  } catch {
    return {
      raw: value,
    };
  }
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return "空";
  }

  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getChangedRows(
  beforeData: SnapshotRecord | null,
  afterData: SnapshotRecord | null
) {
  const keys = Array.from(
    new Set([
      ...Object.keys(beforeData || {}),
      ...Object.keys(afterData || {}),
    ])
  );

  return keys.map((key) => {
    const beforeValue = beforeData ? beforeData[key] : undefined;
    const afterValue = afterData ? afterData[key] : undefined;

    return {
      key,
      beforeValue,
      afterValue,
      changed: formatValue(beforeValue) !== formatValue(afterValue),
    };
  });
}

export default async function AdminLogDetailPage({
  params,
}: AdminLogDetailPageProps) {
  const { id } = await params;
  const logId = Number(id);

  if (!logId || Number.isNaN(logId)) {
    notFound();
  }

  const log = await prisma.adminLog.findUnique({
    where: {
      id: logId,
    },
  });

  if (!log) {
    notFound();
  }

  const beforeData = parseSnapshot(log.beforeData);
  const afterData = parseSnapshot(log.afterData);
  const rows = getChangedRows(beforeData, afterData);
  const changedCount = rows.filter((row) => row.changed).length;

  return (
    <AdminLayout>
      <div className="admin-log-detail-header">
        <div>
          <h1>日志变更详情</h1>
          <p>查看本次后台操作前后的数据快照。</p>
        </div>

        <Link href="/admin/logs" className="secondary-button">
          返回操作日志
        </Link>
      </div>

      <section className="admin-log-detail-card">
        <div className="admin-log-detail-summary">
          <div>
            <span>模块</span>
            <strong>{getModuleText(log.module)}</strong>
          </div>

          <div>
            <span>操作类型</span>
            <strong>{log.action}</strong>
          </div>

          <div>
            <span>目标对象</span>
            <strong>{log.targetName || "未记录"}</strong>
          </div>

          <div>
            <span>操作人</span>
            <strong>{log.operatorName || "管理员"}</strong>
          </div>

          <div>
            <span>操作时间</span>
            <strong>{log.createdAt.toLocaleString("zh-CN")}</strong>
          </div>

          <div>
            <span>变更字段数</span>
            <strong>{changedCount}</strong>
          </div>

          <div className="admin-log-detail-summary-full">
            <span>操作说明</span>
            <strong>{log.note || "无说明"}</strong>
          </div>
        </div>
      </section>

      <section className="admin-log-detail-card">
        <div className="admin-log-detail-table-header">
          <h2>字段变更对比</h2>
          <p>高亮行表示该字段在本次操作中发生变化。</p>
        </div>

        {rows.length > 0 ? (
          <div className="admin-log-detail-table-wrapper">
            <table className="admin-log-detail-table">
              <thead>
                <tr>
                  <th>字段</th>
                  <th>操作前</th>
                  <th>操作后</th>
                  <th>状态</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={row.changed ? "admin-log-row-changed" : ""}
                  >
                    <td>{row.key}</td>
                    <td>{formatValue(row.beforeValue)}</td>
                    <td>{formatValue(row.afterValue)}</td>
                    <td>{row.changed ? "已变更" : "未变化"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <h3>暂无快照数据</h3>
            <p>旧日志可能没有记录 beforeData / afterData，因此无法查看变更详情。</p>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}