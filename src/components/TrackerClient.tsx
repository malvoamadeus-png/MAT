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
  const [tab, setTab] = useState<"discover" | "featured" | "changelog">("discover");

  const [items, setItems] = useState<OnboardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [startDraft, setStartDraft] = useState("");
  const [endDraft, setEndDraft] = useState("");
  const [minFollowersDraft, setMinFollowersDraft] = useState("");
  const [maxFollowersDraft, setMaxFollowersDraft] = useState("");

  const [featuredItems, setFeaturedItems] = useState<OnboardRow[]>([]);
  const [featuredTotal, setFeaturedTotal] = useState(0);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredError, setFeaturedError] = useState<string>("");
  const [featuredExpandedKey, setFeaturedExpandedKey] = useState<string | null>(null);
  const [featuredStart, setFeaturedStart] = useState("");
  const [featuredEnd, setFeaturedEnd] = useState("");
  const [featuredMinFollowers, setFeaturedMinFollowers] = useState("");
  const [featuredMaxFollowers, setFeaturedMaxFollowers] = useState("");
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);
  const [featuredSort, setFeaturedSort] = useState<"registered_desc" | "registered_asc" | "followers_desc">(
    "registered_desc"
  );
  const [featuredStartDraft, setFeaturedStartDraft] = useState("");
  const [featuredEndDraft, setFeaturedEndDraft] = useState("");
  const [featuredMinFollowersDraft, setFeaturedMinFollowersDraft] = useState("");
  const [featuredMaxFollowersDraft, setFeaturedMaxFollowersDraft] = useState("");

  function applyDiscoverFilters() {
    setPage(1);
    setStart(startDraft);
    setEnd(endDraft);
    setMinFollowers(minFollowersDraft);
    setMaxFollowers(maxFollowersDraft);
  }

  function applyFeaturedFilters() {
    setFeaturedPage(1);
    setFeaturedStart(featuredStartDraft);
    setFeaturedEnd(featuredEndDraft);
    setFeaturedMinFollowers(featuredMinFollowersDraft);
    setFeaturedMaxFollowers(featuredMaxFollowersDraft);
  }

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
    if (tab !== "discover") return;
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
    if (tab !== "discover") return;
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [autoRefresh, queryString]);

  const featuredQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(featuredPage));
    params.set("pageSize", String(PAGE_SIZE));
    if (featuredStart) params.set("start", featuredStart);
    if (featuredEnd) params.set("end", featuredEnd);
    if (featuredMinFollowers) params.set("minFollowers", featuredMinFollowers);
    if (featuredMaxFollowers) params.set("maxFollowers", featuredMaxFollowers);
    if (featuredCategories.length > 0) params.set("categories", featuredCategories.join(","));
    params.set("sort", featuredSort);
    return params.toString();
  }, [featuredPage, featuredStart, featuredEnd, featuredMinFollowers, featuredMaxFollowers, featuredCategories, featuredSort]);

  async function loadFeatured() {
    if (tab !== "featured") return;
    setFeaturedLoading(true);
    setFeaturedError("");
    try {
      const resp = await fetch(`/api/featured?${featuredQueryString}`, { cache: "no-store" });
      const data = (await resp.json()) as RecordsResponse | { error: string };
      if (!resp.ok) {
        throw new Error((data as any).error || "Request failed");
      }
      setFeaturedItems((data as RecordsResponse).items);
      setFeaturedTotal((data as RecordsResponse).total);
    } catch (e: any) {
      setFeaturedError(e?.message || "加载失败");
    } finally {
      setFeaturedLoading(false);
    }
  }

  useEffect(() => {
    loadFeatured();
  }, [featuredQueryString, tab]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const featuredTotalPages = Math.max(1, Math.ceil(featuredTotal / PAGE_SIZE));

  return (
    <div
      className="mx-auto max-w-6xl px-6 pb-16"
      onClick={() => setActiveWallet(null)}
    >
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
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              className={`rounded-md border px-4 py-2 text-sm ${
                tab === "discover"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-white/10 text-white/70 hover:bg-white/5"
              }`}
              onClick={() => {
                setTab("discover");
                setPage(1);
              }}
            >
              发现
            </button>
            <button
              className={`rounded-md border px-4 py-2 text-sm ${
                tab === "featured"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-white/10 text-white/70 hover:bg-white/5"
              }`}
              onClick={() => {
                setTab("featured");
                setFeaturedPage(1);
              }}
            >
              精选
            </button>
            <button
              className={`rounded-md border px-4 py-2 text-sm ${
                tab === "changelog"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-white/10 text-white/70 hover:bg-white/5"
              }`}
              onClick={() => setTab("changelog")}
            >
              更新日志
            </button>
          </div>
        </div>
      </div>

      {tab === "discover" ? (
        <>
          <div className="glass glass-border mt-8 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">注册时间起</span>
            <input
              type="datetime-local"
              value={startDraft}
              onChange={(e) => {
                setStartDraft(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">注册时间止</span>
            <input
              type="datetime-local"
              value={endDraft}
              onChange={(e) => {
                setEndDraft(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">关注者数量下限</span>
            <input
              type="number"
              value={minFollowersDraft}
              onChange={(e) => {
                setMinFollowersDraft(e.target.value);
              }}
              className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
              placeholder="例如 100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">关注者数量上限</span>
            <input
              type="number"
              value={maxFollowersDraft}
              onChange={(e) => {
                setMaxFollowersDraft(e.target.value);
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

          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
              onClick={applyDiscoverFilters}
            >
              确认筛选
            </button>
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
        </div>

        {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
      </div>

      <div className="glass glass-border mt-6 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="bg-white/5 text-white/80 backdrop-blur-md">
              <tr>
                <th className="w-[170px] whitespace-nowrap px-4 py-3 text-left">注册时间(UTC+8)</th>
                <th className="w-[160px] px-4 py-3 text-left">用户名</th>
                <th className="w-[140px] whitespace-nowrap px-4 py-3 text-left">handle</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 text-right">关注者数量</th>
                <th className="px-4 py-3 text-left">简介</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 text-left">分类</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 text-left">钱包</th>
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
                  <td className="px-4 py-3 text-white/70 whitespace-normal break-words">{row.bio || ""}</td>
                  <td className="px-4 py-3 text-white/80">{row.category || "/"}</td>
                  <td className="px-4 py-3">
                    {row.wallet_address ? (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWallet(activeWallet === row.wallet_address ? null : row.wallet_address);
                          }}
                          className="font-mono text-accent hover:underline"
                        >
                          {row.wallet_address.slice(0, 4)}…{row.wallet_address.slice(-4)}
                        </button>
                        {activeWallet === row.wallet_address && (
                          <div
                            className="glass glass-border absolute bottom-full left-0 z-50 mb-2 w-max p-2 text-xs shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="font-mono text-white selection:bg-accent/30">{row.wallet_address}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/60">
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
        </>
      ) : tab === "featured" ? (
        <div className="mt-8">
          {featuredError ? <div className="mt-4 text-sm text-red-400">{featuredError}</div> : null}

          <div className="glass glass-border p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">注册时间起</span>
                <input
                  type="datetime-local"
                  value={featuredStartDraft}
                  onChange={(e) => {
                    setFeaturedStartDraft(e.target.value);
                  }}
                  className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">注册时间止</span>
                <input
                  type="datetime-local"
                  value={featuredEndDraft}
                  onChange={(e) => {
                    setFeaturedEndDraft(e.target.value);
                  }}
                  className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">关注者数量下限</span>
                <input
                  type="number"
                  value={featuredMinFollowersDraft}
                  onChange={(e) => {
                    setFeaturedMinFollowersDraft(e.target.value);
                  }}
                  className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
                  placeholder="例如 5000"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">关注者数量上限</span>
                <input
                  type="number"
                  value={featuredMaxFollowersDraft}
                  onChange={(e) => {
                    setFeaturedMaxFollowersDraft(e.target.value);
                  }}
                  className="rounded-md border border-white/10 bg-bg px-3 py-2 text-white"
                  placeholder="例如 200000"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-sm text-white/70">分类</div>
                {CATEGORY_OPTIONS.filter((c) => c.value !== "/").map((c) => {
                  const checked = featuredCategories.includes(c.value);
                  return (
                    <label key={c.value} className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setFeaturedPage(1);
                          setFeaturedCategories((prev) =>
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
              <button
                className="rounded-md border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
                onClick={applyFeaturedFilters}
              >
                确认筛选
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="text-white/70">排序：</div>
              <button
                className={`rounded-md border px-3 py-1 ${
                  featuredSort === "registered_desc" || featuredSort === "registered_asc"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-white/10 text-white/70 hover:bg-white/5"
                }`}
                onClick={() => {
                  setFeaturedPage(1);
                  setFeaturedSort((prev) => {
                    if (prev === "registered_desc") return "registered_asc";
                    return "registered_desc";
                  });
                }}
              >
                时间{" "}
                {featuredSort === "registered_desc" ? "↓" : featuredSort === "registered_asc" ? "↑" : ""}
              </button>
              <button
                className={`rounded-md border px-3 py-1 ${
                  featuredSort === "followers_desc"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-white/10 text-white/70 hover:bg-white/5"
                }`}
                onClick={() => {
                  setFeaturedPage(1);
                  setFeaturedSort("followers_desc");
                }}
              >
                关注者数量 {featuredSort === "followers_desc" ? "↓" : ""}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredItems.map((row) => {
              const key = `${row.handle}-${row.registered_at}`;
              const expanded = featuredExpandedKey === key;
              const recent = Array.isArray(row.grok_recent_focus) ? row.grok_recent_focus : [];
              const exp = Array.isArray(row.grok_experience) ? row.grok_experience : [];
              const hi = Array.isArray(row.grok_highlights) ? row.grok_highlights : [];
              return (
                <div key={key} className="glass glass-border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={`https://x.com/${row.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-base font-semibold text-accent hover:underline"
                      >
                        @{row.handle}
                      </a>
                      <div className="text-sm text-white/70">关注者：{formatNumber(row.followers_count)}</div>
                      <div className="text-sm text-white/70">注册：{row.registered_at_utc8}</div>
                      <div className="text-sm text-white/70">分类：{row.category || "/"}</div>
                    </div>

                    <button
                      className="rounded-md border border-white/10 px-3 py-1 text-sm text-white/70 hover:bg-white/5"
                      onClick={() => setFeaturedExpandedKey((v) => (v === key ? null : key))}
                    >
                      {expanded ? "收起" : "展开"}
                    </button>
                  </div>

                  <div className="mt-3 text-sm text-white/80">
                    <span className="text-white/60">总结：</span>
                    {row.grok_summary || "—"}
                  </div>

                  {expanded ? (
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="text-white/80">
                        <span className="text-white/60">近期在做什么/聊什么：</span>
                        {recent.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-white/75">
                            {recent.slice(0, 6).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                      <div className="text-white/80">
                        <span className="text-white/60">履历：</span>
                        {exp.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-white/75">
                            {exp.slice(0, 6).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                      <div className="text-white/80">
                        <span className="text-white/60">亮点/成绩：</span>
                        {hi.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-white/75">
                            {hi.slice(0, 6).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                      <div className="text-white/80">
                        <span className="text-white/60">对 Crypto 的态度：</span>
                        {row.grok_crypto_attitude || "—"}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {featuredItems.length === 0 ? (
              <div className="glass glass-border px-4 py-10 text-center text-white/60">
                {featuredLoading ? "加载中…" : "暂无精选数据"}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-white/70">
              {featuredLoading ? "加载中…" : `共 ${featuredTotal} 条，当前第 ${featuredPage} / ${featuredTotalPages} 页`}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-white/10 px-3 py-1 text-sm text-white/80 disabled:opacity-40"
                disabled={featuredPage <= 1 || featuredLoading}
                onClick={() => setFeaturedPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </button>
              <button
                className="rounded-md border border-white/10 px-3 py-1 text-sm text-white/80 disabled:opacity-40"
                disabled={featuredPage >= featuredTotalPages || featuredLoading}
                onClick={() => setFeaturedPage((p) => p + 1)}
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="glass glass-border p-5">
            <div className="text-lg font-semibold text-white/90">更新日志</div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <div>2/4 首个版本上线，支持分钟级Moltbook注册账号抓取及初级分析</div>
              <div>2/4 新增精选账号钱包抓取功能，当前仅针对5000以上关注者、分类不为/的账号生效</div>
              <div>2/5 新增精选账号深度分析模块，当前仅针对5000以上关注者、分类不为/的账号生效</div>
              <div>2/6 UI更新，新增多类自定义筛选、排序功能</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
