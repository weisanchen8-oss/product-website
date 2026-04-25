/**
 * 文件作用：
 * 定义注册页。
 * 当前版本支持用户真实注册并写入数据库。
 */

import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { registerUserAction } from "@/app/register/actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-required":
      return "注册失败：请填写所有必填信息。";
    case "password-too-short":
      return "注册失败：密码长度不能少于 6 位。";
    case "password-not-match":
      return "注册失败：两次输入的密码不一致。";
    case "email-exists":
      return "注册失败：该邮箱已经被注册。";
    default:
      return "";
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Register"
          title="用户注册"
          description="注册后可提交询单、查看询单记录，并作为后续采购沟通的基础身份信息。"
        />

        <section className="section">
          <div className="container narrow-container">
            {errorMessage ? (
              <div className="submit-error-card">{errorMessage}</div>
            ) : null}

            <div className="form-card">
              <h2>创建账户</h2>

              <form action={registerUserAction} className="stack-form">
                <label className="form-field">
                  <span>联系人姓名 *</span>
                  <input type="text" name="name" placeholder="请输入联系人姓名" />
                </label>

                <label className="form-field">
                  <span>公司名称 *</span>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="请输入公司名称"
                  />
                </label>

                <label className="form-field">
                  <span>手机号码 *</span>
                  <input type="text" name="phone" placeholder="请输入手机号码" />
                </label>

                <label className="form-field">
                  <span>电子邮箱 *</span>
                  <input type="email" name="email" placeholder="请输入电子邮箱" />
                </label>

                <label className="form-field">
                  <span>密码 *</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="请输入密码，至少 6 位"
                  />
                </label>

                <label className="form-field">
                  <span>确认密码 *</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="请再次输入密码"
                  />
                </label>

                <button type="submit" className="primary-button form-submit">
                  注册
                </button>
              </form>

              <p className="form-helper-text">
                已有账号？
                <Link href="/login"> 立即登录</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}