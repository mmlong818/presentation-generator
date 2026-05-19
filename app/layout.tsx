import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "演讲材料生成器",
  description: "把一个想法，变成一场可放映的演讲。",
};

// AGPL §13: every user accessing the running service has the right to obtain
// the complete corresponding source code. The footer link below satisfies that
// obligation by surfacing the source repository in the live UI on every page.
// Operators forking this project MUST set NEXT_PUBLIC_SOURCE_URL to their fork.
const SOURCE_URL = process.env.NEXT_PUBLIC_SOURCE_URL
  ?? 'https://github.com/mmlong818/presentation-generator';

function SourceFooter() {
  return (
    <footer
      aria-label="开源协议与源码"
      className="fixed bottom-1 right-2 z-50 pointer-events-none"
    >
      <a
        href={SOURCE_URL}
        target="_blank"
        rel="noreferrer noopener"
        title="此应用根据 AGPL-3.0 协议开源。AGPL §13 要求向所有网络用户提供源码。"
        className="pointer-events-auto text-[10px] font-mono text-stone-400 hover:text-stone-700 transition-colors px-2 py-1 rounded"
      >
        AGPL · Source ↗
      </a>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full block bg-stone-50 text-stone-900">
        {children}
        <SourceFooter />
      </body>
    </html>
  );
}
