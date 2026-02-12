/**
 * 연말정산 신용카드 소득공제 계산 엔진
 * 2025년 세법 기준
 */

export interface SpendingInput {
  creditCard: number;   // 신용카드 (공제율 15%)
  checkCard: number;    // 체크카드/현금영수증 (공제율 30%)
  culture: number;      // 도서·공연·박물관·영화 (공제율 30%)
  sports: number;       // 체육시설 이용료 - 헬스장·수영장 (공제율 30%, 2025.07.01~)
  market: number;       // 전통시장 (공제율 40%)
  transport: number;    // 대중교통 (공제율 40%)
}

export type Stage =
  | "UNDER_THRESHOLD"  // 문턱 미달
  | "OVER_THRESHOLD"   // 문턱 통과, 공제 진행 중
  | "NEAR_LIMIT";      // 일반 공제 한도 임박/초과

export interface CalculationResult {
  // 입력 요약
  threshold: number;            // 공제 문턱 (총급여 × 25%)
  totalUsage: number;           // 전체 카드 사용액

  // 단계 판정
  stage: Stage;

  // 공제 상세
  thresholdGap: number;         // 문턱까지 남은 금액 (문턱 미달 시 양수)
  potentialDeduction: number;   // 한도 적용 전 공제 가능 금액

  generalDeduction: number;     // 일반 공제액 (min(potential, 한도))
  extraDeduction: number;       // 추가 공제액 (전통시장 최대 100만 + 대중교통 최대 100만)
  extraDeductionBreakdown: {    // 추가 공제 항목별 내역
    market: number;             // 전통시장 추가 공제 (최대 100만)
    transport: number;          // 대중교통 추가 공제 (최대 100만)
  };
  finalDeduction: number;       // 최종 소득공제 금액

  baseLimit: number;            // 일반 공제 한도 (총급여 7천 이하 300만, 초과 250만)
  limitRemaining: number;       // 한도까지 남은 공제 가능 금액

  // 항목별 공제 내역 (문턱 차감 후)
  breakdown: {
    creditCard: number;
    checkCard: number;
    culture: number;
    sports: number;
    market: number;
    transport: number;
  };
}

export const DEDUCTION_RATES = {
  creditCard: 0.15,
  checkCard: 0.30,
  culture: 0.30,
  sports: 0.30,
  market: 0.40,
  transport: 0.40,
} as const;

/**
 * 공제율이 낮은 순서로 문턱을 채우는 것이 사용자에게 유리
 * 신용카드(15%) → 체크카드(30%) → 문화(30%) → 체육시설(30%) → 전통시장(40%) → 대중교통(40%)
 */
const THRESHOLD_FILL_ORDER: (keyof SpendingInput)[] = [
  "creditCard",
  "checkCard",
  "culture",
  "sports",
  "market",
  "transport",
];

export function calculateCardDeduction(
  totalSalary: number,
  usage: SpendingInput,
  numberOfChildren: number = 0
): CalculationResult {
  // 1. 공제 문턱 = 총급여 × 25%
  const threshold = Math.floor(totalSalary * 0.25);

  // 2. 일반 공제 한도 결정 (2025년 개정: 자녀 수에 따라 차등 적용)
  //    총급여 ≤7천만: 무자녀 300만 / 1명 350만 / 2명+ 400만
  //    총급여 >7천만: 무자녀 250만 / 1명 275만 / 2명+ 300만
  const children = Math.min(numberOfChildren, 2);
  const BASE_LIMIT_TABLE: Record<"under" | "over", number[]> = {
    under: [3_000_000, 3_500_000, 4_000_000],
    over:  [2_500_000, 2_750_000, 3_000_000],
  };
  const baseLimit = totalSalary <= 70_000_000
    ? BASE_LIMIT_TABLE.under[children]
    : BASE_LIMIT_TABLE.over[children];

  // 3. 도서·공연·영화·체육시설은 총급여 7천만 이하만 공제 대상
  //    초과자는 해당 항목을 0으로 처리 (UI에서도 비활성화되나 방어 로직)
  const eligibleUsage: SpendingInput = {
    ...usage,
    culture: totalSalary <= 70_000_000 ? usage.culture : 0,
    sports:  totalSalary <= 70_000_000 ? usage.sports  : 0,
  };

  const totalUsage =
    eligibleUsage.creditCard +
    eligibleUsage.checkCard +
    eligibleUsage.culture +
    eligibleUsage.sports +
    eligibleUsage.market +
    eligibleUsage.transport;

  // 4. 문턱 미달이면 공제 없음
  if (totalUsage <= threshold) {
    return {
      threshold,
      totalUsage,
      stage: "UNDER_THRESHOLD",
      thresholdGap: threshold - totalUsage,
      potentialDeduction: 0,
      generalDeduction: 0,
      extraDeduction: 0,
      extraDeductionBreakdown: { market: 0, transport: 0 },
      finalDeduction: 0,
      baseLimit,
      limitRemaining: baseLimit,
      breakdown: {
        creditCard: 0,
        checkCard: 0,
        culture: 0,
        sports: 0,
        market: 0,
        transport: 0,
      },
    };
  }

  // 5. 문턱 차감: 낮은 공제율 순으로 문턱을 채운다
  let remainingThreshold = threshold;
  const deductibleAmounts: Record<keyof SpendingInput, number> = {
    creditCard: 0,
    checkCard: 0,
    culture: 0,
    sports: 0,
    market: 0,
    transport: 0,
  };

  for (const key of THRESHOLD_FILL_ORDER) {
    const amount = eligibleUsage[key];
    const deductible = Math.max(0, amount - remainingThreshold);
    deductibleAmounts[key] = deductible;
    remainingThreshold = Math.max(0, remainingThreshold - amount);
  }

  // 5. 항목별 공제 가능 금액 산출 (공제율 적용)
  const breakdown = {
    creditCard: Math.floor(deductibleAmounts.creditCard * DEDUCTION_RATES.creditCard),
    checkCard:  Math.floor(deductibleAmounts.checkCard  * DEDUCTION_RATES.checkCard),
    culture:    Math.floor(deductibleAmounts.culture    * DEDUCTION_RATES.culture),
    sports:     Math.floor(deductibleAmounts.sports     * DEDUCTION_RATES.sports),
    market:     Math.floor(deductibleAmounts.market     * DEDUCTION_RATES.market),
    transport:  Math.floor(deductibleAmounts.transport  * DEDUCTION_RATES.transport),
  };

  const potentialDeduction =
    breakdown.creditCard +
    breakdown.checkCard +
    breakdown.culture +
    breakdown.sports +
    breakdown.market +
    breakdown.transport;

  // 6. 일반 공제 한도 적용
  const generalDeduction = Math.min(potentialDeduction, baseLimit);
  const limitRemaining = Math.max(0, baseLimit - potentialDeduction);

  // 7. 추가 공제 계산
  // 전통시장, 대중교통은 각각 독립적으로 최대 100만 원의 별도 한도를 가짐
  // → 전통시장 100만 + 대중교통 100만 = 최대 200만 추가 공제 가능 (세법 §조특법 126조의2)
  // 단, 일반 공제 한도(baseLimit)를 초과한 경우에만 추가 공제가 실질적 의미를 가짐
  const extraMarket = potentialDeduction > baseLimit
    ? Math.min(breakdown.market, 1_000_000)
    : 0;
  const extraTransport = potentialDeduction > baseLimit
    ? Math.min(breakdown.transport, 1_000_000)
    : 0;
  const extraDeduction = extraMarket + extraTransport;

  const finalDeduction = generalDeduction + extraDeduction;

  // 8. 단계 판정
  const stage: Stage =
    potentialDeduction >= baseLimit * 0.85
      ? "NEAR_LIMIT"
      : "OVER_THRESHOLD";

  return {
    threshold,
    totalUsage,
    stage,
    thresholdGap: 0,
    potentialDeduction,
    generalDeduction,
    extraDeduction,
    extraDeductionBreakdown: { market: extraMarket, transport: extraTransport },
    finalDeduction,
    baseLimit,
    limitRemaining,
    breakdown,
  };
}

/** 원화 포맷 헬퍼 */
export function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    const eok = Math.floor(amount / 100_000_000);
    const man = Math.floor((amount % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만 원` : `${eok}억 원`;
  }
  if (amount >= 10_000) {
    return `${Math.floor(amount / 10_000).toLocaleString()}만 원`;
  }
  return `${amount.toLocaleString()}원`;
}
