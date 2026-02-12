/**
 * 2025년 귀속 신용카드 소득공제 규정 데이터
 * 근거: 조세특례제한법 제126조의2 (2025년 개정안)
 * 참고자료: https://www.law.go.kr/법령/조세특례제한법/제126조의2
 */

import type { TaxRule } from "./taxRule";

export const rules2025: TaxRule = {
  year: 2025,

  /**
   * 최저사용금액 산정 비율 (조특법 126조의2 ①항)
   * 총급여액 × 0.25 = 소득공제 적용 기준선
   */
  thresholdRate: 0.25,

  /**
   * 공제 한도 차등 적용 기준 총급여액
   * 7천만 원 이하/초과 여부에 따라 일반 공제 한도 및 적용 항목 구분
   */
  incomeTierThreshold: 70_000_000,

  /**
   * [UI] 공제 한도 임박(NEAR_LIMIT) 단계 진입 기준 비율
   * (세법 규정이 아닌 UI 단계 판정에만 사용)
   */
  nearLimitRatio: 0.85,

  /**
   * 소득공제 적용 항목 목록
   * 배열 순서 = 최저사용금액 충당 우선순위 (소득공제율 낮은 순)
   */
  categories: [
    {
      key: "creditCard",
      rate: 0.15,        // 신용카드
      incomeLimit: null,
      effectiveFrom: null,
      extraDeductionLimit: 0,
    },
    {
      key: "checkCard",
      rate: 0.30,        // 체크카드·현금영수증
      incomeLimit: null,
      effectiveFrom: null,
      extraDeductionLimit: 0,
    },
    {
      key: "culture",
      rate: 0.30,        // 도서·공연·박물관·영화
      incomeLimit: 70_000_000, // 총급여 7천만 원 이하만 적용
      effectiveFrom: null,
      extraDeductionLimit: 0,
    },
    {
      key: "sports",
      rate: 0.30,        // 헬스장·수영장 등 체육시설
      incomeLimit: 70_000_000, // 총급여 7천만 원 이하만 적용
      effectiveFrom: "2025-07-01", // 문화비 사업자 등록 시설 이용분부터 적용
      extraDeductionLimit: 0,
    },
    {
      key: "market",
      rate: 0.40,        // 전통시장
      incomeLimit: null,
      effectiveFrom: null,
      extraDeductionLimit: 1_000_000, // 별도 한도 최대 100만 원 (조특법 126조의2 ④항)
    },
    {
      key: "transport",
      rate: 0.40,        // 대중교통
      incomeLimit: null,
      effectiveFrom: null,
      extraDeductionLimit: 1_000_000, // 별도 한도 최대 100만 원 (조특법 126조의2 ④항)
    },
  ],

  /**
   * 일반 소득공제 한도 테이블 (2025년 개정: 부양자녀 수 반영)
   * under = incomeTierThreshold 이하, over = 초과
   * ex. [자녀 0명, 1명, 2명 이상]
   */
  baseLimitTable: {
    under: [3_000_000, 3_500_000, 4_000_000],
    over:  [2_500_000, 2_750_000, 3_000_000],
  },

  /**
   * 종합소득세 기본세율 구간 (소득세법 제55조)
   * 환급액 추정에만 사용하며 실제 신고 세액과 다를 수 있음
   * upTo: null = 최고 구간 (상한 없음)
   */
  taxBrackets: [
    { upTo: 14_000_000,  rate: 0.06 },
    { upTo: 50_000_000,  rate: 0.15 },
    { upTo: 88_000_000,  rate: 0.24 },
    { upTo: 150_000_000, rate: 0.35 },
    { upTo: null,        rate: 0.38 },
  ],
};
