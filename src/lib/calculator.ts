/**
 * 연말정산 신용카드 소득공제 계산 엔진
 * (규정 데이터(TaxRule) 주입)
 */

import { ACTIVE_RULES, TaxRule } from "./taxRule";

export interface SpendingInput {
  creditCard: number;   // 신용카드
  checkCard: number;    // 체크카드/현금영수증
  culture: number;      // 도서·공연·박물관·영화
  sports: number;       // 체육시설 이용료 (헬스장·수영장 등)
  market: number;       // 전통시장
  transport: number;    // 대중교통
}

export type Stage =
  | "UNDER_THRESHOLD"  // 최저사용금액 미달
  | "OVER_THRESHOLD"   // 최저사용금액 초과, 공제 진행 중
  | "NEAR_LIMIT";      // 일반 공제 한도 임박/초과

export interface CalculationResult {
  // 입력 요약
  threshold: number;            // 최저사용금액 (총급여 × thresholdRate)
  totalUsage: number;           // 전체 카드 사용액 (소득 제한 항목 제외 후)

  // 단계 판정
  stage: Stage;

  // 공제 상세
  thresholdGap: number;         // 최저사용금액까지 남은 금액 (미달 시 양수)
  potentialDeduction: number;   // 한도 적용 전 공제 가능 금액

  generalDeduction: number;     // 일반 공제액 min(potential, baseLimit)
  extraDeduction: number;       // 별도 한도 추가 공제 합계
  extraDeductionBreakdown: Record<string, number>; // 추가 공제 항목별 내역
  finalDeduction: number;       // 최종 소득공제 금액

  baseLimit: number;            // 일반 공제 한도 (소득 구간 × 자녀 수)
  limitRemaining: number;       // 한도까지 남은 공제 가능 금액

  // 항목별 공제 내역 (최저사용금액 차감 후)
  breakdown: {
    creditCard: number;
    checkCard: number;
    culture: number;
    sports: number;
    market: number;
    transport: number;
  };
}


export function calculateCardDeduction(
  totalSalary: number,
  usage: SpendingInput,
  numberOfChildren: number = 0,
  rules: TaxRule = ACTIVE_RULES
): CalculationResult {
  const { thresholdRate, incomeTierThreshold, nearLimitRatio, categories, baseLimitTable } = rules;

  // 1. 최저사용금액 = 총급여 × thresholdRate
  const threshold = Math.floor(totalSalary * thresholdRate);

  // 2. 일반 공제 한도 결정 (소득 구간 × 자녀 수)
  const children = Math.min(numberOfChildren, 2);
  const tierKey = totalSalary <= incomeTierThreshold ? "under" : "over";
  const baseLimit = baseLimitTable[tierKey][children];

  // 3. 소득 상한 초과 항목 제거 (방어 로직 — UI 비활성화와 이중 보호)
  const eligibleUsage = { ...usage } as Record<string, number>;
  for (const cat of categories) {
    if (cat.incomeLimit !== null && totalSalary > cat.incomeLimit) {
      eligibleUsage[cat.key] = 0;
    }
  }

  // 4. 소득 제한 적용 후 전체 사용액
  const totalUsage = categories.reduce(
    (sum, cat) => sum + (eligibleUsage[cat.key] ?? 0),
    0
  );

  // 5. 최저사용금액 미달이면 공제 없음
  if (totalUsage <= threshold) {
    return {
      threshold,
      totalUsage,
      stage: "UNDER_THRESHOLD",
      thresholdGap: threshold - totalUsage,
      potentialDeduction: 0,
      generalDeduction: 0,
      extraDeduction: 0,
      extraDeductionBreakdown: {},
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

  // 6. 최저사용금액 충당: 소득공제율 낮은 순 (categories 배열 순서)
  let remainingThreshold = threshold;
  const deductibleAmounts: Record<string, number> = {};
  for (const cat of categories) {
    const amount = eligibleUsage[cat.key] ?? 0;
    deductibleAmounts[cat.key] = Math.max(0, amount - remainingThreshold);
    remainingThreshold = Math.max(0, remainingThreshold - amount);
  }

  // 7. 항목별 소득공제 금액 산출 (소득공제율 적용)
  const breakdownRaw: Record<string, number> = {};
  for (const cat of categories) {
    breakdownRaw[cat.key] = Math.floor((deductibleAmounts[cat.key] ?? 0) * cat.rate);
  }

  const breakdown = {
    creditCard: breakdownRaw["creditCard"] ?? 0,
    checkCard:  breakdownRaw["checkCard"]  ?? 0,
    culture:    breakdownRaw["culture"]    ?? 0,
    sports:     breakdownRaw["sports"]     ?? 0,
    market:     breakdownRaw["market"]     ?? 0,
    transport:  breakdownRaw["transport"]  ?? 0,
  };

  const potentialDeduction = Object.values(breakdownRaw).reduce((s, v) => s + v, 0);

  // 8. 일반 공제 한도 적용
  const generalDeduction = Math.min(potentialDeduction, baseLimit);
  const limitRemaining = Math.max(0, baseLimit - potentialDeduction);

  // 9. 별도 한도 추가 공제 계산 (조특법 126조의2 ④항)
  //    일반 한도 초과 시에만 실질적 의미를 가짐
  const extraDeductionBreakdown: Record<string, number> = {};
  if (potentialDeduction > baseLimit) {
    for (const cat of categories) {
      if (cat.extraDeductionLimit > 0) {
        extraDeductionBreakdown[cat.key] = Math.min(
          breakdownRaw[cat.key] ?? 0,
          cat.extraDeductionLimit
        );
      }
    }
  }
  const extraDeduction = Object.values(extraDeductionBreakdown).reduce((s, v) => s + v, 0);

  const finalDeduction = generalDeduction + extraDeduction;

  // 10. 단계 판정
  const stage: Stage =
    potentialDeduction >= baseLimit * nearLimitRatio
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
    extraDeductionBreakdown,
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
