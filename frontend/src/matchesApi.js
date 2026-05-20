/**
 * Fetches upcoming football matches for the match picker.
 * Uses TheSportsDB when possible; falls back to curated demo data.
 */

const FALLBACK_MATCHES = [
  {
    id: "demo-1",
    name: "Brazil vs Argentina",
    league: "International Friendly",
    kickoff: null,
  },
  {
    id: "demo-2",
    name: "France vs Germany",
    league: "UEFA Nations League",
    kickoff: null,
  },
  {
    id: "demo-3",
    name: "Spain vs Italy",
    league: "UEFA Nations League",
    kickoff: null,
  },
  {
    id: "demo-4",
    name: "England vs Netherlands",
    league: "International Friendly",
    kickoff: null,
  },
];

const normalizeEvent = (ev) => {
  const home = ev.strHomeTeam || ev.strEventHome || "";
  const away = ev.strAwayTeam || ev.strEventAway || "";
  const name =
    home && away
      ? `${home} vs ${away}`
      : ev.strEvent || ev.strFilename || "Match";
  return {
    id: String(ev.idEvent || ev.idAPIfootball || `${name}-${ev.dateEvent}`),
    name,
    league: ev.strLeague || ev.strCompetition || "Football",
    kickoff: ev.strTimestamp || ev.dateEvent || null,
  };
};

export async function fetchUpcomingMatches() {
  const apiKey = process.env.REACT_APP_SPORTSDB_API_KEY || "3";
  const leagueId =
    process.env.REACT_APP_SPORTSDB_LEAGUE_ID || "4328";

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${leagueId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const events = data?.events;
    if (Array.isArray(events) && events.length > 0) {
      return events.map(normalizeEvent);
    }
  } catch (e) {
    console.warn("matchesApi: live fetch failed, using fallback", e);
  }

  return FALLBACK_MATCHES.map((m) => ({
    ...m,
    kickoff: m.kickoff || new Date().toISOString(),
  }));
}
