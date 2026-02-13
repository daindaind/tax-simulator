import { describe, it, expect } from "vitest";
import { calculateCardDeduction } from "./calculator";

// 테스트용 기본 지출 입력값 (모든 항목 0)
const NO_SPENDING = {
  creditCard: 0,
  checkCard: 0,
  culture: 0,
  sports: 0,
  market: 0,
  transport: 0,
};

describe("calculateCardDeduction", () => {

  // 1. 문턱 미달 (UNDER_THRESHOLD)
  describe("문턱 미달", () => {

    it("지출이 0원이면 UNDER_THRESHOLD이고 공제액은 0이다", () => {
      const result = calculateCardDeduction(40_000_000, NO_SPENDING);

      expect(result.stage).toBe("UNDER_THRESHOLD");
      expect(result.finalDeduction).toBe(0);
    });

    it("지출이 총급여의 25% 미만이면 UNDER_THRESHOLD이다", () => {
      // 총급여 4천만 → 문턱 = 1천만
      // 지출 900만 → 문턱 미달
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 9_000_000,
      });

      expect(result.stage).toBe("UNDER_THRESHOLD");
      expect(result.finalDeduction).toBe(0);
    });

    it("thresholdGap은 문턱까지 남은 금액을 정확히 반환한다", () => {
      // 총급여 4천만 → 문턱 = 1천만
      // 지출 600만 → gap = 400만
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 6_000_000,
      });

      expect(result.thresholdGap).toBe(4_000_000);
    });

  });

  // 2. 경계값 처리
  describe("경계값 처리", () => {

    it("지출이 총급여의 정확히 25%이면 UNDER_THRESHOLD이다 (공제 미시작)", () => {
      // 총급여 4천만 → 문턱 = 1천만
      // 지출 딱 1천만 → <= 조건에 해당 → 공제 없음
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 10_000_000,
      });

      expect(result.stage).toBe("UNDER_THRESHOLD");
      expect(result.finalDeduction).toBe(0);
    });

    it("지출이 총급여의 25%를 초과하면 공제가 시작된다", () => {
      // 총급여 4천만 → 문턱 = 1천만
      // 지출 1천만 + 1천원 → 문턱 초과분 1천원 × 30% = 300원
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 10_001_000,
      });

      expect(result.stage).not.toBe("UNDER_THRESHOLD");
      expect(result.finalDeduction).toBeGreaterThan(0);
    });

  });

  // 3. 공제율 정확도
  describe("공제율 정확도", () => {

    it("신용카드 공제율은 15%이다", () => {
      // 총급여 4천만 → 문턱 1천만
      // 신용카드 1500만 → 문턱 1천만 소진 → 공제 대상 500만
      // 500만 × 15% = 750,000원
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        creditCard: 15_000_000,
      });

      expect(result.breakdown.creditCard).toBe(750_000);
    });

    it("체크카드 공제율은 30%이다", () => {
      // 총급여 4천만 → 문턱 1천만
      // 체크카드 1500만 → 문턱 1천만 소진 → 공제 대상 500만
      // 500만 × 30% = 1,500,000원
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 15_000_000,
      });

      expect(result.breakdown.checkCard).toBe(1_500_000);
    });

    it("전통시장 공제율은 40%이다", () => {
      // 총급여 4천만 → 문턱 1천만
      // 전통시장 1500만 → 문턱 1천만 소진 → 공제 대상 500만
      // 500만 × 40% = 2,000,000원
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        market: 15_000_000,
      });

      expect(result.breakdown.market).toBe(2_000_000);
    });

    it("신용카드 + 체크카드 혼용 시 낮은 공제율(신용카드)부터 문턱을 채운다", () => {
      // 총급여 4천만 → 문턱 1천만
      // 신용카드 800만: 전부 문턱에 소진 → 공제 대상 0
      // 체크카드 800만: 200만은 문턱 채우기, 600만이 공제 대상
      // 공제: 신용카드 0 + 체크카드 600만 × 30% = 1,800,000원
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        creditCard: 8_000_000,
        checkCard: 8_000_000,
      });

      expect(result.breakdown.creditCard).toBe(0);
      expect(result.breakdown.checkCard).toBe(1_800_000);
      expect(result.finalDeduction).toBe(1_800_000);
    });

  });

  // 4. 한도 캡핑
  describe("한도 캡핑", () => {

    it("공제액이 한도(300만)를 초과하면 300만으로 캡핑된다", () => {
      // 총급여 4천만, 자녀 없음 → baseLimit = 300만
      // 체크카드 2500만 → 문턱 1천만 소진 → 공제 대상 1500만
      // 1500만 × 30% = 450만 → 한도 초과 → 300만으로 캡핑
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 25_000_000,
      });

      expect(result.generalDeduction).toBe(3_000_000);
      expect(result.finalDeduction).toBe(3_000_000);
    });

    it("공제액이 한도 미만이면 캡핑 없이 그대로 반환된다", () => {
      // 총급여 4천만, 자녀 없음 → baseLimit = 300만
      // 체크카드 1500만 → 문턱 1천만 소진 → 공제 대상 500만
      // 500만 × 30% = 150만 → 한도 미만 → 그대로
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        checkCard: 15_000_000,
      });

      expect(result.generalDeduction).toBe(1_500_000);
      expect(result.limitRemaining).toBe(1_500_000); // 300만 - 150만 = 150만
    });

  });

  // 5. 전통시장·대중교통 독립 한도 적용
  describe("전통시장·대중교통 독립 한도", () => {

    it("일반 한도 초과 시 전통시장 추가 공제 100만이 별도 합산된다", () => {
      // 총급여 4천만 → 문턱 1천만, baseLimit 300만
      // 전통시장 2500만 → 문턱 1천만 소진 → 공제 대상 1500만
      // 1500만 × 40% = 600만 → 일반 한도 초과
      // generalDeduction = 300만, extraDeduction.market = min(600만, 100만) = 100만
      // finalDeduction = 300만 + 100만 = 400만
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        market: 25_000_000,
      });

      expect(result.generalDeduction).toBe(3_000_000);
      expect(result.extraDeductionBreakdown.market).toBe(1_000_000);
      expect(result.finalDeduction).toBe(4_000_000);
    });

    it("전통시장·대중교통은 각각 독립적으로 100만 한도를 가진다 (합산 X)", () => {
      // 총급여 4천만 → 문턱 1천만, baseLimit 300만
      // 전통시장 2000만(문턱 소진) + 대중교통 2000만
      // 전통시장 공제: 1000만 × 40% = 400만
      // 대중교통 공제: 2000만 × 40% = 800만
      // potentialDeduction = 1200만 → generalDeduction = 300만
      // extraDeduction = min(400만, 100만) + min(800만, 100만) = 200만
      // finalDeduction = 300만 + 200만 = 500만
      const result = calculateCardDeduction(40_000_000, {
        ...NO_SPENDING,
        market: 20_000_000,
        transport: 20_000_000,
      });

      expect(result.extraDeductionBreakdown.market).toBe(1_000_000);
      expect(result.extraDeductionBreakdown.transport).toBe(1_000_000);
      expect(result.extraDeduction).toBe(2_000_000);
      expect(result.finalDeduction).toBe(5_000_000);
    });

  });

});
