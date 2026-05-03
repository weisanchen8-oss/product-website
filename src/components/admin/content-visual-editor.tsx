/**
 * 文件作用：
 * 内容管理可视化编辑组件。
 * 将技术化 JSON 配置转换为中文/英文表单。
 * 高级 JSON 配置默认隐藏，点击后可展开查看。
 * 当前支持：
 * - home_banner：首页按钮配置 + 英文按钮配置
 * - home_company_intro：首页公司介绍按钮配置
 * - home_advantages：首页优势卡片内容配置 + 英文优势卡片内容配置
 * - inquiry_success_contact：询单成功后的联系信息配置
 * - 其他模块：保留高级配置入口
 */

"use client";

import { useMemo, useState } from "react";

type ContentVisualEditorProps = {
  contentKey: string;
  defaultExtraJson: string | null;
  defaultExtraJsonEn?: string | null;
  defaultContent: string | null;
  defaultContentEn?: string | null;
};

type AdvantageItem = {
  title: string;
  description: string;
};

function safeParseJson(value: string | null) {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function safeParseArray(value: string | null): AdvantageItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      title: typeof item?.title === "string" ? item.title : "",
      description:
        typeof item?.description === "string" ? item.description : "",
    }));
  } catch {
    return [];
  }
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function AdvancedJsonEditor({
  name = "extraJson",
  value,
  description = "高级配置通常由系统自动生成，普通使用者一般不需要修改。",
}: {
  name?: string;
  value: string;
  description?: string;
}) {
  return (
    <details className="admin-advanced-config">
      <summary>展开高级配置</summary>

      <p>{description}</p>

      <textarea
        name={name}
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
  defaultExtraJsonEn,
  defaultContent,
  defaultContentEn,
}: ContentVisualEditorProps) {
  const parsedJson = useMemo(
    () => safeParseJson(defaultExtraJson),
    [defaultExtraJson]
  );

  const parsedJsonEn = useMemo(
    () => safeParseJson(defaultExtraJsonEn ?? null),
    [defaultExtraJsonEn]
  );

  const parsedContentArray = useMemo(
    () => safeParseArray(defaultContent),
    [defaultContent]
  );

  const parsedContentArrayEn = useMemo(
    () => safeParseArray(defaultContentEn ?? null),
    [defaultContentEn]
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

  const [primaryButtonTextEn, setPrimaryButtonTextEn] = useState(
    getStringValue(parsedJsonEn.primaryButtonText)
  );
  const [secondaryButtonTextEn, setSecondaryButtonTextEn] = useState(
    getStringValue(parsedJsonEn.secondaryButtonText)
  );

  const [introButtonText, setIntroButtonText] = useState(
    getStringValue(parsedJson.buttonText) || "查看公司介绍"
  );
  const [introButtonHref, setIntroButtonHref] = useState(
    getStringValue(parsedJson.buttonHref) || "/company"
  );

  const [phone, setPhone] = useState(getStringValue(parsedJson.phone));
  const [email, setEmail] = useState(getStringValue(parsedJson.email));
  const [address, setAddress] = useState(getStringValue(parsedJson.address));
  const [workingHours, setWorkingHours] = useState(
    getStringValue(parsedJson.workingHours)
  );

  const [advantageItems, setAdvantageItems] = useState<AdvantageItem[]>(
    parsedContentArray.length > 0
      ? parsedContentArray
      : [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ]
  );

  const [advantageItemsEn, setAdvantageItemsEn] = useState<AdvantageItem[]>(
    parsedContentArrayEn.length > 0
      ? parsedContentArrayEn
      : [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ]
  );

  function updateAdvantageItem(
    index: number,
    field: keyof AdvantageItem,
    value: string
  ) {
    setAdvantageItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function updateAdvantageItemEn(
    index: number,
    field: keyof AdvantageItem,
    value: string
  ) {
    setAdvantageItemsEn((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  if (contentKey === "home_banner") {
    const visualJson = {
      primaryButtonText,
      primaryButtonHref,
      secondaryButtonText,
      secondaryButtonHref,
    };

    const visualJsonEn = {
      primaryButtonText: primaryButtonTextEn,
      primaryButtonHref,
      secondaryButtonText: secondaryButtonTextEn,
      secondaryButtonHref,
    };

    return (
      <div className="form-field">
        <span>首页横幅按钮设置</span>

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

        <div className="admin-visual-editor-grid">
          <label>
            <small>英文主按钮显示文字</small>
            <input
              type="text"
              value={primaryButtonTextEn}
              onChange={(event) => setPrimaryButtonTextEn(event.target.value)}
              placeholder="For example: View Products"
            />
          </label>

          <label>
            <small>英文副按钮显示文字</small>
            <input
              type="text"
              value={secondaryButtonTextEn}
              onChange={(event) => setSecondaryButtonTextEn(event.target.value)}
              placeholder="For example: Contact Us"
            />
          </label>
        </div>

        <AdvancedJsonEditor value={JSON.stringify(visualJson)} />
        <textarea
          name="extraJsonEn"
          value={JSON.stringify(visualJsonEn)}
          readOnly
          hidden
        />
      </div>
    );
  }

  if (contentKey === "home_company_intro") {
    const visualJson = {
      buttonText: introButtonText,
      buttonHref: introButtonHref,
    };

    return (
      <div className="form-field">
        <span>公司介绍按钮设置</span>

        <div className="admin-visual-editor-grid">
          <label>
            <small>按钮显示文字</small>
            <input
              type="text"
              value={introButtonText}
              onChange={(event) => setIntroButtonText(event.target.value)}
              placeholder="例如：查看公司介绍"
            />
          </label>

          <label>
            <small>按钮跳转地址</small>
            <input
              type="text"
              value={introButtonHref}
              onChange={(event) => setIntroButtonHref(event.target.value)}
              placeholder="例如：/company"
            />
          </label>
        </div>

        <AdvancedJsonEditor value={JSON.stringify(visualJson)} />
      </div>
    );
  }

  if (contentKey === "home_advantages") {
    const cleanItems = advantageItems.filter(
      (item) => item.title.trim() || item.description.trim()
    );

    const cleanItemsEn = advantageItemsEn.filter(
      (item) => item.title.trim() || item.description.trim()
    );

    return (
      <div className="form-field">
        <span>首页优势展示</span>

        {advantageItems.map((item, index) => (
          <div key={`zh-${index}`} className="admin-adv-card">
            <strong>优势 {index + 1}</strong>

            <input
              type="text"
              value={item.title}
              onChange={(event) =>
                updateAdvantageItem(index, "title", event.target.value)
              }
              placeholder="标题，例如：专业产品展示"
            />

            <textarea
              value={item.description}
              onChange={(event) =>
                updateAdvantageItem(index, "description", event.target.value)
              }
              placeholder="描述，例如：突出产品信息层次，便于客户快速建立认知。"
              className="admin-textarea"
              rows={3}
            />
          </div>
        ))}

        <div className="mt-6">
          <span>英文首页优势展示</span>

          {advantageItemsEn.map((item, index) => (
            <div key={`en-${index}`} className="admin-adv-card">
              <strong>Advantage {index + 1}</strong>

              <input
                type="text"
                value={item.title}
                onChange={(event) =>
                  updateAdvantageItemEn(index, "title", event.target.value)
                }
                placeholder="Title, for example: Professional Showcase"
              />

              <textarea
                value={item.description}
                onChange={(event) =>
                  updateAdvantageItemEn(index, "description", event.target.value)
                }
                placeholder="Description, for example: Present product information clearly."
                className="admin-textarea"
                rows={3}
              />
            </div>
          ))}
        </div>

        <textarea
          name="content"
          value={JSON.stringify(cleanItems)}
          readOnly
          hidden
        />

        <textarea
          name="contentEn"
          value={JSON.stringify(cleanItemsEn)}
          readOnly
          hidden
        />

        <AdvancedJsonEditor
          value={defaultExtraJson ?? ""}
          description="该模块的主要内容已通过上方中文表单维护，高级配置一般无需修改。"
        />

        <small>每一项对应前台一个优势展示卡片，空白项会自动忽略。</small>
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

        <p>当前模块暂未接入专用中文表单。一般情况下可以不修改这里。</p>

        <textarea
          name="extraJson"
          defaultValue={defaultExtraJson ?? ""}
          placeholder='例如：{"key":"value"}'
          className="admin-textarea"
          rows={8}
        />

        <textarea
          name="extraJsonEn"
          defaultValue={defaultExtraJsonEn ?? ""}
          placeholder='For example: {"key":"value"}'
          className="admin-textarea"
          rows={8}
        />
      </details>
    </div>
  );
}