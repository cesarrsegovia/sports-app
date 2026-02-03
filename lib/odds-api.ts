// ./lib/odds-api.ts

const API_KEY = process.env.THE_ODDS_API_KEY;
const API_URL = "https://api.the-odds-api.com/v4";

// MAPA OFICIAL DE LIGAS (Confirmado con tu explorador)
export const LEAGUE_KEYS = [
  { key: 'soccer_argentina_primera_division', name: 'Liga Profesional', country: 'Argentina' },
  { key: 'soccer_spain_la_liga', name: 'La Liga', country: 'Spain' },
  { key: 'soccer_epl', name: 'Premier League', country: 'England' },
  { key: 'soccer_italy_serie_a', name: 'Serie A', country: 'Italy' }, // Asumimos este estándar
  { key: 'soccer_uefa_champs_league', name: 'Champions League', country: 'Europe' }
];

async function fetchOddsApi(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_URL}${endpoint}`);
  url.searchParams.append('apiKey', API_KEY || '');
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const res = await fetch(url.toString(), {
    // Revalidamos cada 10 minutos para cuidar tu cuota gratuita
    next: { revalidate: 600 } 
  });

  if (!res.ok) throw new Error(`Error Odds API: ${res.statusText}`);
  return res.json();
}

/**
 * Obtiene partidos EN VIVO o FINALIZADOS recientemente (últimos 2 días)
 * y los próximos para hoy.
 */
export async function getMatchesByLeague(sportKey: string) {
  // daysFrom: 1 busca eventos de ayer y hoy
  return await fetchOddsApi(`/sports/${sportKey}/scores`, {
    daysFrom: "1",
    dateFormat: "iso"
  });
}

/**
 * Función auxiliar para obtener el marcador de un equipo
 * La API devuelve: scores: [{name: "Team A", score: "1"}, {name: "Team B", score: "0"}]
 */
export function getScore(scores: any[] | null, teamName: string) {
  if (!scores) return null;
  const teamScore = scores.find((s: any) => s.name === teamName);
  return teamScore ? teamScore.score : 0;
}