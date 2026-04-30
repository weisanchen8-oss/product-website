/**
 * 文件作用：
 * 后台产品图片批量操作的选择工具条。
 * 支持一键全选、取消全选，用于批量加水印等场景。
 */

"use client";

export function ImageSelectToolbar() {
  function setAllChecked(checked: boolean) {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="imageIds"][form="batch-watermark-form"]'
    );

    checkboxes.forEach((checkbox) => {
      checkbox.checked = checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  return (
    <div className="admin-image-select-toolbar">
      <button
        type="button"
        className="ghost-button"
        onClick={() => setAllChecked(true)}
      >
        全选图片
      </button>

      <button
        type="button"
        className="ghost-button"
        onClick={() => setAllChecked(false)}
      >
        取消全选
      </button>
    </div>
  );
}