"use client";

import { useState } from "react";
import { SpendingInput } from "@/lib/calculator";
import { BottomCTA } from "@/components/funnel/BottomCTA";

interface SpendingField {
  key: keyof SpendingInput;
  label: string;
  rate: string;
  opacity: string;
  placeholder: string;
  hint: string;
}

const FIELDS: SpendingField[] = [
  {
    key: "creditCard",
    label: "신용카드",
    rate: "15%",
    opacity: "opacity-40",
    placeholder: "10,000,000",
    hint: "공제율이 낮아요. 문턱 채우기에 활용하세요.",
  },
  {
    key: "checkCard",
    label: "체크카드 · 현금영수증",
    rate: "30%",
    opacity: "opacity-70",
    placeholder: "5,000,000",
    hint: "문턱 통과 후 적극 활용하세요!",
  },
  {
    key: "culture",
    label: "도서 · 공연 · 박물관",
    rate: "30%",
    opacity: "opacity-70",
    placeholder: "500,000",
    hint: "총급여 7천만 원 이하만 해당해요.",
  },
  {
    key: "market",
    label: "전통시장",
    rate: "40%",
    opacity: "",
    placeholder: "300,000",
    hint: "한도 초과 후에도 추가 공제 가능!",
  },
  {
    key: "transport",
    label: "대중교통",
    rate: "40%",
    opacity: "",
    placeholder: "200,000",
    hint: "한도 초과 후에도 추가 공제 가능!",
  },
];

interface SpendingStepProps {
  values: SpendingInput;
  onChange: (key: keyof SpendingInput, value: number) => void;
  onNext: () => void;
}

export function SpendingStep({ values, onChange, onNext }: SpendingStepProps) {
  const [focusedKey, setFocusedKey] = useState<keyof SpendingInput | null>(null);

  const totalUsage = Object.values(values).reduce((a, b) => a + b, 0);
  const hasAnyInput = totalUsage > 0;

  const handleInput =
    (key: keyof SpendingInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      onChange(key, raw === "" ? 0 : Number(raw));
    };

  return (
    <div className="flex flex-col min-h-[calc(100svh-5.6rem)]">
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

            return (
              <div key={field.key}>
                {/* 라벨 행 */}
                <div className="flex items-center justify-between mb-[0.8rem]">
                  <div className="flex items-center gap-[0.8rem]">
                    <span className="text-[1.4rem] font-semibold text-[var(--color-text-primary)]">
                      {field.label}
                    </span>
                  </div>
                  <span className={`text-[1.3rem] font-bold text-[var(--color-primary)] ${field.opacity}`}>
                    공제율 {field.rate}
                  </span>
                </div>

                {/* 인풋 */}
                <div
                  className={`
                    relative flex items-center
                    h-[5.2rem] px-[1.6rem] rounded-[var(--radius-md)]
                    border transition-colors duration-150
                    ${isFocused
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
                    value={values[field.key] === 0 ? "" : values[field.key].toLocaleString()}
                    onChange={handleInput(field.key)}
                    onFocus={() => setFocusedKey(field.key)}
                    onBlur={() => setFocusedKey(null)}
                    placeholder={field.placeholder}
                    className="flex-1 bg-transparent text-[1.7rem] font-semibold text-right text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] placeholder:font-normal placeholder:text-[1.5rem]"
                  />
                  <span className="ml-[0.8rem] text-[1.4rem] text-[var(--color-text-secondary)] shrink-0">
                    원
                  </span>
                </div>

                {/* 힌트 */}
                <p className="mt-[0.5rem] text-[1.2rem] text-[var(--color-text-tertiary)]">
                  {field.hint}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <BottomCTA
        label="공제액 계산하기"
        onClick={onNext}
        disabled={!hasAnyInput}
        subLabel={hasAnyInput ? `총 사용액 ${totalUsage.toLocaleString()}원` : undefined}
      />
    </div>
  );
}
