"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Checkbox from "../input/Checkbox";

interface CheckboxGroupProps {
  isChecked: boolean;
  isCheckedAI: boolean;
  onChangeFirst: () => void;
  onChangeSecond: () => void;
}

export default function CheckboxGroup({
  isChecked,
  isCheckedAI,
  onChangeFirst,
  onChangeSecond,
}: CheckboxGroupProps) {
  return (
    <ComponentCard title="Bạn muốn nhập mô tả bài viết như thế nào?">
      <div className="flex items-center justify-between gap-10">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isChecked}
            onChange={onChangeFirst}
            label="Tự nhập"
          />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isCheckedAI}
            onChange={onChangeSecond}
            label="Viết bài bằng AI"
          />
        </div>
      </div>
    </ComponentCard>
  );
}
