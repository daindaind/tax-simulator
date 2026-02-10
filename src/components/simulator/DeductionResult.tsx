"use client";

import { CalculationResult, formatKRW } from "@/lib/calculator";
import { cn } from "@/lib/utils";

interface DeductionResultProps {
  result: CalculationResult;
  totalSalary: number;
}

export function DeductionResult({ result, totalSalary }: DeductionResultProps) {
  const { finalDeduction, generalDeduction, extraDeduction, stage } = result;

  // 대략적인 세금 절감 효과 (과세표준 구간별 세율 적용)
  // 공제액만큼 과세표준이 줄어드므로 한계세율을 곱해 환급 추정
  const estimatedTaxRate = getTaxRate(totalSalary);
  const estimatedRefund = Math.floor(finalDeduction * estimatedTaxRate);

  return (
    <div className="space-y-3">
      {/* 메인 결과 카드 */}
      <div
        className={cn(
          "rounded-xl border-2 p-5 text-center transition-all duration-300",
          stage === "UNDER_THRESHOLD"
            ? "border-gray-200 bg-gray-50"
            : stage === "NEAR_LIMIT"
            ? "border-green-300 bg-green-50"
            : "border-blue-300 bg-blue-50"
        )}
      >
        <p className="text-sm font-medium text-gray-500 mb-1">최종 소득공제 금액</p>
        <p
          className={cn(
            "text-3xl font-bold font-mono tracking-tight",
            stage === "UNDER_THRESHOLD"
              ? "text-gray-400"
              : stage === "NEAR_LIMIT"
              ? "text-green-700"
              : "text-blue-700"
          )}
        >
          {formatKRW(finalDeduction)}
        </p>

        {totalSalary > 0 && finalDeduction > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              예상 세금 절감 효과{" "}
              <span className="text-xs text-gray-400">
                (소득세율 {(estimatedTaxRate * 100).toFixed(0)}% 기준)
              </span>
            </p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">
              약 {formatKRW(estimatedRefund)} 환급
            </p>
          </div>
        )}
      </div>

      {/* 공제 상세 분해 */}
      {stage !== "UNDER_THRESHOLD" && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-600">일반 공제액</span>
            <span className="font-mono font-semibold text-gray-800">
              {formatKRW(generalDeduction)}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-600">
              추가 공제액{" "}
              <span className="text-xs text-gray-400">(전통시장·대중교통)</span>
            </span>
            <span
              className={cn(
                "font-mono font-semibold",
                extraDeduction > 0 ? "text-green-600" : "text-gray-300"
              )}
            >
              {extraDeduction > 0 ? `+${formatKRW(extraDeduction)}` : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-xl">
            <span className="text-sm font-bold text-gray-800">최종 합계</span>
            <span className="font-mono font-bold text-blue-700">
              {formatKRW(finalDeduction)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 총급여 기준 한계세율 근사값
 * 실제 산출세액은 근로소득공제, 인적공제 등 다양한 변수가 있어 추정치임
 */
function getTaxRate(totalSalary: number): number {
  if (totalSalary <= 14_000_000) return 0.06;
  if (totalSalary <= 50_000_000) return 0.15;
  if (totalSalary <= 88_000_000) return 0.24;
  if (totalSalary <= 150_000_000) return 0.35;
  if (totalSalary <= 300_000_000) return 0.38;
  return 0.40;
}
