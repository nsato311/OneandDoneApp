// ============================================================================
// refresh-rankings  (Supabase Edge Function, Deno)
// ----------------------------------------------------------------------------
// Scrapes espn.com/golf/rankings (Official World Golf Ranking, top 200) and
// upserts the golfers table by ESPN athlete id. New players are inserted;
// existing players have name + world_rank refreshed. Existing aliases are
// preserved (we never clobber the legacy-spelling array).
//
// Run weekly via pg_cron so the pick dropdown stays current and new players
// appear automatically. Matching during scoring is by id, so a name change
// here never breaks historical picks.
//
// Invoke (admin or cron):
//   POST /functions/v1/refresh-rankings
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ESPN rankings page renders a table of: rank | flag(country) | name(link w/ id)
// The player link looks like /golf/player/_/id/9478/scottie-scheffler
const ROW_RE =
  /id\/(\d+)\/[^"']*"[^>]*>([^<]+)<\/a>/g; // captures (espnId, name)

async function fetchRankings(): Promise<
  { espnId: string; name: string; rank: number }[]
> {
  const res = await fetch("https://www.espn.com/golf/rankings", {
    headers: { "User-Agent": "oad-rankings/1.0" },
  });
  if (!res.ok) throw new Error(`ESPN rankings fetch failed: ${res.status}`);
  const html = await res.text();

  const out: { espnId: string; name: string; rank: number }[] = [];
  let m: RegExpExecArray | null;
  let rank = 0;
  const seen = new Set<string>();
  while ((m = ROW_RE.exec(html)) !== null) {
    const espnId = m[1];
    const name = decodeHtml(m[2]).trim();
    if (!espnId || !name || seen.has(espnId)) continue;
    seen.add(espnId);
    rank += 1;
    out.push({ espnId, name, rank });
  }
  return out;
}

function decodeHtml(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&aacute;/g, "á");
}

Deno.serve(async (_req) => {
  try {
    const db = createClient(SUPABASE_URL, SERVICE_ROLE);
    const ranks = await fetchRankings();
    if (ranks.length === 0) {
      return json({ error: "no rows parsed — ESPN markup may have changed" }, 500);
    }

    let inserted = 0, updated = 0;
    for (const r of ranks) {
      // upsert by espn_id; preserve aliases on existing rows
      const { data: existing } = await db
        .from("golfers").select("espn_id").eq("espn_id", r.espnId).maybeSingle();
      if (existing) {
        await db.from("golfers")
          .update({ name: r.name, world_rank: r.rank, active: true, updated_at: new Date().toISOString() })
          .eq("espn_id", r.espnId);
        updated += 1;
      } else {
        await db.from("golfers")
          .insert({ espn_id: r.espnId, name: r.name, world_rank: r.rank, active: true });
        inserted += 1;
      }
    }
    return json({ total: ranks.length, inserted, updated });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Weekly schedule example:
//   select cron.schedule('refresh-rankings','0 9 * * 2',  -- Tuesdays 9am UTC
//     $$ select net.http_post(
//          url := 'https://<proj>.functions.supabase.co/refresh-rankings',
//          headers := '{"Authorization":"Bearer <service_role>"}'::jsonb,
//          body := '{}'::jsonb) $$);
// ---------------------------------------------------------------------------
