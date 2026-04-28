/**
 * 文件作用：
 * 内容管理可视化编辑组件。
 * 将技术化 JSON 配置转换为中文表单。
 * 高级 JSON 配置默认隐藏，点击后可展开查看和编辑。
 */

"use client";

import { useMemo, useState } from "react";

type ContentVisualEditorProps = {
  contentKey: string;
  defaultExtraJson: string | null;
};

function safeParseJson(value: string | null) {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown, length: number) {
  if (!Array.isArray(value)) {
    return Array.from({ length }, () => "");
  }

  return Array.from({ length }, (_, index) =>
    typeof value[index] === "string" ? value[index] : ""
  );
}

function AdvancedJsonEditor({
  value,
  description = "高级配置通常由系统自动生成，普通使用者一般不需要修改。",
}: {
  value: string;
  description?: string;
}) {
  return (
    <details className="admin-advanced-config">
      <summary>展开高级配置</summary>

      <p>{description}</p>

      <textarea
        name="extraJson"
        value={value}
        readOnly
        className="admin-textarea"
        rows={5}
      />
    </details>
  );
}

export function ContentVisualEditor({
  contentKey,
  defaultExtraJson,
}: ContentVisualEditorProps) {
  const parsedJson = useMemo(
    () => safeParseJson(defaultExtraJson),
    [defaultExtraJson]
  );

  const [primaryButtonText, setPrimaryButtonText] = useState(
    getStringValue(parsedJson.primaryButtonText)
  );
  const [primaryButtonHref, setPrimaryButtonHref] = useState(
    getStringValue(parsedJson.primaryButtonHref)
  );
  const [secondaryButtonText, setSecondaryButtonText] = useState(
    getStringValue(parsedJson.secondaryButtonText)
  );
  const [secondaryButtonHref, setSecondaryButtonHref] = useState(
    getStringValue(parsedJson.secondaryButtonHref)
  );

  const advantageItems = getStringArray(parsedJson.items, 3);
  const [advantage1, setAdvantage1] = useState(advantageItems[0]);
  const [advantage2, setAdvantage2] = useState(advantageItems[1]);
  const [advantage3, setAdvantage3] = useState(advantageItems[2]);

  const [phone, setPhone] = useState(getStringValue(parsedJson.phone));
  const [email, setEmail] = useState(getStringValue(parsedJson.email));
  const [address, setAddress] = useState(getStringValue(parsedJson.address));
  const [workingHours, setWorkingHours] = useState(
    getStringValue(parsedJson.workingHours)
  );

  if (contentKey === "home_banner") {
    const visualJson = {
      primaryButtonText,
      primaryButtonHref,
      secondaryButtonText,
      secondaryButtonHref,
    };

    return (
      <div className="form-field">
        <span>首页按钮设置</span>

        <div className="admin-visual-editor-grid">
          <label>
            <small>主按钮显示文字</small>
            <input
              type="text"
              value={primaryButtonText}
              onChange={(event) => setPrimaryButtonText(event.target.value)}
              placeholder="例如：查看产品"
            />
          </label>

          <label>
            <small>主按钮跳转地址</small>
            <input
              type="text"
              value={primaryButtonHref}
              onChange={(event) => setPrimaryButtonHref(event.target.value)}
              placeholder="例如：/products"
            />
          </label>

          <label>
            <small>副按钮显示文字</small>
            <input
              type="text"
              value={secondaryButtonText}
              onChange={(event) => setSecondaryButtonText(event.target.value)}
              placeholder="例如：联系我们"
            />
          </label>

          <label>
            <small>副按钮跳转地址</small>
            <input
              type="text"
              value={secondaryButtonHref}
              onChange={(event) => setSecondaryButtonHref(event.target.value)}
              placeholder="例如：/contact"
            />
          </label>
        </div>

        <AdvancedJsonEditor value={JSON.stringify(visualJson)} />
      </div>
    );
  }

  if (contentKey === "home_advantages") {
    const visualJson = {
      items: [advantage1, advantage2, advantage3].filter(Boolean),
    };

    return (
      <div className="form-field">
        <span>首页优势说明</span>

        <div className="admin-visual-editor-grid">
          <label>
            <small>优势说明 1</small>
            <input
              type="text"
              value={advantage1}
              onChange={(event) => setAdvantage1(event.target.value)}
              placeholder="例如：专业产品展示"
            />
          </label>

          <label>
            <small>优势说明 2</small>
            <input
              type="text"
              value={advantage2}
              onChange={(event) => setAdvantage2(event.target.value)}
              placeholder="例如：高效询单流程"
            />
          </label>

          <label>
            <small>优势说明 3</small>
            <input
              type="text"
              value={advantage3}
              onChange={(event) => setAdvantage3(event.target.value)}
              placeholder="例如：快速客户响应"
            />
          </label>
        </div>

        <AdvancedJsonEditor value={JSON.stringify(visualJson)} />
      </div>
    );
  }

  if (contentKey === "inquiry_success_contact") {
    const visualJson = {
      phone,
      email,
      address,
      workingHours,
    };

    return (
      <div className="form-field">
        <span>询单成功后的联系信息</span>

        <div className="admin-visual-editor-grid">
          <label>
            <small>联系电话</small>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="例如：+86 000 0000 0000"
            />
          </label>

          <label>
            <small>联系邮箱</small>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="例如：sales@example.com"
            />
          </label>

          <label>
            <small>公司地址</small>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="请输入公司地址"
            />
          </label>

          <label>
            <small>工作时间</small>
            <input
              type="text"
              value={workingHours}
              onChange={(event) => setWorkingHours(event.target.value)}
              placeholder="例如：周一至周五 9:00-18:00"
            />
          </label>
        </div>

        <AdvancedJsonEditor value={JSON.stringify(visualJson)} />
      </div>
    );
  }

  return (
    <div className="form-field">
      <span>高级配置</span>

      <details className="admin-advanced-config">
        <summary>展开高级配置</summary>

        <p>
          当前模块暂未接入专用中文表单。一般情况下可以不修改这里。
        </p>

        <textarea
          name="extraJson"
          defaultValue={defaultExtraJson ?? ""}
          placeholder='例如：{"key":"value"}'
          className="admin-textarea"
          rows={8}
        />
      </details>
    </div>
  );
}