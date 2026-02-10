"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatKRW } from "@/lib/calculator";

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function SalaryInput({ value, onChange }: SalaryInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw === "" ? 0 : Number(raw));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="salary" className="text-sm font-semibold text-gray-700">
        총급여액
        <span className="ml-1.5 text-xs font-normal text-gray-400">
          (세전 연봉 기준)
        </span>
      </Label>
      <div className="relative">
        <Input
          id="salary"
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString()}
          onChange={handleChange}
          placeholder="46,800,000"
          className="pr-8 text-right font-mono text-base"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
          원
        </span>
      </div>
      {value > 0 && (
        <p className="text-right text-xs text-gray-500">
          공제 문턱:{" "}
          <span className="font-semibold text-blue-600">
            {formatKRW(Math.floor(value * 0.25))}
          </span>{" "}
          (총급여의 25%)
        </p>
      )}
    </div>
  );
}
