import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function toUtc8MinuteText(value: string) {
  if (!value) return "";
  return value.replace("T", " ").slice(0, 16);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "20")));
    const start = toUtc8MinuteText(url.searchParams.get("start") || "");
    const end = toUtc8MinuteText(url.searchParams.get("end") || "");
    const minFollowers = url.searchParams.get("minFollowers");
    const maxFollowers = url.searchParams.get("maxFollowers");
    const categoriesRaw = (url.searchParams.get("categories") || "").trim();
    const categories = categoriesRaw ? categoriesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const supabase = getSupabaseAdmin();
    const columns =
      "registered_at,registered_at_utc8,username,handle,followers_count,bio,category,wallet_address,grok_summary,grok_recent_focus,grok_experience,grok_highlights,grok_crypto_attitude,grok_checked_at";

    let query = supabase
      .from("molt_onboard")
      .select(columns, { count: "exact" })
      .gt("followers_count", 5000)
      .neq("category", "/")
      .not("grok_checked_at", "is", null)
      .order("followers_count", { ascending: false })
      .order("registered_at", { ascending: false });

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("registered_at", threeDaysAgo);

    if (start) query = query.gte("registered_at_utc8", start);
    if (end) query = query.lte("registered_at_utc8", end);

    if (minFollowers && Number.isFinite(Number(minFollowers))) {
      query = query.gte("followers_count", Number(minFollowers));
    }
    if (maxFollowers && Number.isFinite(Number(maxFollowers))) {
      query = query.lte("followers_count", Number(maxFollowers));
    }

    if (categories.length > 0) {
      const orExpr = categories.map((c) => `category.ilike.%${c}%`).join(",");
      query = query.or(orExpr);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) {
      const msg = error.message || "Unknown error";
      if (msg.includes("does not exist") && msg.includes("grok_")) {
        return NextResponse.json(
          {
            error:
              "精选字段尚未在 Supabase 建表/迁移：请先执行 supabase/grok_profile_migration.sql 后重试。"
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
