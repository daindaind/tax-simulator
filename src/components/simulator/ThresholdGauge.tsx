"use client";

import { Progress } from "@/components/ui/progress";
import { formatKRW, CalculationResult } from "@/lib/calculator";
import { cn } from "@/lib/utils";

interface ThresholdGaugeProps {
  result: CalculationResult;
}

export function ThresholdGauge({ result }: ThresholdGaugeProps) {
  const { threshold, totalUsage, baseLimit, generalDeduction, stage } = result;

  // 문턱 달성률 (0~100%)
  const thresholdPct = threshold === 0 ? 0 : Math.min(100, (totalUsage / threshold) * 100);

  // 한도 소진률 (0~100%)
  const limitPct = baseLimit === 0 ? 0 : Math.min(100, (generalDeduction / baseLimit) * 100);

  return (
    <div className="space-y-5">
      {/* 문턱 달성 게이지 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">공제 문턱 달성률</span>
          <span
            className={cn(
              "font-semibold",
              thresholdPct >= 100 ? "text-green-600" : "text-orange-500"
            )}
          >
            {thresholdPct.toFixed(1)}%
          </span>
        </div>
        <Progress
          value={thresholdPct}
          className={cn(
            "h-3",
            thresholdPct >= 100 ? "[&>div]:bg-green-500" : "[&>div]:bg-orange-400"
          )}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0원</span>
          <span className="font-medium text-gray-600">
            문턱: {formatKRW(threshold)}
          </span>
        </div>
        {stage === "UNDER_THRESHOLD" && result.thresholdGap > 0 && (
          <p className="text-xs text-orange-600 font-medium">
            문턱까지{" "}
            <span className="font-bold">{formatKRW(result.thresholdGap)}</span>{" "}
            남았어요
          </p>
        )}
        {stage !== "UNDER_THRESHOLD" && (
          <p className="text-xs text-green-600 font-medium">
            문턱 통과! 초과 사용액 {formatKRW(Math.max(0, totalUsage - threshold))}에 공제율 적용 중
          </p>
        )}
      </div>

      {/* 일반 공제 한도 게이지 */}
      {stage !== "UNDER_THRESHOLD" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">일반 공제 한도 소진률</span>
            <span
              className={cn(
                "font-semibold",
                limitPct >= 100 ? "text-red-500" : limitPct >= 85 ? "text-yellow-600" : "text-blue-600"
              )}
            >
              {limitPct.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={limitPct}
            className={cn(
              "h-3",
              limitPct >= 100
                ? "[&>div]:bg-red-500"
                : limitPct >= 85
                ? "[&>div]:bg-yellow-500"
                : "[&>div]:bg-blue-500"
            )}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0원</span>
            <span className="font-medium text-gray-600">
              한도: {formatKRW(baseLimit)}
            </span>
          </div>
          {result.limitRemaining > 0 && (
            <p className="text-xs text-blue-600 font-medium">
              한도까지{" "}
              <span className="font-bold">{formatKRW(result.limitRemaining)}</span>{" "}
              더 공제받을 수 있어요
            </p>
          )}
          {result.limitRemaining === 0 && (
            <p className="text-xs text-red-600 font-medium">
              일반 공제 한도 달성! 전통시장·대중교통으로 추가 공제를 노리세요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
