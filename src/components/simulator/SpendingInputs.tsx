"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpendingInput } from "@/lib/calculator";

interface SpendingItemConfig {
  key: keyof SpendingInput;
  label: string;
  rate: string;
  placeholder: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  badgeClass: string;
  description: string;
}

const SPENDING_ITEMS: SpendingItemConfig[] = [
  {
    key: "creditCard",
    label: "신용카드",
    rate: "15%",
    placeholder: "10,000,000",
    badgeVariant: "outline",
    badgeClass: "border-orange-300 text-orange-600 bg-orange-50",
    description: "공제율이 가장 낮아요. 문턱 채우기에 활용하세요.",
  },
  {
    key: "checkCard",
    label: "체크카드 / 현금영수증",
    rate: "30%",
    placeholder: "5,000,000",
    badgeVariant: "outline",
    badgeClass: "border-blue-300 text-blue-600 bg-blue-50",
    description: "문턱을 넘은 후 적극 활용하면 유리해요.",
  },
  {
    key: "culture",
    label: "도서·공연·박물관",
    rate: "30%",
    placeholder: "500,000",
    badgeVariant: "outline",
    badgeClass: "border-purple-300 text-purple-600 bg-purple-50",
    description: "총급여 7천만 원 이하 근로자만 해당돼요.",
  },
  {
    key: "market",
    label: "전통시장",
    rate: "40%",
    placeholder: "300,000",
    badgeVariant: "outline",
    badgeClass: "border-green-300 text-green-600 bg-green-50",
    description: "추가 공제도 가능! 한도 소진 후에도 활용하세요.",
  },
  {
    key: "transport",
    label: "대중교통",
    rate: "40%",
    placeholder: "200,000",
    badgeVariant: "outline",
    badgeClass: "border-teal-300 text-teal-600 bg-teal-50",
    description: "추가 공제도 가능! 한도 소진 후에도 활용하세요.",
  },
];

interface SpendingInputsProps {
  values: SpendingInput;
  onChange: (key: keyof SpendingInput, value: number) => void;
}

export function SpendingInputs({ values, onChange }: SpendingInputsProps) {
  const handleChange =
    (key: keyof SpendingInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      onChange(key, raw === "" ? 0 : Number(raw));
    };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">카드별 연간 사용액</h3>
      <div className="space-y-3">
        {SPENDING_ITEMS.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label
                htmlFor={item.key}
                className="text-sm font-medium text-gray-700"
              >
                {item.label}
              </Label>
              <Badge className={`text-xs px-1.5 py-0 ${item.badgeClass}`} variant={item.badgeVariant}>
                공제율 {item.rate}
              </Badge>
            </div>
            <div className="relative">
              <Input
                id={item.key}
                type="text"
                inputMode="numeric"
                value={values[item.key] === 0 ? "" : values[item.key].toLocaleString()}
                onChange={handleChange(item.key)}
                placeholder={item.placeholder}
                className="pr-8 text-right font-mono"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                원
              </span>
            </div>
            <p className="text-xs text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
