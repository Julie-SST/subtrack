"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "娛樂" | "音樂" | "工作" | "健康";
type Cycle = "月" | "季" | "年";

type Subscription = {
  id: string;
  name: string;
  category: Category;
  amount: number;
  cycle: Cycle;
  nextBillingDate: string;
};

const STORAGE_KEY = "subtrack:subscriptions:v1";

/** 選填：頁尾／說明視窗的對外連結（例如官網、表單）。勿硬編 GitHub 個人帳號網址。 */
const MORE_INFO_URL =
  process.env.NEXT_PUBLIC_MORE_INFO_URL?.trim() ?? "";

const CATEGORIES: Category[] = ["娛樂", "音樂", "工作", "健康"];

const CATEGORY_STYLES: Record<
  Category,
  { badge: string; dot: string; ring: string; soft: string; hex: string }
> = {
  娛樂: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    ring: "ring-rose-300",
    soft: "bg-rose-50",
    hex: "#f43f5e",
  },
  音樂: {
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    ring: "ring-purple-300",
    soft: "bg-purple-50",
    hex: "#a855f7",
  },
  工作: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-300",
    soft: "bg-blue-50",
    hex: "#3b82f6",
  },
  健康: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-300",
    soft: "bg-emerald-50",
    hex: "#10b981",
  },
};

function formatNTD(amount: number): string {
  return `NT$${amount.toLocaleString("zh-TW")}`;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysUntil(dateStr: string): number {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(dateStr));
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatChineseDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 換算成每月約當金額（列表與圖表用） */
function monthlyEquivalent(s: Pick<Subscription, "amount" | "cycle">): number {
  if (s.cycle === "月") return s.amount;
  if (s.cycle === "季") return s.amount / 3;
  return s.amount / 12;
}

/** 換算成每年約當金額（年支出卡用） */
function yearlyEquivalent(s: Pick<Subscription, "amount" | "cycle">): number {
  if (s.cycle === "年") return s.amount;
  if (s.cycle === "季") return s.amount * 4;
  return s.amount * 12;
}

function buildDefaultSubs(): Subscription[] {
  const today = new Date();
  return [
    {
      id: "sub-netflix",
      name: "Netflix",
      category: "娛樂",
      amount: 330,
      cycle: "月",
      nextBillingDate: toISODate(addDays(today, 3)),
    },
    {
      id: "sub-spotify",
      name: "Spotify",
      category: "音樂",
      amount: 99,
      cycle: "月",
      nextBillingDate: toISODate(addDays(today, 9)),
    },
    {
      id: "sub-chatgpt",
      name: "ChatGPT Plus",
      category: "工作",
      amount: 620,
      cycle: "月",
      nextBillingDate: toISODate(addDays(today, 14)),
    },
    {
      id: "sub-adobe",
      name: "Adobe CC",
      category: "工作",
      amount: 1680,
      cycle: "月",
      nextBillingDate: toISODate(addDays(today, 22)),
    },
  ];
}

function isSubscription(v: unknown): v is Subscription {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.amount === "number" &&
    (o.cycle === "月" || o.cycle === "季" || o.cycle === "年") &&
    typeof o.nextBillingDate === "string" &&
    CATEGORIES.includes(o.category as Category)
  );
}

type FilterOption = "全部" | Category;
const FILTERS: FilterOption[] = ["全部", "娛樂", "音樂", "工作", "健康"];

export default function Home() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("全部");
  const [isAdding, setIsAdding] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [showVisitorInfo, setShowVisitorInfo] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isSubscription);
          setSubs(valid);
          setHydrated(true);
          return;
        }
      }
    } catch {
      // ignore corrupt storage, fall back to defaults
    }
    setSubs(buildDefaultSubs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
    } catch {
      // localStorage may be unavailable (private mode / quota)
    }
  }, [subs, hydrated]);

  const modalOpen = isAdding || editingSub !== null;

  const monthlyTotal = useMemo(
    () => subs.reduce((sum, s) => sum + monthlyEquivalent(s), 0),
    [subs]
  );
  const yearlyTotal = useMemo(
    () => subs.reduce((sum, s) => sum + yearlyEquivalent(s), 0),
    [subs]
  );
  const nextBilling = useMemo(() => {
    if (subs.length === 0) return null;
    return [...subs].sort(
      (a, b) =>
        new Date(a.nextBillingDate).getTime() -
        new Date(b.nextBillingDate).getTime()
    )[0];
  }, [subs]);

  const filteredSubs = useMemo(() => {
    return subs
      .filter((s) => (filter === "全部" ? true : s.category === filter))
      .filter((s) =>
        search.trim() === ""
          ? true
          : s.name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(a.nextBillingDate).getTime() -
          new Date(b.nextBillingDate).getTime()
      );
  }, [subs, filter, search]);

  const categoryBreakdown = useMemo(() => {
    const totals: Record<Category, number> = {
      娛樂: 0,
      音樂: 0,
      工作: 0,
      健康: 0,
    };
    for (const s of subs) {
      totals[s.category] += monthlyEquivalent(s);
    }
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return { totals, total };
  }, [subs]);

  const timeline = useMemo(() => {
    const now = startOfDay(new Date());
    const weekday = now.getDay() === 0 ? 7 : now.getDay();
    const endOfThisWeek = addDays(now, 7 - weekday);
    const endOfNextWeek = addDays(endOfThisWeek, 7);
    const horizon = addDays(now, 30);

    const thisWeek: Subscription[] = [];
    const nextWeek: Subscription[] = [];
    const later: Subscription[] = [];

    for (const s of subs) {
      const d = startOfDay(new Date(s.nextBillingDate));
      if (d < now || d > horizon) continue;
      if (d <= endOfThisWeek) thisWeek.push(s);
      else if (d <= endOfNextWeek) nextWeek.push(s);
      else later.push(s);
    }

    const sortByDate = (a: Subscription, b: Subscription) =>
      new Date(a.nextBillingDate).getTime() -
      new Date(b.nextBillingDate).getTime();

    return {
      thisWeek: thisWeek.sort(sortByDate),
      nextWeek: nextWeek.sort(sortByDate),
      later: later.sort(sortByDate),
    };
  }, [subs]);

  function handleSubmit(data: Omit<Subscription, "id">) {
    if (editingSub) {
      setSubs((prev) =>
        prev.map((s) => (s.id === editingSub.id ? { ...data, id: s.id } : s))
      );
    } else {
      setSubs((prev) => [
        ...prev,
        { ...data, id: `sub-${Date.now().toString(36)}` },
      ]);
    }
    setIsAdding(false);
    setEditingSub(null);
  }

  function handleDelete(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  function closeModal() {
    setIsAdding(false);
    setEditingSub(null);
  }

  return (
    <div className="flex-1 w-full">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Header
          onAdd={() => setIsAdding(true)}
          onShowInfo={() => setShowVisitorInfo(true)}
        />

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="每月支出"
            value={formatNTD(Math.round(monthlyTotal))}
            gradient="from-rose-400 to-pink-500"
            icon="💸"
          />
          <StatCard
            label="每年支出"
            value={formatNTD(Math.round(yearlyTotal))}
            gradient="from-amber-400 to-orange-500"
            icon="📅"
          />
          <StatCard
            label="下次扣款"
            value={
              nextBilling
                ? `${nextBilling.name} · ${formatChineseDate(
                    nextBilling.nextBillingDate
                  )}`
                : "—"
            }
            gradient="from-blue-400 to-indigo-500"
            icon="⏰"
            small
          />
          <StatCard
            label="訂閱數量"
            value={`${subs.length} 項`}
            gradient="from-emerald-400 to-teal-500"
            icon="📦"
          />
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-slate-900">我的訂閱</h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜尋訂閱..."
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-56"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🔍
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>

              <ul className="mt-5 flex flex-col gap-3">
                {!hydrated ? (
                  <SkeletonRow />
                ) : filteredSubs.length === 0 ? (
                  <li className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                    {subs.length === 0
                      ? "還沒有訂閱，點右上角「新增訂閱」開始吧 ✨"
                      : "沒有符合條件的訂閱"}
                  </li>
                ) : (
                  filteredSubs.map((s) => (
                    <SubscriptionRow
                      key={s.id}
                      sub={s}
                      onEdit={() => setEditingSub(s)}
                      onDelete={() => handleDelete(s.id)}
                    />
                  ))
                )}
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-6 lg:col-span-1">
            <CategoryChart
              breakdown={categoryBreakdown}
              hydrated={hydrated}
            />
            <Timeline timeline={timeline} hydrated={hydrated} />
          </section>
        </div>

        <footer className="mt-10 border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
          <p className="font-medium text-slate-600">
            Subtrack · 讓你的每一筆訂閱都看得見 ✨
          </p>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed">
            你的訂閱清單與金額只存在這台裝置的瀏覽器裡，沒有登入帳號，我們也不會把清單存進伺服器資料庫。清除網站資料、換瀏覽器或換手機後需自行重新建立。
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => setShowVisitorInfo(true)}
              className="font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-700"
            >
              使用說明與隱私
            </button>
            {MORE_INFO_URL ? (
              <a
                href={MORE_INFO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              >
                更多資訊
              </a>
            ) : null}
          </div>
        </footer>
      </div>

      {modalOpen && (
        <SubscriptionModal
          initial={editingSub}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onDelete={
            editingSub
              ? () => {
                  handleDelete(editingSub.id);
                  closeModal();
                }
              : undefined
          }
        />
      )}

      {showVisitorInfo && (
        <VisitorInfoModal
          onClose={() => setShowVisitorInfo(false)}
          moreInfoUrl={MORE_INFO_URL}
        />
      )}
    </div>
  );
}

function Header({
  onAdd,
  onShowInfo,
}: {
  onAdd: () => void;
  onShowInfo: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-xl shadow-lg shadow-indigo-200">
          <span className="drop-shadow-sm">💳</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Subtrack
          </h1>
          <p className="text-xs text-slate-500">訂閱管理儀表板 · 免費使用</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onShowInfo}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          使用說明
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-600 hover:to-purple-600 active:scale-95"
        >
          <span className="text-lg leading-none">＋</span>
          新增訂閱
        </button>
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  gradient,
  icon,
  small = false,
}: {
  label: string;
  value: string;
  gradient: string;
  icon: string;
  small?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg shadow-slate-200/60`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-white/90">{label}</span>
        <span className="text-2xl leading-none">{icon}</span>
      </div>
      <div
        className={`mt-3 font-extrabold tracking-tight ${
          small ? "text-lg" : "text-2xl"
        }`}
      >
        {value}
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
        </li>
      ))}
    </>
  );
}

function SubscriptionRow({
  sub,
  onEdit,
  onDelete,
}: {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const styles = CATEGORY_STYLES[sub.category];
  const days = daysUntil(sub.nextBillingDate);
  const countdownColor =
    days <= 3
      ? "text-rose-600"
      : days <= 7
      ? "text-amber-600"
      : "text-slate-500";

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit();
        }
      }}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:border-indigo-200 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.soft} text-lg font-bold text-slate-700 ring-1 ring-inset ${styles.ring}`}
      >
        {sub.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-slate-900">{sub.name}</p>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {sub.category}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          下次扣款 · {formatChineseDate(sub.nextBillingDate)} · 每{sub.cycle}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <p className="font-bold text-slate-900">{formatNTD(sub.amount)}</p>
        <p className={`text-xs font-medium ${countdownColor}`}>
          {days === 0 ? "今天" : days < 0 ? `已過 ${-days} 天` : `${days} 天後`}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="刪除訂閱"
        className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 group-hover:flex"
      >
        ✕
      </button>
    </li>
  );
}

function CategoryChart({
  breakdown,
  hydrated,
}: {
  breakdown: { totals: Record<Category, number>; total: number };
  hydrated: boolean;
}) {
  const { totals, total } = breakdown;
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = CATEGORIES.map((cat) => ({
    category: cat,
    value: totals[cat],
    percentage: total > 0 ? totals[cat] / total : 0,
  })).filter((s) => s.value > 0);

  let cumulative = 0;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">分類支出</h2>
      <p className="text-xs text-slate-500">每月支出占比</p>

      {!hydrated ? (
        <div className="mt-6 flex items-center justify-center">
          <div
            className="animate-pulse rounded-full bg-slate-100"
            style={{ width: size, height: size }}
          />
        </div>
      ) : total === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          目前沒有支出資料
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-center">
            <div
              className="relative"
              style={{ width: size, height: size }}
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {segments.map((seg) => {
                  const length = seg.percentage * circumference;
                  const offset = -cumulative * circumference;
                  cumulative += seg.percentage;
                  return (
                    <circle
                      key={seg.category}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={CATEGORY_STYLES[seg.category].hex}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={offset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500">每月</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatNTD(Math.round(total))}
                </span>
              </div>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {CATEGORIES.map((cat) => {
              const value = totals[cat];
              const pct = total > 0 ? (value / total) * 100 : 0;
              if (value === 0) return null;
              return (
                <li
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_STYLES[cat].hex,
                      }}
                    />
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="text-xs text-slate-400">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatNTD(Math.round(value))}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Timeline({
  timeline,
  hydrated,
}: {
  timeline: {
    thisWeek: Subscription[];
    nextWeek: Subscription[];
    later: Subscription[];
  };
  hydrated: boolean;
}) {
  const groups: { title: string; items: Subscription[]; color: string }[] = [
    { title: "本週", items: timeline.thisWeek, color: "bg-rose-500" },
    { title: "下週", items: timeline.nextWeek, color: "bg-amber-500" },
    { title: "本月稍後", items: timeline.later, color: "bg-indigo-500" },
  ];

  const empty =
    timeline.thisWeek.length === 0 &&
    timeline.nextWeek.length === 0 &&
    timeline.later.length === 0;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">即將扣款</h2>
      <p className="text-xs text-slate-500">未來 30 天內的扣款</p>

      {!hydrated ? (
        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-slate-100" />
      ) : empty ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          未來 30 天沒有即將扣款的訂閱 🎉
        </div>
      ) : (
        <div className="relative mt-5">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="flex items-center gap-3">
                  <span
                    className={`h-3.5 w-3.5 rounded-full ${g.color} ring-4 ring-white`}
                  />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {g.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {g.items.length} 項
                  </span>
                </div>
                <div className="mt-2 ml-6 flex flex-col gap-2">
                  {g.items.length === 0 ? (
                    <p className="text-xs text-slate-400">無</p>
                  ) : (
                    g.items.map((s) => {
                      const styles = CATEGORY_STYLES[s.category];
                      const days = daysUntil(s.nextBillingDate);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between rounded-xl ${styles.soft} px-3 py-2`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {s.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatChineseDate(s.nextBillingDate)} ·{" "}
                              {days === 0
                                ? "今天"
                                : days < 0
                                ? `已過 ${-days} 天`
                                : `${days} 天後`}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">
                            {formatNTD(s.amount)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VisitorInfoModal({
  onClose,
  moreInfoUrl,
}: {
  onClose: () => void;
  moreInfoUrl: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-info-title"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="visitor-info-title"
            className="text-xl font-bold text-slate-900"
          >
            給使用者的說明
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-600">
          <section>
            <h3 className="font-bold text-slate-900">Subtrack 是什麼？</h3>
            <p className="mt-2">
              用來整理訂閱服務名稱、金額、週期與下次扣款日的儀表板，方便估算每月與每年大概花多少。
            </p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900">資料與隱私</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 marker:text-indigo-500">
              <li>
                訂閱內容只存在<strong>你這台裝置的瀏覽器</strong>（localStorage），
                <strong>沒有登入帳號</strong>。
              </li>
              <li>
                應用程式本身<strong>不會把你的訂閱清單上傳到我們的資料庫</strong>；主機僅提供網頁與程式檔（與一般網站相同可能會有連線紀錄，但不包含你的清單內容）。
              </li>
              <li>
                若你<strong>清除網站資料</strong>、換瀏覽器或換手機，資料不會跟著轉移，需自行重新輸入。
              </li>
            </ul>
          </section>
          <section>
            <h3 className="font-bold text-slate-900">當成 App 使用</h3>
            <p className="mt-2">
              用 Chrome、Edge 或 Safari 可將 Subtrack{" "}
              <strong>加到主畫面</strong>
              ，以全螢幕方式開啟；離線時能否瀏覽視瀏覽器快取而定。
            </p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900">意見與回報</h3>
            {moreInfoUrl ? (
              <p className="mt-2">
                若有問題或建議，可透過下方連結與我們聯繫（連結由站方設定，不含開發者個人帳號頁）。
              </p>
            ) : (
              <p className="mt-2">
                本站未列出對外聯絡網址。若你是透過他人分享使用，可向對方反映使用狀況。
              </p>
            )}
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {moreInfoUrl ? (
            <a
              href={moreInfoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              更多資訊
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-indigo-600 hover:to-purple-600"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionModal({
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  initial: Subscription | null;
  onClose: () => void;
  onSubmit: (sub: Omit<Subscription, "id">) => void;
  onDelete?: () => void;
}) {
  const isEdit = initial !== null;
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? "娛樂"
  );
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : ""
  );
  const [cycle, setCycle] = useState<Cycle>(initial?.cycle ?? "月");
  const [nextBillingDate, setNextBillingDate] = useState(
    initial?.nextBillingDate ?? toISODate(addDays(new Date(), 7))
  );
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const amt = Number(amount);
    if (!trimmed) {
      setError("請輸入服務名稱");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("請輸入有效的金額");
      return;
    }
    if (!nextBillingDate) {
      setError("請選擇下次扣款日");
      return;
    }
    onSubmit({
      name: trimmed,
      category,
      amount: Math.round(amt),
      cycle,
      nextBillingDate,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {isEdit ? "編輯訂閱" : "新增訂閱"}
          </h3>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Field label="服務名稱">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：Netflix"
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </Field>

          <Field label="分類">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const active = category === c;
                const styles = CATEGORY_STYLES[c];
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? `${styles.badge} border-transparent shadow-sm`
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="金額 (NT$)">
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="330"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </Field>
            <Field label="週期">
              <div className="grid grid-cols-3 gap-1.5">
                {(["月", "季", "年"] as Cycle[]).map((c) => {
                  const active = cycle === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCycle(c)}
                      className={`rounded-xl border px-2 py-2 text-sm font-medium transition sm:px-3 ${
                        active
                          ? "border-transparent bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      每{c}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <Field label="下次扣款日">
            <input
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                刪除
              </button>
            )}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-600 hover:to-purple-600 active:scale-95"
              >
                {isEdit ? "儲存" : "新增"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
