/**
 * 文件作用：
 * 定义后台产品参数动态编辑组件。
 * 支持：
 * - 中文产品参数 specsJson
 * - 英文产品参数 specsJsonEn
 * - 员工自由添加、删除任意数量的参数行
 */

"use client";

import { useState } from "react";

type ProductSpecItem = {
  key: string;
  value: string;
};

type ProductSpecsEditorProps = {
  initialSpecs?: ProductSpecItem[];
  initialSpecsEn?: ProductSpecItem[];
};

function createDefaultSpecs(initialSpecs: ProductSpecItem[]) {
  return initialSpecs.length > 0 ? initialSpecs : [{ key: "", value: "" }];
}

export function ProductSpecsEditor({
  initialSpecs = [],
  initialSpecsEn = [],
}: ProductSpecsEditorProps) {
  const [specs, setSpecs] = useState<ProductSpecItem[]>(
    createDefaultSpecs(initialSpecs)
  );

  const [specsEn, setSpecsEn] = useState<ProductSpecItem[]>(
    createDefaultSpecs(initialSpecsEn)
  );

  function updateSpec(
    listType: "zh" | "en",
    index: number,
    field: keyof ProductSpecItem,
    value: string
  ) {
    const updater = (currentSpecs: ProductSpecItem[]) =>
      currentSpecs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      );

    if (listType === "zh") {
      setSpecs(updater);
    } else {
      setSpecsEn(updater);
    }
  }

  function addSpec(listType: "zh" | "en") {
    if (listType === "zh") {
      setSpecs((currentSpecs) => [...currentSpecs, { key: "", value: "" }]);
    } else {
      setSpecsEn((currentSpecs) => [...currentSpecs, { key: "", value: "" }]);
    }
  }

  function removeSpec(listType: "zh" | "en", index: number) {
    const remover = (currentSpecs: ProductSpecItem[]) => {
      if (currentSpecs.length <= 1) {
        return [{ key: "", value: "" }];
      }

      return currentSpecs.filter((_, itemIndex) => itemIndex !== index);
    };

    if (listType === "zh") {
      setSpecs(remover);
    } else {
      setSpecsEn(remover);
    }
  }

  return (
    <div className="admin-form-section">
      <h2>产品参数</h2>
      <p className="admin-section-help">
        可自由添加或删除参数，例如型号、规格、材质、适用场景等。未填写完整的参数行不会保存。
      </p>

      <h3>中文参数</h3>

      <div className="dynamic-spec-list">
        {specs.map((spec, index) => (
          <div key={`zh-${index}`} className="dynamic-spec-row">
            <label className="form-field">
              <span>参数名</span>
              <input
                type="text"
                name="specKey"
                value={spec.key}
                onChange={(event) =>
                  updateSpec("zh", index, "key", event.target.value)
                }
                placeholder="例如：型号"
              />
            </label>

            <label className="form-field">
              <span>参数值</span>
              <input
                type="text"
                name="specValue"
                value={spec.value}
                onChange={(event) =>
                  updateSpec("zh", index, "value", event.target.value)
                }
                placeholder="例如：A-100"
              />
            </label>

            <button
              type="button"
              className="ghost-button spec-remove-button"
              onClick={() => removeSpec("zh", index)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="ghost-button" onClick={() => addSpec("zh")}>
        添加中文参数
      </button>

      <hr className="admin-section-divider" />

      <h3>英文参数</h3>
      <p className="admin-section-help">
        用于英文产品详情页展示；如果不填写，英文页面将回退显示中文参数。
      </p>

      <div className="dynamic-spec-list">
        {specsEn.map((spec, index) => (
          <div key={`en-${index}`} className="dynamic-spec-row">
            <label className="form-field">
              <span>英文参数名</span>
              <input
                type="text"
                name="specKeyEn"
                value={spec.key}
                onChange={(event) =>
                  updateSpec("en", index, "key", event.target.value)
                }
                placeholder="Example: Model"
              />
            </label>

            <label className="form-field">
              <span>英文参数值</span>
              <input
                type="text"
                name="specValueEn"
                value={spec.value}
                onChange={(event) =>
                  updateSpec("en", index, "value", event.target.value)
                }
                placeholder="Example: A-100"
              />
            </label>

            <button
              type="button"
              className="ghost-button spec-remove-button"
              onClick={() => removeSpec("en", index)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="ghost-button" onClick={() => addSpec("en")}>
        添加英文参数
      </button>
    </div>
  );
}