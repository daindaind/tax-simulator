"use client";

import { CalculationResult, formatKRW } from "@/lib/calculator";
import { ACTIVE_RULES } from "@/lib/taxRule";

interface DeductionBreakdownProps {
  result: CalculationResult;
}

const ITEM_LABELS: Record<string, { label: string }> = {
  creditCard: { label: "신용카드" },
  checkCard:  { label: "체크카드/현금" },
  culture:    { label: "도서·공연·박물관" },
  sports:     { label: "헬스장·수영장" },
  market:     { label: "전통시장" },
  transport:  { label: "대중교통" },
};

export function DeductionBreakdown({ result }: DeductionBreakdownProps) {
  const { breakdown, stage } = result;

  if (stage === "UNDER_THRESHOLD") {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-400 text-center">
          공제 문턱을 넘으면 항목별 공제 내역이 표시됩니다.
        </p>
      </div>
    );
  }

  const entries = Object.entries(breakdown) as [
    keyof typeof breakdown,
    number
  ][];
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">항목별 공제 내역</h4>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">항목</th>
              <th className="text-center px-3 py-2.5 font-medium text-gray-600">공제율</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-600">공제금액</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, amount]) => (
              <tr
                key={key}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-700">
                  {ITEM_LABELS[key].label}
                </td>
                <td className="px-3 py-2.5 text-center text-gray-500">
                  {/* TODO: 소득공제율 중복 계산 및 인라인 로직 개선 */}
                  {((ACTIVE_RULES.categories.find((c) => c.key === key)?.rate ?? 0) * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-medium text-gray-800">
                  {amount > 0 ? (
                    <span className="text-blue-600">{formatKRW(amount)}</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 border-t border-blue-200">
              <td colSpan={2} className="px-4 py-2.5 font-semibold text-blue-700">
                공제 가능 합계
              </td>
              <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-700">
                {formatKRW(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {result.extraDeduction > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-green-700 font-medium">
              전통시장·대중교통 추가 공제
            </span>
            <span className="font-mono font-bold text-green-700">
              +{formatKRW(result.extraDeduction)}
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            일반 공제 한도 초과분에 대해 추가로 인정되는 공제액이에요.
          </p>
        </div>
      )}
    </div>
  );
}
