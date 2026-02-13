"use client";

import { useState } from "react";
import { BottomCTA } from "@/components/funnel/BottomCTA";
import { formatKRW } from "@/lib/calculator";

interface SalaryStepProps {
  value: number;
  onChange: (v: number) => void;
  numberOfChildren: number;
  onChildrenChange: (n: number) => void;
  onNext: () => void;
}

const QUICK_VALUES = [
  { label: "3천만", value: 30_000_000 },
  { label: "4천만", value: 40_000_000 },
  { label: "5천만", value: 50_000_000 },
  { label: "7천만", value: 70_000_000 },
];

/** 급여·자녀 수에 따른 추가 공제 피드백 메시지 */
function getChildrenBenefit(salary: number, children: number): string | null {
  if (children <= 0) return null;
  const isUnder = salary <= 70_000_000;

  if (children === 1) {
    const bonus = isUnder ? "50만원" : "25만원";
    return `${bonus} 추가 공제돼요`;
  }
  // 2명 이상
  const maxLimit = isUnder ? "400만원" : "300만원";
  return `최대 ${maxLimit}까지 공제돼요`;
}

export function SalaryStep({
  value,
  onChange,
  numberOfChildren,
  onChildrenChange,
  onNext,
}: SalaryStepProps) {
  const [focused, setFocused] = useState(false);
  const [hasChildren, setHasChildren] = useState(numberOfChildren > 0);

  const threshold = value > 0 ? Math.floor(value * 0.25) : null;

  const handleSalaryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw === "" ? 0 : Number(raw));
  };

  const handleChildrenToggle = (checked: boolean) => {
    setHasChildren(checked);
    if (!checked) onChildrenChange(0);
  };

  const handleChildrenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChildrenChange(raw === "" ? 0 : Number(raw));
  };

  const benefitMessage =
    hasChildren && value > 0
      ? getChildrenBenefit(value, numberOfChildren)
      : null;

  return (
    <div className="flex flex-col min-h-[calc(100svh-5.6rem)]">
      <div className="flex-1 px-[2rem] pt-[3.2rem]">
        {/* 질문 헤드라인 */}
        <p className="text-[1.4rem] font-medium text-[var(--color-primary)] mb-[0.8rem]">
          STEP 1
        </p>
        <h2 className="text-[2.4rem] font-bold leading-[1.4] text-[var(--color-text-primary)] mb-[0.8rem]">
          올해 총급여가
          <br />
          얼마인가요?
        </h2>
        <p className="text-[1.4rem] text-[var(--color-text-secondary)] mb-[3.2rem]">
          세전 연봉 기준으로 입력해주세요.
          <br />
          공제 문턱(25%) 계산의 기준이 돼요.
        </p>

        {/* 입력 필드 */}
        <div className="mb-[2rem]">
          <label
            htmlFor="salary"
            className="block text-[1.2rem] text-[var(--color-text-secondary)] mb-[0.8rem]"
          >
            총급여액
          </label>
          <div
            className={`
              relative flex items-center
              h-[5.6rem] px-[1.6rem] rounded-[var(--radius-md)]
              border transition-colors duration-150
              ${focused
                ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                : "border-[var(--color-border-mid)] bg-white"
              }
            `}
          >
            <input
              id="salary"
              type="text"
              inputMode="numeric"
              value={value === 0 ? "" : value.toLocaleString()}
              onChange={handleSalaryInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="46,800,000"
              className="flex-1 bg-transparent text-[2rem] font-bold text-right text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] placeholder:font-normal placeholder:text-[1.6rem]"
            />
            <span className="ml-[0.8rem] text-[1.6rem] text-[var(--color-text-secondary)] font-medium shrink-0">
              원
            </span>
          </div>

          {/* 실시간 문턱 프리뷰 */}
          {threshold !== null && (
            <div className="animate-fade-up mt-[1.2rem] flex items-center justify-between px-[1.6rem] py-[1.2rem] rounded-[var(--radius-sm)] bg-[var(--color-primary-bg)]">
              <span className="text-[1.3rem] text-[var(--color-text-secondary)]">
                공제 문턱 (25%)
              </span>
              <span className="text-[1.5rem] font-bold text-[var(--color-primary)]">
                {formatKRW(threshold)}
              </span>
            </div>
          )}
        </div>

        {/* 빠른 선택 */}
        <div className="mb-[2.8rem]">
          <p className="text-[1.2rem] text-[var(--color-text-tertiary)] mb-[1rem]">
            빠른 선택
          </p>
          <div className="grid grid-cols-4 gap-[0.8rem]">
            {QUICK_VALUES.map((q) => (
              <button
                key={q.value}
                onClick={() => onChange(q.value)}
                className={`
                  py-[1rem] rounded-[var(--radius-sm)]
                  text-[1.3rem] font-semibold
                  border transition-all duration-150
                  ${value === q.value
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border-mid)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }
                `}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 자녀 여부 */}
        <div>
          {/* 체크박스 행 */}
          <label className="flex items-center gap-[1.2rem] h-10 cursor-pointer">
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => handleChildrenToggle(e.target.checked)}
                className="w-[1.4rem] h-[1.4rem] rounded-[0.4rem] accent-[var(--color-primary)] cursor-pointer"
              />
              <span className="text-[1.4rem] text-[var(--color-text-primary)] whitespace-nowrap">
                자녀가 있어요
              </span>

            {/* 자녀 수 입력 — 체크 시에만 표시 */}
            {hasChildren && (
              <div className="ml-auto flex items-center gap-[0.8rem] animate-fade-up">
                <input
                  type="text"
                  inputMode="numeric"
                  value={numberOfChildren === 0 ? "" : String(numberOfChildren)}
                  onChange={handleChildrenInput}
                  placeholder="0"
                  maxLength={2}
                  className="w-[7rem] bg-transparent text-[2rem] font-bold text-right text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] placeholder:font-normal placeholder:text-[1.6rem]"
                />
                <span className="text-[1.4rem] text-[var(--color-text-secondary)]">명</span>
              </div>
            )}
          </label>

          {/* 동적 피드백 메시지 */}
          {benefitMessage && (
            <p className="animate-fade-up mt-[0.5rem] ml-[2.5rem] text-[1.3rem] font-semibold text-[var(--color-primary)]">
              ✓ {benefitMessage}
            </p>
          )}
        </div>
      </div>

      <BottomCTA
        label="다음"
        onClick={onNext}
        disabled={value === 0}
      />
    </div>
  );
}
