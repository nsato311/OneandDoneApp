// ============================================================================
// score-tournament  (Supabase Edge Function, Deno)
// ----------------------------------------------------------------------------
// Scrapes the ESPN leaderboard HTML for one tournament, reads each golfer's
// finishing position + FedEx Cup points, and writes points onto every pick for
// that tournament. Matches picks to golfers by ESPN athlete id (never by name).
//
// LIV rule (majors only): majors put LIV players in the field on the same
// leaderboard, but ESPN may show 0/blank FedEx points for them. For a major,
// any golfer with a real finish position but missing points INHERITS the points
// that an eligible player at the SAME finishing position earned in this event.
//
// Invoke (admin only):
//   POST /functions/v1/score-tournament  { "tournament_id": "<uuid>" }
//   - reads espn_event_id + is_major from the tournament row
//   - optional body { "dry_run": true } returns the computed table w/o writing
//
// Can also run on a schedule (see cron note at bottom) to auto-score after a
// tournament finishes.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ---- ESPN leaderboard fetch -----------------------------------------------
// ESPN exposes a JSON-ish endpoint behind the leaderboard page. We use the
// public site API; if the shape changes, fall back to HTML parsing.
async function fetchLeaderboard(eventId: string) {
  const url =
    `https://site.web.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?event=${eventId}`;
  const res = await fetch(url, { headers: { "User-Agent": "oad-scorer/1.0" } });
  if (!res.ok) throw new Error(`ESPN fetch failed: ${res.status}`);
  return await res.json();
}

// Pull the competitor rows into a normalized shape:
//   { espnId, name, position (int rank for tie-grouping), posLabel ("T5"), points }
function parseCompetitors(json: any) {
  const out: {
    espnId: string;
    name: string;
    position: number | null;
    posLabel: string;
    points: number | null;
  }[] = [];

  const ev = json?.events?.[0] ?? json?.leaderboard ?? json;
  const competitions = ev?.competitions ?? json?.events?.[0]?.competitions ?? [];
  const players =
    competitions?.[0]?.competitors ?? ev?.competitors ?? [];

  for (const c of players) {
    const athlete = c.athlete ?? c.competitor?.athlete ?? {};
    const espnId = String(athlete.id ?? c.id ?? "");
    const name = athlete.displayName ?? athlete.fullName ?? c.displayName ?? "";

    // finishing position: ESPN gives a numeric rank and/or a "T5" style label
    const posLabel: string =
      c.status?.position?.displayValue ??
      c.position?.displayValue ??
      String(c.status?.position?.id ?? "");
    const position =
      c.status?.position?.id != null
        ? Number(c.status.position.id)
        : parsePosNumber(posLabel);

    // FedEx points live in the stat list; field name varies, so scan for it
    let points: number | null = null;
    const stats = c.statistics ?? c.stats ?? [];
    for (const s of stats) {
      const key = (s.name ?? s.abbreviation ?? "").toLowerCase();
      if (key.includes("cup") || key.includes("fedex") || key === "points") {
        const v = Number(s.value ?? s.displayValue);
        if (!Number.isNaN(v)) points = v;
      }
    }
    if (espnId) out.push({ espnId, name, position, posLabel, points });
  }
  return out;
}

function parsePosNumber(label: string): number | null {
  const m = String(label).match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

// ---- LIV major point-borrowing --------------------------------------------
// For majors: build a map of finishing position -> FedEx points, using the
// players who DID receive points. Then any player at that position who has
// missing/zero points inherits the position's points value.
function applyMajorBorrowing(rows: ReturnType<typeof parseCompetitors>) {
  const pointsByPos = new Map<number, number>();
  for (const r of rows) {
    if (r.position != null && r.points != null && r.points > 0) {
      // first eligible player seen at this position sets the value;
      // ties share the same value on ESPN, so this matches "what ESPN shows".
      if (!pointsByPos.has(r.position)) pointsByPos.set(r.position, r.points);
    }
  }
  for (const r of rows) {
    if ((r.points == null || r.points === 0) && r.position != null) {
      const borrowed = pointsByPos.get(r.position);
      if (borrowed != null) r.points = borrowed;
    }
  }
  return rows;
}

Deno.serve(async (req) => {
  try {
    const { tournament_id, dry_run } = await req.json();
    if (!tournament_id) {
      return json({ error: "tournament_id required" }, 400);
    }

    const db = createClient(SUPABASE_URL, SERVICE_ROLE);

    // load the tournament
    const { data: t, error: te } = await db
      .from("tournaments")
      .select("id, name, espn_event_id, is_major, season_id")
      .eq("id", tournament_id)
      .single();
    if (te || !t) return json({ error: "tournament not found" }, 404);
    if (!t.espn_event_id) {
      return json({ error: "tournament has no espn_event_id" }, 400);
    }

    // scrape + normalize
    const lb = await fetchLeaderboard(t.espn_event_id);
    let rows = parseCompetitors(lb);
    if (t.is_major) rows = applyMajorBorrowing(rows);

    // index by espn id for fast lookup
    const byId = new Map(rows.map((r) => [r.espnId, r]));

    // load all picks for this tournament
    const { data: picks, error: pe } = await db
      .from("picks")
      .select("id, golfer_espn_id, golfer_name")
      .eq("tournament_id", tournament_id);
    if (pe) return json({ error: pe.message }, 500);

    const updates: {
      id: string;
      points: number;
      finish_pos: string;
      matched: boolean;
      golfer_name: string;
    }[] = [];

    for (const p of picks ?? []) {
      const row = p.golfer_espn_id ? byId.get(p.golfer_espn_id) : undefined;
      if (row) {
        updates.push({
          id: p.id,
          points: row.points ?? 0,
          finish_pos: row.posLabel || "",
          matched: true,
          golfer_name: p.golfer_name,
        });
      } else {
        // golfer not in field (or missed cut without a points row): 0 points,
        // flagged unmatched so a commissioner can eyeball it.
        updates.push({
          id: p.id,
          points: 0,
          finish_pos: "",
          matched: false,
          golfer_name: p.golfer_name,
        });
      }
    }

    if (dry_run) {
      return json({ tournament: t.name, is_major: t.is_major, updates });
    }

    // write points
    for (const u of updates) {
      await db.from("picks")
        .update({ points: u.points, finish_pos: u.finish_pos, updated_at: new Date().toISOString() })
        .eq("id", u.id);
    }
    await db.from("tournaments").update({ scored: true }).eq("id", tournament_id);

    return json({
      tournament: t.name,
      scored: updates.length,
      unmatched: updates.filter((u) => !u.matched).length,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// SCHEDULING (optional, for true hands-off automation):
//   In Supabase, use pg_cron + pg_net to call this function a few hours after
//   each round finishes, e.g. nightly during tournament weeks:
//
//   select cron.schedule(
//     'score-active-majors', '0 6 * * 1',  -- Mondays 6am UTC
//     $$ select net.http_post(
//          url := 'https://<proj>.functions.supabase.co/score-tournament',
//          headers := '{"Authorization":"Bearer <service_role>"}'::jsonb,
//          body := json_build_object('tournament_id', t.id)::jsonb )
//        from tournaments t
//        join seasons s on s.id = t.season_id
//        where s.status='active' and t.picks_open and not t.scored $$
//   );
//
// The commissioner "Score" button in the app calls this same function with a
// specific tournament_id, so manual and automated paths share one code path.
// ---------------------------------------------------------------------------
