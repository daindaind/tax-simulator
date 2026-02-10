"use client";

import { cn } from "@/lib/utils";

interface BottomCTAProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** 서브 텍스트 (선택) */
  subLabel?: string;
  variant?: "primary" | "ghost";
}

export function BottomCTA({
  label,
  onClick,
  disabled = false,
  subLabel,
  variant = "primary",
}: BottomCTAProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 w-full z-10",
        "bg-[var(--color-bg)]",
        "border-t border-[var(--color-border)]",
        "px-[2rem] pt-[1.6rem] pb-[3.2rem]", /* pb 넉넉하게 — 모바일 홈바 대응 */
      )}
    >
      {subLabel && (
        <p className="text-center text-[1.2rem] text-[var(--color-text-tertiary)] mb-[1rem]">
          {subLabel}
        </p>
      )}

      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-full rounded-[1.6rem] py-[1.8rem]",
          "text-[1.6rem] font-semibold",
          "transition-all duration-200",
          variant === "primary"
            ? disabled
              ? "bg-[#DADBDD] text-white cursor-not-allowed"
              : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98]"
            : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[#d8e2fc]"
        )}
      >
        {label}
      </button>
    </div>
  );
}
