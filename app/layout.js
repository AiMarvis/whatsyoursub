import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StagewiseWrapper from "@/components/StagewiseWrapper";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "AI 구독 관리 플랫폼",
  description: "AI 서비스 구독 현황을 효율적으로 관리하고 새로운 AI 툴을 발견하세요",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-theme="corporate">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-base-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <StagewiseWrapper />
      </body>
    </html>
  );
}
