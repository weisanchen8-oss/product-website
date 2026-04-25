/**
 * 文件作用：
 * 定义后台产品参数动态编辑组件。
 * 支持员工自由添加、删除任意数量的产品参数行。
 */

"use client";

import { useState } from "react";

type ProductSpecItem = {
  key: string;
  value: string;
};

type ProductSpecsEditorProps = {
  initialSpecs?: ProductSpecItem[];
};

export function ProductSpecsEditor({
  initialSpecs = [],
}: ProductSpecsEditorProps) {
  const [specs, setSpecs] = useState<ProductSpecItem[]>(
    initialSpecs.length > 0 ? initialSpecs : [{ key: "", value: "" }]
  );

  function updateSpec(index: number, field: keyof ProductSpecItem, value: string) {
    setSpecs((currentSpecs) =>
      currentSpecs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addSpec() {
    setSpecs((currentSpecs) => [...currentSpecs, { key: "", value: "" }]);
  }

  function removeSpec(index: number) {
    setSpecs((currentSpecs) => {
      if (currentSpecs.length <= 1) {
        return [{ key: "", value: "" }];
      }

      return currentSpecs.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  return (
    <div className="admin-form-section">
      <h2>产品参数</h2>
      <p className="admin-section-help">
        可自由添加或删除参数，例如型号、规格、材质、适用场景等。未填写完整的参数行不会保存。
      </p>

      <div className="dynamic-spec-list">
        {specs.map((spec, index) => (
          <div key={index} className="dynamic-spec-row">
            <label className="form-field">
              <span>参数名</span>
              <input
                type="text"
                name="specKey"
                value={spec.key}
                onChange={(event) => updateSpec(index, "key", event.target.value)}
                placeholder="例如：型号"
              />
            </label>

            <label className="form-field">
              <span>参数值</span>
              <input
                type="text"
                name="specValue"
                value={spec.value}
                onChange={(event) => updateSpec(index, "value", event.target.value)}
                placeholder="例如：A-100"
              />
            </label>

            <button
              type="button"
              className="ghost-button spec-remove-button"
              onClick={() => removeSpec(index)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="ghost-button" onClick={addSpec}>
        添加参数
      </button>
    </div>
  );
}