/**
 * 文件作用：
 * 定义登录页。
 * 当前版本支持用户真实登录，并通过 cookie 保存登录状态。
 */

import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { loginUserAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    redirectTo?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-required":
      return "登录失败：请填写邮箱和密码。";
    case "invalid-email-format":
      return "登录失败：邮箱格式不正确。";
    case "email-not-found":
      return "登录失败：该邮箱尚未注册，请先注册账号。";
    case "wrong-password":
      return "登录失败：密码不正确。";
    case "login-required":
      return "请先登录后再提交询单。";
    case "admin-required":
      return "请使用管理员账号登录后访问后台。";
    default:
      return "";
  }
}

function getSuccessMessage(success?: string) {
  switch (success) {
    case "registered":
      return "注册成功，请使用邮箱和密码登录。";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { success, error, redirectTo = "/" } = await searchParams;
  const errorMessage = getErrorMessage(error);
  const successMessage = getSuccessMessage(success);

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Login"
          title="用户登录"
          description="登录后可正式提交询单、查看询单记录，并进入后续业务流程。"
        />

        <section className="section">
          <div className="container narrow-container">
            {successMessage ? (
              <div className="submit-success-card">{successMessage}</div>
            ) : null}

            {errorMessage ? (
              <div className="submit-error-card">{errorMessage}</div>
            ) : null}

            <div className="form-card">
              <h2>登录账户</h2>

              <form action={loginUserAction} className="stack-form">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <label className="form-field">
                  <span>电子邮箱</span>
                  <input type="email" name="email" placeholder="请输入电子邮箱" />
                </label>

                <label className="form-field">
                  <span>密码</span>
                  <input type="password" name="password" placeholder="请输入密码" />
                </label>

                <button type="submit" className="primary-button form-submit">
                  登录
                </button>
              </form>

              <p className="form-helper-text">
                还没有账号？
                <Link href="/register"> 立即注册</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}