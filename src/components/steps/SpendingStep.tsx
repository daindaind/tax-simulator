"use client";

import { useState } from "react";
import { SpendingInput } from "@/lib/calculator";
import { ACTIVE_RULES, CATEGORY_RATE_DISPLAY } from "@/lib/taxRule";
import { BottomCTA } from "@/components/funnel/BottomCTA";

interface SpendingField {
  key: keyof SpendingInput;
  label: string;
  opacity: string;
  placeholder: string;
  hint: string;
}

const FIELDS: SpendingField[] = [
  {
    key: "creditCard",
    label: "신용카드",
    opacity: "opacity-40",
    placeholder: "10,000,000",
    hint: "공제율이 낮아요. 문턱 채우기에 활용하세요.",
  },
  {
    key: "checkCard",
    label: "체크카드 · 현금영수증",
    opacity: "opacity-70",
    placeholder: "5,000,000",
    hint: "문턱 통과 후 적극 활용하세요!",
  },
  {
    key: "culture",
    label: "도서 · 공연 · 박물관 · 영화",
    opacity: "opacity-70",
    placeholder: "500,000",
    hint: "총급여 7천만 원 이하만 해당해요.",
  },
  {
    key: "sports",
    label: "헬스장 · 수영장",
    opacity: "opacity-70",
    placeholder: "600,000",
    hint: "2025.07.01 이후 등록 시설 이용료만 해당해요.",
  },
  {
    key: "market",
    label: "전통시장",
    opacity: "",
    placeholder: "300,000",
    hint: "한도 초과 후에도 추가 공제 가능!",
  },
  {
    key: "transport",
    label: "대중교통",
    opacity: "",
    placeholder: "200,000",
    hint: "한도 초과 후에도 추가 공제 가능!",
  },
];

interface SpendingStepProps {
  values: SpendingInput;
  onChange: (key: keyof SpendingInput, value: number) => void;
  totalSalary: number;
  onNext: () => void;
}

// 소득 상한이 있는 항목 — ACTIVE_RULES에서 파생
const SALARY_CAPPED_FIELDS = ACTIVE_RULES.categories
  .filter((c) => c.incomeLimit !== null)
  .map((c) => c.key as keyof SpendingInput);

export function SpendingStep({ values, onChange, totalSalary, onNext }: SpendingStepProps) {
  const [focusedKey, setFocusedKey] = useState<keyof SpendingInput | null>(null);
  const isHighIncome = totalSalary > ACTIVE_RULES.incomeTierThreshold;

  const totalUsage = Object.values(values).reduce((a, b) => a + b, 0);
  const hasAnyInput = totalUsage > 0;

  const isSpendingExcessive = totalSalary > 0 && totalUsage > totalSalary;

  const handleInput =
    (key: keyof SpendingInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      onChange(key, raw === "" ? 0 : Number(raw));
    };

  return (
    <div className="relative flex flex-col min-h-[calc(100svh-5.6rem)]">
      <div className="flex-1 px-[2rem] pt-[3.2rem] pb-[2rem]">
        {/* 헤드라인 */}
        <p className="text-[1.4rem] font-medium text-[var(--color-primary)] mb-[0.8rem]">
          STEP 2
        </p>
        <h2 className="text-[2.4rem] font-bold leading-[1.4] text-[var(--color-text-primary)] mb-[0.8rem]">
          올해 어떤 카드를
          <br />
          얼마나 쓰셨나요?
        </h2>
        <p className="text-[1.4rem] text-[var(--color-text-secondary)] mb-[3.2rem]">
          연간 사용액을 입력하세요.
          <br />
          모르면 대략적인 금액도 괜찮아요.
        </p>

        {/* 입력 필드 목록 */}
        <div className="flex flex-col gap-[2rem]">
          {FIELDS.map((field) => {
            const isFocused = focusedKey === field.key;
            const hasValue = values[field.key] > 0;
            const isDisabled = isHighIncome && SALARY_CAPPED_FIELDS.includes(field.key);

            return (
              <div key={field.key} className={isDisabled ? "opacity-40" : ""}>
                {/* 라벨 행 */}
                <div className="flex items-center justify-between mb-[0.8rem]">
                  <div className="flex items-center gap-[0.8rem]">
                    <span className="text-[1.4rem] font-semibold text-[var(--color-text-primary)]">
                      {field.label}
                    </span>
                    {isDisabled && (
                      <span className="text-[1.1rem] font-medium text-white bg-[var(--color-text-tertiary)] px-[0.6rem] py-[0.2rem] rounded-full">
                        해당 없음
                      </span>
                    )}
                  </div>
                  <span className={`text-[1.3rem] font-bold text-[var(--color-primary)] ${field.opacity}`}>
                    공제율 {CATEGORY_RATE_DISPLAY[field.key]}
                  </span>
                </div>

                {/* 인풋 */}
                <div
                  className={`
                    relative flex items-center
                    h-[5.2rem] px-[1.6rem] rounded-[var(--radius-md)]
                    border transition-colors duration-150
                    ${isDisabled
                      ? "border-[var(--color-border)] bg-[var(--color-bg-subtle)] cursor-not-allowed"
                      : isFocused
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                      : hasValue
                      ? "border-[var(--color-primary)] bg-white"
                      : "border-[var(--color-border-mid)] bg-white"
                    }
                  `}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={isDisabled}
                    value={isDisabled ? "" : values[field.key] === 0 ? "" : values[field.key].toLocaleString()}
                    onChange={handleInput(field.key)}
                    onFocus={() => setFocusedKey(field.key)}
                    onBlur={() => setFocusedKey(null)}
                    placeholder={isDisabled ? "총급여 7천만 이하만 해당" : field.placeholder}
                    className="flex-1 bg-transparent text-[1.7rem] font-semibold text-right text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] placeholder:font-normal placeholder:text-[1.3rem] disabled:cursor-not-allowed"
                  />
                  <span className="ml-[0.8rem] text-[1.4rem] text-[var(--color-text-secondary)] shrink-0">
                    원
                  </span>
                </div>

                {/* 힌트 */}
                <p className="mt-[0.5rem] text-[1.2rem] text-[var(--color-text-tertiary)]">
                  {isDisabled ? "총급여 7,000만 원 초과자는 공제 대상에서 제외돼요." : field.hint}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {isSpendingExcessive && (
        <div className="fixed inset-x-0 bottom-60 left-13 w-[80%] bg-red-600 text-white p-3 text-center z-50 animate-fade-in-up rounded-md mx-4 shadow-lg">
          <p className="font-semibold text-[1.3rem]">
            연봉보다 지출이 많습니다. 입력값이 정확한지 다시 확인해 주세요!
          </p>
        </div>
      )}

      <BottomCTA
        label="공제액 계산하기"
        onClick={onNext}
        disabled={!hasAnyInput || isSpendingExcessive}
        subLabel={hasAnyInput ? `총 사용액 ${totalUsage.toLocaleString()}원` : undefined}
      />
    </div>
  );
}
