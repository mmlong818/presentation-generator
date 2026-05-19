'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { THEMES } from '@/lib/themes';
import type { Deck } from '@/lib/types';

const HISTORY_KEY = 'pg_deck_history';
const DECK_STORAGE = 'pg_last_deck';

interface HistoryItem { id: string; deck: Deck; }

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'));
    } catch { setItems([]); }
  }, []);

  function open(item: HistoryItem) {
    localStorage.setItem(DECK_STORAGE, JSON.stringify(item.deck));
    router.push('/deck');
  }

  function remove(id: string) {
    const target = items.find((x) => x.id === id);
    const label = target ? `"${target.deck.title.slice(0, 30)}"` : '这条记录';
    if (!confirm(`删除 ${label}？此操作不可撤销。`)) return;
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function clearAll() {
    if (!confirm('确定清空全部历史？此操作不可撤销。')) return;
    localStorage.removeItem(HISTORY_KEY);
    setItems([]);
  }

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12 lg:px-20 max-w-5xl mx-auto">
      <header className="mb-10 flex items-baseline justify-between gap-6">
        <div>
          <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">← 主页</Link>
          <h1 className="text-3xl font-bold mt-3">历史 Deck</h1>
          <p className="text-stone-600 mt-2 text-sm">最近 20 条，存在你的浏览器，本地有效。</p>
        </div>
        {items.length > 0 && (
          <button onClick={clearAll} className="text-xs text-red-600 hover:underline">清空全部</button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p>还没有生成过 deck。</p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 bg-stone-900 text-white rounded-md text-sm">
            去生成第一个 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const t = THEMES[item.deck.theme] ?? THEMES['modern-minimal'];
            return (
              <li key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-400 transition cursor-pointer"
                onClick={() => open(item)}>
                <div className="w-20 h-12 rounded relative overflow-hidden flex-shrink-0" style={{ background: t.bg }}>
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${t.accent}aa 0%, ${t.bg} 50%)`,
                    opacity: 0.6,
                  }} />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: t.text }}>
                    {t.name}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{item.deck.title}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {t.name} · {item.deck.framework} · {item.deck.slides.length} 张 ·
                    {' '}{new Date(item.deck.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                  className="text-xs text-stone-500 hover:text-red-600 px-2">
                  删除
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
