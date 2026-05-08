# 数据库接入指引

本项目**默认无数据库**——deck 存 sessionStorage，关页面即丢。如果你想要：
- 历史记录（看以前生成的 deck 列表）
- 多设备同步（笔记本生成、手机演讲）
- 团队共享（同事看到我做的 deck）

需要自己接数据库。本文给出**最小改动方案**。

---

## 数据形状

每个 deck 就是一个 `Deck` 对象（见 `lib/types.ts`）：

```ts
interface Deck {
  title: string;
  theme: ThemeId;
  brief: BriefInput;
  framework: string;
  slides: Slide[];          // 21 种版式之一的数组
  script: ScriptEntry[];    // 讲稿，每张幻灯片一条
  brand?: BrandOverride;    // 可选品牌覆盖
  selfReview?: SelfReview;  // 5 维自检
  createdAt: string;
}
```

**最简方案**：整个 `Deck` 当 JSON 字符串存一列就够了。要更结构化才拆表。

---

## 方案 A · SQLite（最小改动 · 单机/小团队推荐）

适合：开源用户自部署、Electron 桌面版、 < 1000 个 deck。

### 1. 装依赖

```bash
pnpm add better-sqlite3
```

### 2. 建表

新建 `lib/db.ts`：

```ts
import 'server-only';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), '.data', 'decks.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    theme       TEXT NOT NULL,
    json        TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    user_id     TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_decks_created ON decks(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_decks_user ON decks(user_id);
`);

export function saveDeck(deck: Deck, userId?: string): string {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO decks (id, title, theme, json, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, deck.title, deck.theme, JSON.stringify(deck), deck.createdAt, userId ?? null);
  return id;
}

export function listDecks(userId?: string, limit = 20): { id: string; title: string; theme: string; createdAt: string }[] {
  return db.prepare(`
    SELECT id, title, theme, created_at as createdAt
    FROM decks
    ${userId ? 'WHERE user_id = ?' : ''}
    ORDER BY created_at DESC LIMIT ?
  `).all(userId ?? limit, limit) as any;
}

export function loadDeck(id: string): Deck | null {
  const row = db.prepare('SELECT json FROM decks WHERE id = ?').get(id) as { json: string } | undefined;
  return row ? JSON.parse(row.json) : null;
}
```

### 3. 改 API 路由

`app/api/generate/route.ts` 末尾加：

```ts
import { saveDeck } from '@/lib/db';
// ... 原有逻辑生成 deck 后
const id = saveDeck(deck);
return NextResponse.json({ deck, id });  // 多返回 id
```

### 4. 加历史列表页

新建 `app/history/page.tsx`：

```tsx
'use server';
import { listDecks } from '@/lib/db';
import Link from 'next/link';

export default async function HistoryPage() {
  const items = await listDecks();
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">历史 Deck</h1>
      <ul className="mt-6 space-y-3">
        {items.map((d) => (
          <li key={d.id}>
            <Link href={`/deck/${d.id}`}>{d.title}（{d.theme}）— {d.createdAt}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

完成。约 30 分钟。

---

## 方案 B · Postgres / Supabase（云端 / 多用户）

适合：Vercel 生产部署、需要多用户、需要团队共享。

### 1. Schema

```sql
CREATE TABLE decks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  theme       TEXT NOT NULL,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_decks_user_created ON decks(user_id, created_at DESC);
```

### 2. 推荐栈

- **Postgres**: Supabase / Neon / Railway / 自建
- **ORM**: Drizzle ORM（类型友好）/ Prisma（生态强）
- **Auth**: Supabase Auth / Clerk / NextAuth

### 3. 增加字段（可选）

如果你想存 LLM 调用的元数据：

```sql
ALTER TABLE decks ADD COLUMN llm_provider TEXT;
ALTER TABLE decks ADD COLUMN llm_model TEXT;
ALTER TABLE decks ADD COLUMN tokens_used INT;
```

### 4. 安全

- AGPL-3.0 要求**部署版也开源**。如果你魔改了内核（不只是接 DB），需要把 fork 也开源。
- 不要把用户的 LLM API key 存数据库——保持 client-side localStorage 模式。
- JSONB 列可建 GIN 索引快速搜索 deck 内容。

---

## 方案 C · 仅 localStorage 历史（无后端）

最简单：deck 存浏览器，限当前用户。适合**单机版 / Electron**。

```ts
// lib/local-history.ts
const KEY = 'pg_deck_history';

export function saveLocal(deck: Deck): void {
  const list: Array<{ id: string; deck: Deck }> = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  list.unshift({ id: crypto.randomUUID(), deck });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
}

export function listLocal(): Array<{ id: string; deck: Deck }> {
  return JSON.parse(localStorage.getItem(KEY) ?? '[]');
}
```

约 5 分钟。Electron 分支默认走这条。

---

## 该用哪个？

| 场景 | 推荐 |
|---|---|
| 个人单机用 | C（localStorage） |
| 小团队（< 5 人）自部署 | A（SQLite） |
| 公司内部 / SaaS | B（Postgres + Auth） |
| Vercel 免费部署给朋友用 | A 不行（Vercel 无持久文件系统）→ 用 B 配 Supabase 免费额度 |

---

## 我们不内置的原因

1. **架构污染**：DB 选择是个人偏好，硬塞 Postgres 会绑架轻量用户
2. **依赖膨胀**：好的 ORM 都几 MB，加进 bundle 不值
3. **Auth 复杂**：一旦有用户系统就得做注册 / 登录 / 找回密码
4. **AGPL 边界更清晰**：用户拿干净的核心去派生，加什么由他们自己决定
