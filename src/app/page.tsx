"use client";

import { useState, useMemo } from "react";
import { FunnelContainer } from "@/components/funnel/FunnelContainer";
import { FunnelHeader } from "@/components/funnel/FunnelHeader";
import { LandingStep } from "@/components/steps/LandingStep";
import { SalaryStep } from "@/components/steps/SalaryStep";
import { SpendingStep } from "@/components/steps/SpendingStep";
import { GaugeStep } from "@/components/steps/GaugeStep";
import { ResultStep } from "@/components/steps/ResultStep";
import { calculateCardDeduction, SpendingInput } from "@/lib/calculator";

/* ─────────────────────────────────────────────
   스텝 정의
   0: 랜딩  1: 급여  2: 카드사용액  3: 게이지  4: 결과
───────────────────────────────────────────── */
const TOTAL_STEPS = 4;

const DEFAULT_SPENDING: SpendingInput = {
  creditCard: 0,
  checkCard: 0,
  culture: 0,
  sports: 0,
  market: 0,
  transport: 0,
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [spending, setSpending] = useState<SpendingInput>(DEFAULT_SPENDING);

  const handleSpendingChange = (key: keyof SpendingInput, value: number) => {
    setSpending((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));
  const restart = () => {
    setStep(0);
    setTotalSalary(0);
    setNumberOfChildren(0);
    setSpending(DEFAULT_SPENDING);
  };

  const result = useMemo(
    () => calculateCardDeduction(totalSalary, spending, numberOfChildren),
    [totalSalary, spending, numberOfChildren]
  );

  return (
    <FunnelContainer>
      <FunnelHeader step={step} totalSteps={TOTAL_STEPS} onBack={goBack} />

      {step === 0 && <LandingStep onStart={goNext} />}

      {step === 1 && (
        <SalaryStep
          value={totalSalary}
          onChange={setTotalSalary}
          numberOfChildren={numberOfChildren}
          onChildrenChange={setNumberOfChildren}
          onNext={goNext}
        />
      )}

      {step === 2 && (
        <SpendingStep
          values={spending}
          onChange={handleSpendingChange}
          totalSalary={totalSalary}
          onNext={goNext}
        />
      )}

      {step === 3 && (
        <GaugeStep
          result={result}
          totalSalary={totalSalary}
          onNext={goNext}
        />
      )}

      {step === 4 && (
        <ResultStep
          result={result}
          spending={spending}
          totalSalary={totalSalary}
          onRestart={restart}
        />
      )}
    </FunnelContainer>
  );
}
