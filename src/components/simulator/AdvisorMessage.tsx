"use client";

import { CalculationResult } from "@/lib/calculator";
import { formatKRW } from "@/lib/calculator";
import { cn } from "@/lib/utils";

interface AdvisorMessageProps {
  result: CalculationResult;
  totalSalary: number;
}

interface MessageConfig {
  icon: string;
  title: string;
  body: string;
  bgClass: string;
  borderClass: string;
  titleClass: string;
}

export function AdvisorMessage({ result, totalSalary }: AdvisorMessageProps) {
  if (totalSalary === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          총급여액을 입력하면 맞춤 절세 조언을 드릴게요.
        </p>
      </div>
    );
  }

  const { stage, thresholdGap, limitRemaining, threshold } = result;

  let config: MessageConfig;

  if (stage === "UNDER_THRESHOLD") {
    config = {
      icon: "⚠️",
      title: "아직 공제 문턱을 넘지 못했어요",
      body: `총급여의 25%인 ${formatKRW(threshold)}를 채워야 공제가 시작돼요. 아직 ${formatKRW(thresholdGap)} 남았어요. 지금은 신용카드나 체크카드 어느 것이든 편하게 사용해도 괜찮아요. 문턱을 빠르게 채우는 게 우선이에요.`,
      bgClass: "bg-orange-50",
      borderClass: "border-orange-200",
      titleClass: "text-orange-700",
    };
  } else if (stage === "OVER_THRESHOLD") {
    config = {
      icon: "🎉",
      title: "문턱을 통과했어요! 지금부터가 진짜예요",
      body: `이제부터 쓰는 금액은 바로 공제로 연결돼요. 공제율이 2배인 체크카드(30%)나 현금영수증을 적극 활용하세요. 신용카드(15%)보다 같은 금액을 써도 2배의 공제를 받을 수 있어요. 아직 일반 공제 한도까지 ${formatKRW(limitRemaining)} 여유가 있어요.`,
      bgClass: "bg-blue-50",
      borderClass: "border-blue-200",
      titleClass: "text-blue-700",
    };
  } else {
    // NEAR_LIMIT
    config = {
      icon: "🎯",
      title: "일반 공제 한도가 거의 찼어요!",
      body: `카드 공제 일반 한도가 ${limitRemaining > 0 ? `${formatKRW(limitRemaining)} 남았어요` : "꽉 찼어요"}. 이제부터는 전통시장이나 대중교통을 이용하세요! 최대 100만 원의 추가 공제를 별도로 받을 수 있어요.`,
      bgClass: "bg-green-50",
      borderClass: "border-green-200",
      titleClass: "text-green-700",
    };
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-2",
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none mt-0.5">{config.icon}</span>
        <h4 className={cn("text-sm font-semibold", config.titleClass)}>
          {config.title}
        </h4>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed pl-7">
        {config.body}
      </p>
    </div>
  );
}
