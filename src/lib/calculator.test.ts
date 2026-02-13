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

});
