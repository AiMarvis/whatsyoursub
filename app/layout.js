import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StagewiseWrapper from "@/components/StagewiseWrapper";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "AI 구독 관리 플랫폼 - 스마트한 AI 서비스 관리",
  description: "여러 AI 서비스 구독을 한 곳에서 효율적으로 관리하고, 새로운 AI 툴을 발견하여 생산성을 극대화하세요.",
  keywords: "AI 구독 관리, AI 툴, AI 서비스, 구독 관리, ChatGPT, Claude, Midjourney",
  openGraph: {
    title: "AI 구독 관리 플랫폼",
    description: "스마트한 AI 서비스 구독 관리 솔루션",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-theme="corporate">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col bg-base-100">
          <Navbar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />
        </div>
        <StagewiseWrapper />
      </body>
    </html>
  );
}
