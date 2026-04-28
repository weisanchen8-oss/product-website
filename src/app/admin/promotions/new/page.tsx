/**
 * 文件作用：
 * 后台新增促销活动页面。
 * 该页面是服务端组件，负责使用后台布局。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PromotionNewForm } from "@/components/admin/promotion-new-form";

export default function NewPromotionPage() {
  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>新增促销活动</h1>
          <p>创建促销活动，后续可绑定产品并在前台展示促销标识。</p>
        </div>

        <Link href="/admin/promotions" className="admin-primary-btn">
          返回促销列表
        </Link>
      </div>

      <section className="admin-panel promotion-form-card">
        <PromotionNewForm />
      </section>
    </AdminLayout>
  );
}