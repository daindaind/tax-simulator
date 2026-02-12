"use client";

import { CalculationResult, formatKRW, SpendingInput } from "@/lib/calculator";
import { ACTIVE_RULES, CATEGORY_RATE_DISPLAY } from "@/lib/taxRule";
import { BottomCTA } from "@/components/funnel/BottomCTA";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   소비패턴 개선 제안 생성기
───────────────────────────────────────────── */
interface Suggestion {
  icon: string;
  title: string;
  body: string;
  accentColor: string;
  bgColor: string;
}

function buildSuggestions(
  result: CalculationResult,
  spending: SpendingInput,
  totalSalary: number
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // 1) 신용카드 비중이 높을 때
  const totalCard = spending.creditCard + spending.checkCard;
  const creditRatio = totalCard > 0 ? spending.creditCard / totalCard : 0;
  if (creditRatio > 0.6 && result.stage !== "UNDER_THRESHOLD") {
    suggestions.push({
      icon: "🔄",
      title: "체크카드로 전환하세요",
      body: `현재 신용카드 비중이 ${Math.round(creditRatio * 100)}%예요. 체크카드로 전환하면 공제율이 15% → 30%로 2배가 돼요.`,
      accentColor: "#5a7cf2",
      bgColor: "#f3f6fe",
    });
  }

  // 2) 전통시장·대중교통 활용 미비
  const bonusTotal = spending.market + spending.transport;
  if (bonusTotal < 500_000 && result.stage !== "UNDER_THRESHOLD") {
    suggestions.push({
      icon: "🛒",
      title: "전통시장·대중교통을 활용하세요",
      body: "전통시장과 대중교통은 공제율 40%에, 일반 한도를 다 채워도 최대 100만 원 추가 공제가 가능해요.",
      accentColor: "#10b981",
      bgColor: "#d1fae5",
    });
  }

  // 3) 문턱 미달
  if (result.stage === "UNDER_THRESHOLD") {
    suggestions.push({
      icon: "⚡",
      title: "지금은 카드 종류보다 사용 자체가 중요해요",
      body: `문턱(${formatKRW(result.threshold)})을 아직 못 넘었어요. 어떤 카드든 빨리 채우고, 그 이후부터 전략적으로 써요.`,
      accentColor: "#f97316",
      bgColor: "#fff7ed",
    });
  }

  // 4) 한도 초과 상태
  if (result.limitRemaining === 0 && result.extraDeduction === 0) {
    suggestions.push({
      icon: "🎯",
      title: "이제 전통시장·대중교통이 답이에요",
      body: "일반 공제 한도를 꽉 채웠어요! 추가 100만 원 공제를 위해 전통시장 장보기와 대중교통을 적극 활용하세요.",
      accentColor: "#10b981",
      bgColor: "#d1fae5",
    });
  }

  // 5) 공제 잘 받고 있는 경우 칭찬
  if (result.finalDeduction >= 2_500_000) {
    suggestions.push({
      icon: "🏆",
      title: "최적의 소비 패턴에 가까워요",
      body: `${formatKRW(result.finalDeduction)}의 공제를 받을 수 있어요. 연간 소비 계획을 이 패턴으로 유지해보세요.`,
      accentColor: "#8b5cf6",
      bgColor: "#f3e8ff",
    });
  }

  return suggestions.slice(0, 3);
}

/* ─────────────────────────────────────────────
   좌측 미니 수직 게이지
───────────────────────────────────────────── */
function MiniGauge({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? "#10b981" : pct >= 66 ? "#8b5cf6" : pct >= 33 ? "#5a7cf2" : "#f97316";

  return (
    <div className="flex flex-col items-center gap-[1.2rem]">
      {/* 트랙 */}
      <div
        className="relative w-[2.4rem] rounded-full bg-[var(--color-border)] overflow-hidden"
        style={{ height: "16rem" }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            height: `${Math.min(100, pct)}%`,
            background: `linear-gradient(to top, ${color}cc, ${color})`,
          }}
        />
        {/* 눈금 */}
        {[33, 66, 90].map((p) => (
          <div
            key={p}
            className="absolute left-0 right-0 h-[1px] bg-white/60"
            style={{ bottom: `${p}%` }}
          />
        ))}
      </div>

      {/* % */}
      <span className="text-[1.8rem] font-bold" style={{ color }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   항목별 공제 미니 테이블
───────────────────────────────────────────── */
const BREAKDOWN_LABELS: Record<string, { label: string; icon: string }> = {
  creditCard: { label: "신용카드",        icon: "💳" },
  checkCard:  { label: "체크카드",        icon: "🏧" },
  culture:    { label: "도서·공연·영화",  icon: "🎭" },
  sports:     { label: "헬스장·수영장",   icon: "🏋️" },
  market:     { label: "전통시장",        icon: "🛒" },
  transport:  { label: "대중교통",        icon: "🚌" },
};

/* ─────────────────────────────────────────────
   ResultStep 메인
───────────────────────────────────────────── */
interface ResultStepProps {
  result: CalculationResult;
  spending: SpendingInput;
  totalSalary: number;
  onRestart: () => void;
}

function getTaxRate(salary: number): number {
  for (const bracket of ACTIVE_RULES.taxBrackets) {
    if (bracket.upTo === null || salary <= bracket.upTo) return bracket.rate;
  }
  return ACTIVE_RULES.taxBrackets[ACTIVE_RULES.taxBrackets.length - 1].rate;
}

export function ResultStep({ result, spending, totalSalary, onRestart }: ResultStepProps) {
  const suggestions = buildSuggestions(result, spending, totalSalary);
  const estimatedRefund = Math.floor(result.finalDeduction * getTaxRate(totalSalary));

  const gaugePct =
    result.threshold > 0
      ? result.stage === "UNDER_THRESHOLD"
        ? (result.totalUsage / result.threshold) * 33
        : 33 + (result.generalDeduction / result.baseLimit) * 67
      : 0;

  const breakdownEntries = Object.entries(result.breakdown).filter(
    ([, v]) => v > 0
  ) as [keyof typeof result.breakdown, number][];

  return (
    <div className="flex flex-col min-h-[calc(100svh-5.6rem)]">
      <div className="flex-1 px-[2rem] pt-[3.2rem] pb-[2rem]">
        <p className="text-[1.4rem] font-medium text-[var(--color-primary)] mb-[0.8rem]">
          STEP 4
        </p>
        <h2 className="text-[2.4rem] font-bold leading-[1.4] text-[var(--color-text-primary)] mb-[3.2rem]">
          최종 절세 결과
        </h2>

        {/* ── 메인 섹션: 좌(게이지) + 우(금액) ── */}
        <div className="flex gap-[2rem] mb-[3.2rem]">
          {/* 좌측 게이지 */}
          <div className="shrink-0 flex flex-col items-center pt-[0.4rem]">
            <MiniGauge pct={gaugePct} />
          </div>

          {/* 우측 금액 */}
          <div className="flex-1 flex flex-col gap-[1.2rem]">
            {/* 최종 공제액 강조 */}
            <div className="p-[2rem] rounded-[var(--radius-lg)] bg-[var(--color-primary-bg)] border border-[var(--color-primary-light)]">
              <p className="text-[1.3rem] text-[var(--color-text-secondary)] mb-[0.4rem]">
                최종 소득공제
              </p>
              <p className="text-[3rem] font-bold text-[var(--color-primary)] leading-none mb-[1.2rem]">
                {formatKRW(result.finalDeduction)}
              </p>
              <div className="pt-[1.2rem] border-t border-[var(--color-primary-light)]">
                <p className="text-[1.2rem] text-[var(--color-text-tertiary)] mb-[0.2rem]">
                  예상 환급액 (세율 {(getTaxRate(totalSalary) * 100).toFixed(0)}% 적용)
                </p>
                <p className="text-[2rem] font-bold text-[#059669]">
                  약 {formatKRW(estimatedRefund)}
                </p>
              </div>
            </div>

            {/* 일반 / 추가 분리 */}
            <div className="flex flex-col gap-[0.6rem]">
              <div className="flex justify-between items-center px-[1.4rem] py-[1rem] rounded-[var(--radius-sm)] bg-white border border-[var(--color-border)]">
                <span className="text-[1.3rem] text-[var(--color-text-secondary)]">일반 공제</span>
                <span className="text-[1.4rem] font-bold text-[var(--color-primary)]">
                  {formatKRW(result.generalDeduction)}
                </span>
              </div>
              <div
                className={cn(
                  "flex justify-between items-center px-[1.4rem] py-[1rem] rounded-[var(--radius-sm)] border",
                  result.extraDeduction > 0
                    ? "bg-[#d1fae5] border-[#10b981]/30"
                    : "bg-white border-[var(--color-border)] opacity-40"
                )}
              >
                <span className="text-[1.3rem] text-[var(--color-text-secondary)]">추가 공제</span>
                <span className={cn("text-[1.4rem] font-bold", result.extraDeduction > 0 ? "text-[#059669]" : "text-[var(--color-text-disabled)]")}>
                  {result.extraDeduction > 0 ? `+${formatKRW(result.extraDeduction)}` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 항목별 공제 내역 ── */}
        {breakdownEntries.length > 0 && (
          <div className="mb-[3.2rem]">
            <h3 className="text-[1.5rem] font-bold text-[var(--color-text-primary)] mb-[1.2rem]">
              항목별 공제 내역
            </h3>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden">
              {breakdownEntries.map(([key, amount], i) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between px-[1.6rem] py-[1.2rem]",
                    i < breakdownEntries.length - 1 ? "border-b border-[var(--color-border)]" : ""
                  )}
                >
                  <div className="flex items-center gap-[0.8rem]">
                    <span className="text-[1.6rem]">{BREAKDOWN_LABELS[key].icon}</span>
                    <span className="text-[1.4rem] text-[var(--color-text-secondary)]">
                      {BREAKDOWN_LABELS[key].label}
                    </span>
                    <span className="text-[1.1rem] text-[var(--color-text-tertiary)]">
                      ({CATEGORY_RATE_DISPLAY[key]})
                    </span>
                  </div>
                  <span className="text-[1.4rem] font-bold text-[var(--color-text-primary)]">
                    {formatKRW(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 소비 패턴 개선 제안 ── */}
        {suggestions.length > 0 && (
          <div className="mb-[2rem]">
            <h3 className="text-[1.5rem] font-bold text-[var(--color-text-primary)] mb-[1.2rem]">
              소비 패턴 개선 제안
            </h3>
            <div className="flex flex-col gap-[1rem]">
              {suggestions.map((s) => (
                <div
                  key={s.title}
                  className="flex items-start gap-[1.2rem] px-[1.6rem] py-[1.4rem] rounded-[var(--radius-lg)]"
                  style={{ backgroundColor: s.bgColor, border: `1px solid ${s.accentColor}20` }}
                >
                  <span className="text-[2rem] leading-none shrink-0">{s.icon}</span>
                  <div>
                    <p
                      className="text-[1.4rem] font-bold mb-[0.3rem]"
                      style={{ color: s.accentColor }}
                    >
                      {s.title}
                    </p>
                    <p className="text-[1.3rem] text-[var(--color-text-secondary)] leading-[1.5]">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 이 시뮬레이터가 다루지 않는 항목 */}
        <div className="mb-[2rem] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-[1.6rem] py-[1.6rem]">
          <p className="text-[1.3rem] font-bold text-[var(--color-text-secondary)] mb-[1.2rem]">
            이 시뮬레이터가 다루지 않는 항목
          </p>
          <ul className="flex flex-col gap-[1rem]">
            <li className="flex items-start gap-[0.8rem]">
              <span className="mt-[0.6rem] shrink-0 w-[0.4rem] h-[0.4rem] rounded-full bg-[var(--color-text-tertiary)]" />
              <p className="text-[1.2rem] text-[var(--color-text-secondary)] leading-[1.6]">
                <span className="font-semibold">체육시설 공제</span><br />
                2025.07.01 이후 문화비 사업자로 등록된 시설 이용분에 한해 적용돼요.
              </p>
            </li>
            <li className="flex items-start gap-[0.8rem]">
              <span className="mt-[0.6rem] shrink-0 w-[0.4rem] h-[0.4rem] rounded-full bg-[var(--color-text-tertiary)]" />
              <p className="text-[1.2rem] text-[var(--color-text-secondary)] leading-[1.6]">
                <span className="font-semibold">소비 증가분 특례</span><br />
                2025년 상반기소비가 전년 동기 대비 5% 이상 늘었다면 증가분의 20%,
                최대 100만 원을 추가 공제받을 수 있어요.
              </p>
            </li>
          </ul>
          <p className="mt-[1.4rem] pt-[1.2rem] border-t border-[var(--color-border)] text-[1.2rem] text-[var(--color-text-tertiary)]">
            2025년 세법 기준 추정값이며 정확한 신고는{" "}
            <a
              href="https://www.hometax.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-primary)] underline underline-offset-2"
            >
              홈택스
            </a>
            를 이용해 주세요.
          </p>
        </div>
      </div>

      <BottomCTA
        label="처음부터 다시 해볼게요"
        onClick={onRestart}
        variant="ghost"
      />
    </div>
  );
}
