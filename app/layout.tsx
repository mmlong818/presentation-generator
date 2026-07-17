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

// Keep the corresponding source repository discoverable from the running app.
// Operators forking this project should set NEXT_PUBLIC_SOURCE_URL to their fork.
const SOURCE_URL = process.env.NEXT_PUBLIC_SOURCE_URL
  ?? 'https://github.com/mmlong818/presentation-generator';

function SourceFooter() {
  return (
    <footer
      aria-label="许可证与源码"
      className="fixed bottom-1 right-2 z-50 pointer-events-none"
    >
      <a
        href={SOURCE_URL}
        target="_blank"
        rel="noreferrer noopener"
        title="源码采用 PolyForm Noncommercial 1.0.0，仅授权非商业用途。"
        className="pointer-events-auto text-[10px] font-mono text-stone-400 hover:text-stone-700 transition-colors px-2 py-1 rounded"
      >
        PolyForm NC · Source ↗
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
