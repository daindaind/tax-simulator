# 2025 카드 소득공제 시뮬레이터

> 2025 개정 세법이 반영된, 사회초년생을 위한 실시간 소득공제 시뮬레이터
>
> "연말정산은 운 좋으면 받는 돈"이 아니라, 연중 소비 패턴을 조절해 스스로 절세 혜택을 극대화하는 능동적 도구

![시뮬레이터 동작 예시](./public/demo.gif)

**[→ 라이브 데모 보기](https://tax-simulator-mu.vercel.app/)**

---

## 기술적 강점

| | |
|---|---|
| **Scalable Tax Engine** | Strategy Pattern + DI 구조로, 세법 개정 시 `taxRule.{연도}.ts` 추가 및 `ACTIVE_RULES` 한 줄 교체만으로 대응 가능 |
| **Performance Optimization** | `useMemo` 기반 계산 결과 캐싱으로 단계 이동 시 재계산 방지, `requestAnimationFrame` 기반 60fps 게이지 애니메이션 구현 |
| **Reliable Logic** | WEHAGO 실무 툴 분석 → AI 초안 설계 → 국세청 2025 개정안 원문 직접 대조의 3단계 검증 프로세스 적용 |

---

## 아키텍처

```plaintext
src/
├── app/
│    └── page.tsx              # 퍼널 상태 관리 (useMemo 계산 캐싱)
├── lib/
│    ├── calculator.ts         # 순수 함수로 구성된 계산 엔진
│    ├── taxRule.ts            # TaxRule 인터페이스 및 ACTIVE_RULES 관리
│    └── taxRule.2025.ts       # 2025년 전략 객체
└── components/
     ├── steps/
     │    ├── SalaryStep.tsx   # 1단계: 연봉 입력
     │    ├── SpendingStep.tsx # 2단계: 지출 입력 + 유효성 검증
     │    ├── GaugeStep.tsx    # 3단계: RAF 기반 3-Phase 애니메이션
     │    └── ResultStep.tsx   # 4단계: 결과 및 절세 가이드
     └── funnel/               # 공통 레이아웃 컴포넌트
```

**데이터 흐름**

```
사용자 입력 (SalaryStep, SpendingStep)
    ↓
useMemo → calculateCardDeduction()  ← TaxRule 주입
    ↓
CalculationResult (캐시됨)
    ↓
GaugeStep (읽기 전용)  →  ResultStep (읽기 전용)
```

세법이 바뀌면: `taxRule.2026.ts` 생성 후 `ACTIVE_RULES` 한 줄 교체로 완료.

---

## 주요 기능

- **4단계 퍼널 UX** — 연봉 입력 → 지출 입력 → 게이지 애니메이션 → 결과 및 절세 팁
- **3-Phase 게이지 애니메이션** — 분석 로딩 → 게이지 차오름(마일스톤 토스트) → 좌측 이동 후 결과 패널 Fade-in
- **실시간 계산** — 입력값 변경 시 즉시 반영, 단계 이동 시 캐시 재사용
- **유효성 검증** — 음수 방지, 연봉 초과 지출 Soft Warning, 미입력 시 버튼 비활성화
- **구간별 한도 처리** — 급여·자녀 수 기반 공제 한도 자동 적용
- **전통시장·대중교통 추가 공제** — 일반 한도 초과 시 각 항목 독립 100만 원 추가 공제

---

## 기술 스택

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Primitives:** Radix UI
- **Deployment:** Vercel

---

## 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속

---

## Challenges & Solutions

**버그 발견 및 세법 검증**
AI가 생성한 초안에서 전통시장·대중교통 추가 공제를 합산 100만 원으로 잘못 계산하는 버그를 발견했습니다. 국세청 개정안 원문을 직접 대조하여 각각 독립 100만 원임을 확인하고 수정했습니다. AI를 초안 도구로 활용하되, 금융 로직은 법령 원문으로 직접 팩트체크하는 워크플로를 적용했습니다.

**애니메이션 재설계**
AI 생성 코드는 게이지 값이 마운트 즉시 최종값으로 렌더링되어 애니메이션이 없었습니다. `requestAnimationFrame` 루프와 마일스톤 토스트 큐를 직접 설계하여 3-Phase 애니메이션으로 개선했습니다.
