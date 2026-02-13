import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "연말정산 신용카드 소득공제 시뮬레이터",
  description:
    "총급여와 카드별 사용 내역을 입력하면 예상 소득공제 금액과 절세 전략을 실시간으로 확인할 수 있습니다.",
  icons: { icon: [] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard: <link> 태그로 로드하여 CSS @import 순서 문제 방지 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
