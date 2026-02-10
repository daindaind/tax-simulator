/**
 * FunnelContainer
 * 레퍼런스(rn-readnumber-web-v2) 기준의 44rem max-width 모바일 최적화 래퍼
 * 전체 화면을 채우고, 헤더 + 스크롤 콘텐츠 + 하단 고정 CTA 구조를 지원
 */

import { cn } from "@/lib/utils";

interface FunnelContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FunnelContainer({ children, className }: FunnelContainerProps) {
  return (
    /* 전체 뷰포트 - 바깥 배경 */
    <div className="min-h-svh bg-[var(--color-bg-subtle)] flex justify-center">
      {/* 44rem 중앙 컬럼 - 실제 앱 영역 */}
      <div
        className={cn(
          "relative w-full max-w-[44rem] min-h-svh",
          "bg-[var(--color-bg)] flex flex-col",
          "shadow-[0_0_40px_rgba(0,0,0,0.06)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
