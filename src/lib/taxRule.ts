/**
 * 연말정산 세법 규정 인터페이스 및 활성 규정 export
 *
 * 매년 개정 시:
 *   1. taxRule.{연도}.ts 파일 추가
 *   2. ACTIVE_RULES import 대상만 교체
 */

import { rules2025 } from "./taxRule.2025";

/* ─────────────────────────────────────────────
   TaxRule 인터페이스
───────────────────────────────────────────── */

/** 항목별 공제 규정 */
export interface CategoryRule {
  /** SpendingInput 키와 일치해야 함 */
  key: string;
  /** 소득공제율 (예: 신용카드 0.15, 체크카드 0.30) */
  rate: number;
  /** 공제 적용 소득 상한 (null이면 소득 제한 없음) */
  incomeLimit: number | null;
  /**
   * 시행일 (null이면 해당 연도 전체 적용)
   * 연도 중 신설·변경된 항목에 한해 ISO 날짜 문자열로 명시
   */
  effectiveFrom: string | null;
  /**
   * 별도 한도 추가 공제 한도액
   * 0이면 추가 공제 대상 아님 (조특법 126조의2 ④항)
   */
  extraDeductionLimit: number;
}

/** 종합소득세 세율 구간 */
export interface TaxBracket {
  /** 과세표준 구간 상한 (null이면 최고 구간, 상한 없음) */
  upTo: number | null;
  /** 기본세율 (예: 0.15) */
  rate: number;
}

/** 연도별 세법 규정 */
export interface TaxRule {
  /** 귀속 연도 */
  year: number;
  /**
   * 최저사용금액 산정 비율
   * 총급여 × 비율 = 소득공제 적용 기준선 (조특법 126조의2 ①항)
   */
  thresholdRate: number;
  /**
   * 공제 한도 차등 적용 기준 총급여액
   * 이하/초과 여부에 따라 일반 공제 한도 및 적용 항목이 구분됨
   */
  incomeTierThreshold: number;
  /**
   * [UI] 공제 한도 임박(NEAR_LIMIT) 단계 진입 기준 비율
   * (세법 규정이 아닌 UI 단계 판정에만 사용)
   */
  nearLimitRatio: number;
  /**
   * 소득공제 적용 항목 목록
   * 배열 순서 = 최저사용금액 충당 우선순위 (소득공제율 낮은 순)
   */
  categories: CategoryRule[];
  /**
   * 일반 소득공제 한도 테이블 (2025년 개정: 부양자녀 수 반영)
   * under = incomeTierThreshold 이하, over = 초과
   * ex. [자녀 0명, 1명, 2명 이상]
   */
  baseLimitTable: {
    under: [number, number, number];
    over:  [number, number, number];
  };
  /**
   * 종합소득세 세율 구간
   * 환급액 추정에만 사용하며 실제 신고 세액과 다를 수 있음
   */
  taxBrackets: TaxBracket[];
}

/* ─────────────────────────────────────────────
   활성 규정 — 연도 전환 시 이 줄만 교체
───────────────────────────────────────────── */
export const ACTIVE_RULES: TaxRule = rules2025;

/**
 * 카테고리별 소득공제율 (UI용 % 문자열)
 */
export const CATEGORY_RATE_DISPLAY = Object.fromEntries(
  ACTIVE_RULES.categories.map((c) => [c.key, `${(c.rate * 100).toFixed(0)}%`])
);

