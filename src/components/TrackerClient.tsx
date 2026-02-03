"use client";

import { useEffect, useMemo, useState } from "react";

import type { OnboardRow, RecordsResponse } from "@/lib/types";

const PAGE_SIZE = 20;
const CATEGORY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Crypto", value: "Crypto" },
  { label: "AI", value: "AI" },
  { label: "Artist", value: "Artist" },
  { label: "TradFi", value: "TradFi" },
  { label: "无法判断(/)", value: "/" }
];

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("en-US").format(value);
}

export function TrackerClient() {
  const [items, setItems] = useState<OnboardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (minFollowers) params.set("minFollowers", minFollowers);
    if (maxFollowers) params.set("maxFollowers", maxFollowers);
    if (categories.length > 0) params.set("categories", categories.join(","));
    return params.toString();
  }, [page, start, end, minFollowers, maxFollowers, categories]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`/api/records?${queryString}`, { cache: "no-store" });
      const data = (await resp.json()) as RecordsResponse | { error: string };
      if (!resp.ok) {
        throw new Error((data as any).error || "Request failed");
      }
      setItems((data as RecordsResponse).items);
      setTotal((data as RecordsResponse).total);
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [queryString]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [autoRefresh, queryString]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      <div className="relative mt-12">
        <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
          <a
            href="https://www.moltbook.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
          >
            Moltbook
          </a>

          <div className="group relative">
            <a
              href="https://x.com/Assassin_Malvo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M18.901 1.153h3.68l-8.039 9.187L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.473l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.492h2.039L6.486 3.24H4.3l13.311 17.405Z" />
              </svg>
              <span>By 南枳</span>
            </a>
            
            {/* Tooltip */}
            <div className="invisible absolute bottom-full right-0 mb-2 w-max origin-bottom scale-95 opacity-0 transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
              <div className="glass glass-border rounded-lg p-3 text-xs shadow-xl">
                <div className="mb-1 font-semibold text-accent">Buy Me a Coffee</div>
                <div className="font-mono text-white/70">0x30b4301e844f7432b8694b6bb92894c0b91746d1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="text-5xl font-semibold tracking-wide [font-family:var(--font-serif)] md:text-6xl">
            MOLT ALPHA TRACKER
          </div>
          <div className="mt-4 text-xl tracking-wide text-accent [font-family:var(--font-serif)] md:text-2xl">
            追踪最具潜力账号
          </div>
          <div className="mt-3 max-w-3xl text-sm text-white/85">
            分钟级追踪所有Moltbook上注册的最新账号，溯源其X账号，寻找最具潜力的AI+Crypto背景账号
          </div>
        </div>
      </div>

      <div className="glass glass-border mt-8 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">注册时间起</span>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => {
                setPage(1);
                setStart(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">注册时间止</span>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => {
                setPage(1);
                setEnd(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">关注者数量下限</span>
            <input
              type="number"
              value={minFollowers}
              onChange={(e) => {
                setPage(1);
                setMinFollowers(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
              placeholder="例如 100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">关注者数量上限</span>
            <input
              type="number"
              value={maxFollowers}
              onChange={(e) => {
                setPage(1);
                setMaxFollowers(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
              placeholder="例如 10000"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm text-white/70">分类</div>
            {CATEGORY_OPTIONS.map((c) => {
              const checked = categories.includes(c.value);
              return (
                <label key={c.value} className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setPage(1);
                      setCategories((prev) =>
                        prev.includes(c.value) ? prev.filter((x) => x !== c.value) : [...prev, c.value]
                      );
                    }}
                    className="accent-accent"
                  />
                  {c.label}
                </label>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-accent"
            />
            自动刷新（1 分钟）
          </label>
        </div>

        {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
      </div>

      <div className="glass glass-border mt-6 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-white/5 text-white/80 backdrop-blur-md">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left">注册时间(UTC+8)</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">用户名</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">handle</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">关注者数量</th>
                <th className="min-w-[360px] px-4 py-3 text-left">简介</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">分类</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={`${row.handle}-${row.registered_at}`} className="border-t border-white/10 hover:bg-white/5">
                  <td className="whitespace-nowrap px-4 py-3 text-white/80">{row.registered_at_utc8}</td>
                  <td className="px-4 py-3 text-white/80">{row.username || ""}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://x.com/${row.handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      @{row.handle}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-white/80">
                    {formatNumber(row.followers_count)}
                  </td>
                  <td className="px-4 py-3 text-white/70">{row.bio || ""}</td>
                  <td className="px-4 py-3 text-white/80">{row.category || "/"}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                    {loading ? "加载中…" : "暂无数据（默认仅展示近 3 日）"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-4 py-3">
          <div className="text-sm text-white/70">
            {loading ? "加载中…" : `共 ${total} 条，当前第 ${page} / ${totalPages} 页`}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-white/10 px-3 py-1 text-sm text-white/80 disabled:opacity-40"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </button>
            <button
              className="rounded-md border border-white/10 px-3 py-1 text-sm text-white/80 disabled:opacity-40"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
