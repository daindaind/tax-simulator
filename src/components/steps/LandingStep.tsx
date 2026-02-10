"use client";

import { BottomCTA } from "@/components/funnel/BottomCTA";

interface LandingStepProps {
  onStart: () => void;
}

export function LandingStep({ onStart }: LandingStepProps) {
  return (
    <div className="flex flex-col min-h-svh">
      {/* 상단 콘텐츠 — 스크롤 영역 */}
      <div className="flex-1 flex flex-col px-[2rem] pt-[6rem]">
        {/* 아이콘 배지 */}
        <div className="inline-flex items-center gap-[0.6rem] bg-[var(--color-primary-bg)] rounded-full px-[1.2rem] py-[0.6rem] w-fit mb-[2.4rem]">
          <span className="text-[1.4rem]">💰</span>
          <span className="text-[1.2rem] font-semibold text-[var(--color-primary)]">
            연말정산 시뮬레이터
          </span>
        </div>

        {/* 메인 헤드라인 */}
        <h1
          className="text-[2.8rem] font-bold leading-[1.4] text-[var(--color-text-primary)] mb-[1.6rem]"
        >
          나는 올해
          <br />
          <span className="text-[var(--color-primary)]">얼마나</span> 돌려받을 수 있을까?
        </h1>

        {/* 서브 카피 */}
        <p className="text-[1.5rem] leading-[1.7] text-[var(--color-text-secondary)] mb-[4rem]">
          카드 사용 패턴만 입력하면
          <br />
          예상 공제액과 절세 전략을 바로 알려드려요.
        </p>

        {/* 3가지 포인트 카드 */}
        <div className="flex flex-col gap-[1.2rem] mb-[4rem]">
          {[
            {
              icon: "🎯",
              title: "문턱을 넘어야 공제가 시작돼요",
              desc: "총급여의 25% 이상 써야 공제 혜택이 생겨요",
            },
            {
              icon: "💳",
              title: "카드 종류가 공제율을 결정해요",
              desc: "체크카드는 신용카드보다 공제율이 2배예요",
            },
            {
              icon: "✨",
              title: "전통시장·대중교통은 보너스",
              desc: "한도를 다 채워도 추가 공제를 받을 수 있어요",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-[1.4rem] p-[1.6rem] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
            >
              <span className="text-[2rem] leading-none mt-[0.1rem]">{item.icon}</span>
              <div>
                <p className="text-[1.4rem] font-semibold text-[var(--color-text-primary)] mb-[0.2rem]">
                  {item.title}
                </p>
                <p className="text-[1.3rem] text-[var(--color-text-secondary)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="text-[1.2rem] text-[var(--color-text-tertiary)] text-center mb-[2rem]">
          약 2분이면 충분해요
        </p>
      </div>

      {/* 하단 CTA */}
      <BottomCTA
        label="내 공제액 확인하기"
        onClick={onStart}
        subLabel="2024년 세법 기준 · 총 4단계"
      />
    </div>
  );
}
