/**
 * 연말정산 신용카드 소득공제 계산 엔진
 * 2024년 세법 기준
 */

export interface SpendingInput {
  creditCard: number;   // 신용카드 (공제율 15%)
  checkCard: number;    // 체크카드/현금영수증 (공제율 30%)
  culture: number;      // 도서·공연·박물관·미술관 (공제율 30%)
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
  extraDeduction: number;       // 추가 공제액 (전통시장 + 대중교통, 최대 100만)
  finalDeduction: number;       // 최종 소득공제 금액

  baseLimit: number;            // 일반 공제 한도 (총급여 7천 이하 300만, 초과 250만)
  limitRemaining: number;       // 한도까지 남은 공제 가능 금액

  // 항목별 공제 내역 (문턱 차감 후)
  breakdown: {
    creditCard: number;
    checkCard: number;
    culture: number;
    market: number;
    transport: number;
  };
}

export const DEDUCTION_RATES = {
  creditCard: 0.15,
  checkCard: 0.30,
  culture: 0.30,
  market: 0.40,
  transport: 0.40,
} as const;

/**
 * 공제율이 낮은 순서로 문턱을 채우는 것이 사용자에게 유리
 * 신용카드(15%) → 체크카드(30%) → 문화(30%) → 전통시장(40%) → 대중교통(40%)
 */
const THRESHOLD_FILL_ORDER: (keyof SpendingInput)[] = [
  "creditCard",
  "checkCard",
  "culture",
  "market",
  "transport",
];

export function calculateCardDeduction(
  totalSalary: number,
  usage: SpendingInput
): CalculationResult {
  // 1. 공제 문턱 = 총급여 × 25%
  const threshold = Math.floor(totalSalary * 0.25);

  const totalUsage =
    usage.creditCard +
    usage.checkCard +
    usage.culture +
    usage.market +
    usage.transport;

  // 2. 일반 공제 한도 결정
  const baseLimit = totalSalary <= 70_000_000 ? 3_000_000 : 2_500_000;

  // 3. 문턱 미달이면 공제 없음
  if (totalUsage <= threshold) {
    return {
      threshold,
      totalUsage,
      stage: "UNDER_THRESHOLD",
      thresholdGap: threshold - totalUsage,
      potentialDeduction: 0,
      generalDeduction: 0,
      extraDeduction: 0,
      finalDeduction: 0,
      baseLimit,
      limitRemaining: baseLimit,
      breakdown: {
        creditCard: 0,
        checkCard: 0,
        culture: 0,
        market: 0,
        transport: 0,
      },
    };
  }

  // 4. 문턱 차감: 낮은 공제율 순으로 문턱을 채운다
  let remainingThreshold = threshold;
  const deductibleAmounts: Record<keyof SpendingInput, number> = {
    creditCard: 0,
    checkCard: 0,
    culture: 0,
    market: 0,
    transport: 0,
  };

  for (const key of THRESHOLD_FILL_ORDER) {
    const amount = usage[key];
    const deductible = Math.max(0, amount - remainingThreshold);
    deductibleAmounts[key] = deductible;
    remainingThreshold = Math.max(0, remainingThreshold - amount);
  }

  // 5. 항목별 공제 가능 금액 산출 (공제율 적용)
  const breakdown = {
    creditCard: Math.floor(deductibleAmounts.creditCard * DEDUCTION_RATES.creditCard),
    checkCard: Math.floor(deductibleAmounts.checkCard * DEDUCTION_RATES.checkCard),
    culture: Math.floor(deductibleAmounts.culture * DEDUCTION_RATES.culture),
    market: Math.floor(deductibleAmounts.market * DEDUCTION_RATES.market),
    transport: Math.floor(deductibleAmounts.transport * DEDUCTION_RATES.transport),
  };

  const potentialDeduction =
    breakdown.creditCard +
    breakdown.checkCard +
    breakdown.culture +
    breakdown.market +
    breakdown.transport;

  // 6. 일반 공제 한도 적용
  const generalDeduction = Math.min(potentialDeduction, baseLimit);
  const limitRemaining = Math.max(0, baseLimit - potentialDeduction);

  // 7. 추가 공제 계산 (전통시장 + 대중교통 각각 최대 100만 원)
  // 일반 공제 한도를 초과한 경우에만 추가 공제가 의미있음
  // 전통시장/대중교통의 공제 가능 금액을 추가 공제로 별도 인정 (최대 각 100만)
  const extraMarket = Math.min(breakdown.market, 1_000_000);
  const extraTransport = Math.min(breakdown.transport, 1_000_000);
  const extraDeduction =
    potentialDeduction > baseLimit
      ? Math.min(extraMarket + extraTransport, 1_000_000)
      : 0;

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
