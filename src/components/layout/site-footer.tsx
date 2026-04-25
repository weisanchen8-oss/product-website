/**
 * 文件作用：
 * 定义前台网站公共页脚，统一展示公司基础信息和版权说明。
 */

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div>
          <h3>公司名称</h3>
          <p>用于展示企业产品、推荐内容和询单流程的 B2B 平台。</p>
        </div>

        <div>
          <h4>联系方式</h4>
          <p>电话：000-00000000</p>
          <p>邮箱：contact@example.com</p>
        </div>

        <div>
          <h4>地址信息</h4>
          <p>这里用于展示公司地址或办公地点。</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        © 2026 企业产品展示平台. All Rights Reserved.
      </div>
    </footer>
  );
}