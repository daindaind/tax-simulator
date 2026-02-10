"use client";

import { useState } from "react";
import { BottomCTA } from "@/components/funnel/BottomCTA";
import { formatKRW } from "@/lib/calculator";

interface SalaryStepProps {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}

const QUICK_VALUES = [
  { label: "3천만", value: 30_000_000 },
  { label: "4천만", value: 40_000_000 },
  { label: "5천만", value: 50_000_000 },
  { label: "7천만", value: 70_000_000 },
];

export function SalaryStep({ value, onChange, onNext }: SalaryStepProps) {
  const [focused, setFocused] = useState(false);
  const threshold = value > 0 ? Math.floor(value * 0.25) : null;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw === "" ? 0 : Number(raw));
  };

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
              onChange={handleInput}
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
        <div>
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
      </div>

      <BottomCTA
        label="다음"
        onClick={onNext}
        disabled={value === 0}
      />
    </div>
  );
}
