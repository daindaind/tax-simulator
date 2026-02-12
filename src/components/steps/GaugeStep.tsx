"use client";

import { useEffect, useRef, useState } from "react";
import { CalculationResult, formatKRW } from "@/lib/calculator";
import { BottomCTA } from "@/components/funnel/BottomCTA";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   마일스톤 구간 정의
───────────────────────────────────────────── */
interface Milestone {
  id: string;
  pct: number;
  label: string;
  emoji: string;
  message: string;
  zoneColor: string;
  bgColor: string;
  textColor: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "threshold",
    pct: 33,
    label: "문턱 통과",
    emoji: "🎉",
    message: "공제가 시작됐어요! 이제부터 체크카드가 유리해요.",
    zoneColor: "#5a7cf2",
    bgColor: "#e7ecfd",
    textColor: "#4872df",
  },
  {
    id: "halfway",
    pct: 66,
    label: "반환점",
    emoji: "🔥",
    message: "절반 달성! 공제 한도가 보이기 시작했어요.",
    zoneColor: "#8b5cf6",
    bgColor: "#f3e8ff",
    textColor: "#7c3aed",
  },
  {
    id: "limit",
    pct: 90,
    label: "한도 임박",
    emoji: "🎯",
    message: "거의 다 왔어요! 이제 전통시장·대중교통으로 추가 공제를 노리세요.",
    zoneColor: "#10b981",
    bgColor: "#d1fae5",
    textColor: "#059669",
  },
];

const ANIMATION_DURATION = 2500; // ms

/* ─────────────────────────────────────────────
   수직 게이지 바
───────────────────────────────────────────── */
function VerticalGauge({
  pct,
  reachedMilestones,
}: {
  pct: number;
  reachedMilestones: Set<string>;
}) {
  const gaugeColor = reachedMilestones.has("limit")
    ? "#10b981"
    : reachedMilestones.has("halfway")
    ? "#8b5cf6"
    : reachedMilestones.has("threshold")
    ? "#5a7cf2"
    : "#f97316";

  return (
    <div className="relative flex flex-col items-center">
      {/* 게이지 트랙 */}
      <div
        className="relative w-[3.2rem] rounded-full overflow-hidden bg-[var(--color-border)]"
        style={{ height: "24rem" }}
      >
        {/* 마일스톤 눈금선 */}
        {MILESTONES.map((m) => (
          <div
            key={m.id}
            className="absolute left-0 right-0 h-[1px] opacity-40"
            style={{ bottom: `${m.pct}%`, backgroundColor: m.zoneColor }}
          />
        ))}

        {/* 채워지는 바 */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            height: `${Math.min(100, pct)}%`,
            background: `linear-gradient(to top, ${gaugeColor}cc, ${gaugeColor})`,
          }}
        >
          {pct > 0 && (
            <div className="absolute top-0 left-0 right-0 h-[1.6rem] rounded-t-full bg-white/30" />
          )}
        </div>
      </div>

      {/* 마일스톤 라벨 (우측) */}
      <div className="absolute right-[-10rem] top-0" style={{ height: "24rem" }}>
        {MILESTONES.map((m) => {
          const reached = reachedMilestones.has(m.id);
          return (
            <div
              key={m.id}
              className="absolute flex items-center gap-[0.6rem]"
              style={{ bottom: `calc(${m.pct}% - 1rem)`, right: 0 }}
            >
              <div
                className={cn(
                  "w-[0.8rem] h-[0.8rem] rounded-full border-2 transition-all duration-300",
                  reached ? "scale-125" : "opacity-30"
                )}
                style={{
                  backgroundColor: reached ? m.zoneColor : "transparent",
                  borderColor: m.zoneColor,
                }}
              />
              <span
                className={cn(
                  "text-[1.2rem] font-semibold whitespace-nowrap transition-all duration-300",
                  reached ? "opacity-100" : "opacity-30"
                )}
                style={{ color: m.zoneColor }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* % 표시 */}
      <div className="mt-[1.2rem] text-center">
        <span
          className="text-[2.4rem] font-bold transition-colors duration-500"
          style={{ color: gaugeColor }}
        >
          {Math.min(100, Math.round(pct))}%
        </span>
        <p className="text-[1.1rem] text-[var(--color-text-tertiary)] mt-[0.2rem]">
          한도 소진률
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   마일스톤 토스트
───────────────────────────────────────────── */
function MilestoneToast({
  milestone,
  onDismiss,
}: {
  milestone: Milestone;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="animate-fade-up fixed bottom-[11rem] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-4rem)] max-w-[36rem]">
      <div
        className="animate-celebrate flex items-start gap-[1.2rem] px-[1.6rem] py-[1.4rem] rounded-[var(--radius-lg)] shadow-lg"
        style={{
          backgroundColor: milestone.bgColor,
          border: `1.5px solid ${milestone.zoneColor}30`,
        }}
      >
        <span className="text-[2.4rem] leading-none">{milestone.emoji}</span>
        <div>
          <p
            className="text-[1.4rem] font-bold mb-[0.2rem]"
            style={{ color: milestone.textColor }}
          >
            {milestone.label} 달성!
          </p>
          <p className="text-[1.3rem] text-[var(--color-text-secondary)]">
            {milestone.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-auto shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mt-[0.2rem]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GaugeStep 메인
───────────────────────────────────────────── */
interface GaugeStepProps {
  result: CalculationResult;
  totalSalary: number;
  onNext: () => void;
}

type Phase = "filling" | "done";

export function GaugeStep({ result, onNext }: GaugeStepProps) {
  const [displayPct, setDisplayPct] = useState(0);
  const [phase, setPhase] = useState<Phase>("filling");
  const [reachedMilestones, setReachedMilestones] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<Milestone[]>([]);
  const [activeToast, setActiveToast] = useState<Milestone | null>(null);

  const rafRef = useRef<number | null>(null);
  // 애니메이션 루프 내 중복 감지 방지용 ref
  const reachedRef = useRef<Set<string>>(new Set());

  // 최종 게이지 % — 마운트 시 고정값
  const thresholdPct =
    result.threshold > 0
      ? Math.min(100, (result.totalUsage / result.threshold) * 100)
      : 0;
  const limitPct =
    result.baseLimit > 0
      ? Math.min(100, (result.generalDeduction / result.baseLimit) * 100)
      : 0;
  const targetPct =
    thresholdPct < 100
      ? (thresholdPct / 100) * 33
      : 33 + (limitPct / 100) * 67;

  /* ── Phase 1→2: 애니메이션 루프 ── */
  useEffect(() => {
    const startTime = performance.now();
    let prevPct = 0;

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      // ease-out cubic: 처음엔 빠르게, 끝에서 부드럽게 감속
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * targetPct;

      setDisplayPct(current);

      // 마일스톤 통과 감지 → 토스트 큐에 순차 추가
      MILESTONES.forEach((m) => {
        if (current >= m.pct && prevPct < m.pct && !reachedRef.current.has(m.id)) {
          reachedRef.current.add(m.id);
          setReachedMilestones(new Set(reachedRef.current));
          setToastQueue((prev) => [...prev, m]);
        }
      });

      prevPct = current;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setTimeout(() => setPhase("done"), 300);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── 토스트 큐 처리 ── */
  useEffect(() => {
    if (!activeToast && toastQueue.length > 0) {
      setActiveToast(toastQueue[0]);
      setToastQueue((prev) => prev.slice(1));
    }
  }, [activeToast, toastQueue]);

  const stageLabel =
    result.stage === "UNDER_THRESHOLD"
      ? "문턱 도달 전"
      : result.stage === "NEAR_LIMIT"
      ? "한도 임박"
      : "공제 진행 중";

  return (
    <div className="flex flex-col min-h-[calc(100svh-5.6rem)]">
      <div className="flex-1 px-[2rem] pt-[3.2rem]">
        <p className="text-[1.4rem] font-medium text-[var(--color-primary)] mb-[0.8rem]">
          STEP 3
        </p>
        <h2 className="text-[2.4rem] font-bold leading-[1.4] text-[var(--color-text-primary)] mb-[0.4rem]">
          공제 달성 현황
        </h2>
        <p className="text-[1.4rem] text-[var(--color-text-secondary)] mb-[4rem]">
          게이지를 채울수록 환급액이 늘어나요!
        </p>

        {/* ── Phase 1·2: 게이지 중앙 / Phase 3: 좌우 레이아웃 ── */}
        <div
          className={cn(
            "flex items-start mb-[3.2rem] transition-all duration-500",
            phase === "filling" ? "justify-center" : "gap-[2rem]"
          )}
        >
          {/* 수직 게이지 */}
          <div
            className={cn(
              "shrink-0 transition-all duration-500",
              phase === "done" && "ml-[1rem]"
            )}
          >
            <VerticalGauge pct={displayPct} reachedMilestones={reachedMilestones} />
          </div>

          {/* 우측 정보 패널 — Phase done에서 표시 */}
          {phase === "done" && (
            <div className="flex-1 flex flex-col gap-[1.2rem] pt-[0.4rem] animate-fade-up">
              {/* 현재 단계 배지 */}
              <div className="inline-flex items-center gap-[0.6rem] bg-[var(--color-primary-bg)] px-[1.2rem] py-[0.6rem] rounded-full w-fit">
                <div className="w-[0.6rem] h-[0.6rem] rounded-full bg-[var(--color-primary)] animate-pulse" />
                <span className="text-[1.2rem] font-semibold text-[var(--color-primary)]">
                  {stageLabel}
                </span>
              </div>

              {/* 공제 가능 금액 */}
              <div className="p-[1.6rem] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                <p className="text-[1.2rem] text-[var(--color-text-tertiary)] mb-[0.4rem]">
                  공제 가능 금액
                </p>
                <p className="text-[2.2rem] font-bold text-[var(--color-text-primary)]">
                  {formatKRW(result.potentialDeduction)}
                </p>
              </div>

              {/* 일반 / 추가 분리 */}
              <div className="flex flex-col gap-[0.8rem]">
                <div className="flex justify-between items-center px-[1.2rem] py-[1rem] rounded-[var(--radius-sm)] bg-white border border-[var(--color-border)]">
                  <span className="text-[1.3rem] text-[var(--color-text-secondary)]">일반 공제</span>
                  <span className="text-[1.4rem] font-bold text-[var(--color-primary)]">
                    {formatKRW(result.generalDeduction)}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex justify-between items-center px-[1.2rem] py-[1rem] rounded-[var(--radius-sm)] border transition-all duration-300",
                    result.extraDeduction > 0
                      ? "bg-[#d1fae5] border-[#10b981]/30"
                      : "bg-white border-[var(--color-border)] opacity-40"
                  )}
                >
                  <span className="text-[1.3rem] text-[var(--color-text-secondary)]">추가 공제</span>
                  <span
                    className={cn(
                      "text-[1.4rem] font-bold",
                      result.extraDeduction > 0
                        ? "text-[#059669]"
                        : "text-[var(--color-text-disabled)]"
                    )}
                  >
                    {result.extraDeduction > 0 ? `+${formatKRW(result.extraDeduction)}` : "-"}
                  </span>
                </div>
              </div>

              {/* 문턱 / 한도 안내 */}
              {result.stage === "UNDER_THRESHOLD" && (
                <div className="px-[1.2rem] py-[1rem] rounded-[var(--radius-sm)] bg-[var(--color-warning-bg)]">
                  <p className="text-[1.2rem] text-orange-600">
                    문턱까지{" "}
                    <span className="font-bold">{formatKRW(result.thresholdGap)}</span>{" "}
                    남았어요
                  </p>
                </div>
              )}
              {result.stage !== "UNDER_THRESHOLD" && result.limitRemaining > 0 && (
                <div className="px-[1.2rem] py-[1rem] rounded-[var(--radius-sm)] bg-[var(--color-primary-bg)]">
                  <p className="text-[1.2rem] text-[var(--color-primary)]">
                    한도까지{" "}
                    <span className="font-bold">{formatKRW(result.limitRemaining)}</span>{" "}
                    더 가능해요
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 마일스톤 토스트 */}
      {activeToast && (
        <MilestoneToast
          milestone={activeToast}
          onDismiss={() => setActiveToast(null)}
        />
      )}

      <BottomCTA
        label="최종 결과 보기"
        onClick={onNext}
        subLabel={
          phase === "done"
            ? `최종 공제액 ${formatKRW(result.finalDeduction)}`
            : undefined
        }
      />
    </div>
  );
}
