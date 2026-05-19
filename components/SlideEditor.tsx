'use client';

// ─── 通用 slide 字段编辑器 ───────────────────────────────────────────────────
// 自动遍历 slide 对象，把所有 string / string[] / 嵌套对象的字符串字段渲染成输入框。
// 用户改完点保存 → onSave 收到新的 slide → 上层更新 deck state。

import { useState } from 'react';
import type { Slide } from '@/lib/types';

interface Props {
  slide: Slide;
  onClose: () => void;
  onSave: (next: Slide) => void;
}

type AnyObj = Record<string, unknown>;

export default function SlideEditor({ slide, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<AnyObj>(JSON.parse(JSON.stringify(slide)));
  const [advanced, setAdvanced] = useState(false);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(slide, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  function update(path: (string | number)[], val: unknown) {
    setDraft((d) => {
      const copy = JSON.parse(JSON.stringify(d));
      let cur: AnyObj = copy;
      for (let i = 0; i < path.length - 1; i++) {
        cur = cur[path[i] as string] as AnyObj;
      }
      cur[path[path.length - 1] as string] = val;
      return copy;
    });
  }

  function handleSaveSimple() {
    onSave(draft as unknown as Slide);
  }

  function handleSaveAdvanced() {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      onSave(parsed);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : '不是合法 JSON');
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-stone-200 shadow-2xl flex flex-col z-40">
      <header className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500">编辑幻灯片</div>
          <div className="font-bold mt-0.5">类型: <code className="bg-stone-100 px-2 py-0.5 rounded text-sm">{slide.type}</code></div>
        </div>
        <button onClick={onClose} className="text-stone-500 hover:text-stone-900 text-xl">✕</button>
      </header>

      <div className="px-5 py-3 border-b border-stone-200 flex gap-2 text-xs">
        <button onClick={() => setAdvanced(false)}
          className={`px-3 py-1.5 rounded ${!advanced ? 'bg-stone-900 text-white' : 'border border-stone-300'}`}>
          按字段
        </button>
        <button onClick={() => setAdvanced(true)}
          className={`px-3 py-1.5 rounded ${advanced ? 'bg-stone-900 text-white' : 'border border-stone-300'}`}>
          高级（JSON）
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {advanced ? (
          <textarea
            value={jsonText} onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-full font-mono text-xs p-3 border border-stone-300 rounded resize-none"
            style={{ minHeight: 500 }}
          />
        ) : (
          <FieldsForm obj={draft} path={[]} update={update} skipKeys={['type']} />
        )}
        {advanced && jsonError && (
          <div className="text-sm text-red-600 mt-3">{jsonError}</div>
        )}
      </div>

      <footer className="px-5 py-4 border-t border-stone-200 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600">取消</button>
        <button onClick={advanced ? handleSaveAdvanced : handleSaveSimple}
          className="px-5 py-2 text-sm rounded-md bg-stone-900 text-white">
          保存
        </button>
      </footer>
    </div>
  );
}

// ─── 递归字段表单 ───────────────────────────────────────────────────────────

function FieldsForm({ obj, path, update, skipKeys = [] }: {
  obj: AnyObj; path: (string | number)[];
  update: (p: (string | number)[], v: unknown) => void;
  skipKeys?: string[];
}) {
  return (
    <div className="space-y-3">
      {Object.entries(obj).map(([key, value]) => {
        if (skipKeys.includes(key)) return null;
        const fullPath = [...path, key];
        if (typeof value === 'string') {
          const isLong = value.length > 60;
          return (
            <Field key={key} label={pretty(key)}>
              {isLong ? (
                <textarea value={value} onChange={(e) => update(fullPath, e.target.value)}
                  rows={3} className="w-full p-2 border border-stone-300 rounded text-sm" />
              ) : (
                <input value={value} onChange={(e) => update(fullPath, e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded text-sm" />
              )}
            </Field>
          );
        }
        if (typeof value === 'number') {
          return (
            <Field key={key} label={pretty(key)}>
              <input type="number" value={value} onChange={(e) => update(fullPath, Number(e.target.value))}
                className="w-full p-2 border border-stone-300 rounded text-sm" />
            </Field>
          );
        }
        if (typeof value === 'boolean') {
          return (
            <Field key={key} label={pretty(key)}>
              <input type="checkbox" checked={value} onChange={(e) => update(fullPath, e.target.checked)} />
            </Field>
          );
        }
        if (Array.isArray(value)) {
          return (
            <Field key={key} label={`${pretty(key)} (${value.length})`}>
              <div className="border-l-2 border-stone-200 pl-3 space-y-2">
                {value.map((item, i) => (
                  <div key={i} className="border border-stone-200 rounded p-2 bg-stone-50">
                    <div className="text-xs text-stone-500 mb-1.5">[{i}]</div>
                    {typeof item === 'string' ? (
                      <input value={item} onChange={(e) => {
                        const next = [...value]; next[i] = e.target.value; update(fullPath, next);
                      }} className="w-full p-1.5 border border-stone-300 rounded text-sm" />
                    ) : (
                      <FieldsForm obj={item as AnyObj} path={[...fullPath, i]} update={update} />
                    )}
                  </div>
                ))}
              </div>
            </Field>
          );
        }
        if (value && typeof value === 'object') {
          return (
            <Field key={key} label={pretty(key)}>
              <div className="border-l-2 border-stone-200 pl-3">
                <FieldsForm obj={value as AnyObj} path={fullPath} update={update} />
              </div>
            </Field>
          );
        }
        return null;
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function pretty(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}
