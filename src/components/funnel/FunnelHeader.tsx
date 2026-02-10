"use client";

import { cn } from "@/lib/utils";

interface FunnelHeaderProps {
  /** 현재 스텝 (0-based). 0 = 랜딩(헤더 미노출) */
  step: number;
  /** 전체 스텝 수 (랜딩 제외) */
  totalSteps: number;
  onBack?: () => void;
  title?: string;
}

const STEP_LABELS = ["급여 입력", "카드 사용액", "공제 게이지", "최종 결과"];

export function FunnelHeader({ step, totalSteps, onBack, title }: FunnelHeaderProps) {
  /* step 0은 랜딩 — 헤더 없음 */
  if (step === 0) return null;

  const progressPct = Math.round((step / totalSteps) * 100);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 w-full bg-[var(--color-bg)]",
        "border-b border-[var(--color-border)]"
      )}
    >
      {/* 진행 바 */}
      <div className="h-[0.4rem] w-full bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 헤더 본문 */}
      <div
        className="flex items-center justify-between px-[2rem]"
        style={{ height: "5.6rem" }}
      >
        {/* 뒤로가기 */}
        <button
          onClick={onBack}
          aria-label="이전 단계"
          className="flex items-center justify-center w-[2.4rem] h-[2.4rem] rounded-full hover:bg-[var(--color-bg-subtle)] transition-colors"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path
              d="M9 1L1 9L9 17"
              stroke="#141617"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 스텝 타이틀 */}
        <span
          className="text-[1.4rem] font-semibold text-[var(--color-text-primary)]"
        >
          {title ?? STEP_LABELS[step - 1]}
        </span>

        {/* 스텝 카운터 */}
        <span
          className="text-[1.2rem] font-medium text-[var(--color-text-tertiary)]"
        >
          {step} / {totalSteps}
        </span>
      </div>
    </header>
  );
}
