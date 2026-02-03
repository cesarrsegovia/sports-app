// ./lib/football.ts

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_FOOTBALL_API_URL;

async function fetchFootballApi(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_URL}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY || '',
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    next: { revalidate: 60 } 
  });

  if (!response.ok) {
    throw new Error('Error API');
  }

  return response.json();
}

/**
 * LÓGICA CORREGIDA SEGÚN EL DEBUGGER:
 * - Europa (Premier, etc): Si estamos en Feb 2026, la temporada es 2025.
 * - Argentina (128): Si estamos en Feb 2026, la temporada es 2026.
 */
export function getCurrentSeason(leagueId: number): number {
  const now = new Date();
  const year = now.getFullYear(); // 2026
  const month = now.getMonth() + 1; // 2 (Febrero)

  // IDs de Ligas Europeas (Premier: 39, La Liga: 140, Serie A: 135)
  if ([39, 140, 135].includes(leagueId)) {
    // Si estamos en la primera mitad del año (Ene-Jun), restamos 1.
    return month < 7 ? year - 1 : year;
  }

  // Para Argentina (128) y resto del mundo, usamos el año calendario actual.
  return year;
}

export async function getStandings(leagueId: number, season: number) {
  const data = await fetchFootballApi('/standings', { 
    league: leagueId.toString(), 
    season: season.toString() 
  });
  
  // Devolvemos los grupos (o array vacío si no hay datos)
  return data.response[0]?.league?.standings || [];
}

export async function getRecentMatches(leagueId: number, last: number = 10) {
  const data = await fetchFootballApi('/fixtures', { 
    league: leagueId.toString(), 
    last: last.toString(),
    status: 'FT' // Finalizados
  });
  return data.response;
}

export async function getMatchesByDate(date: string) {
  const data = await fetchFootballApi('/fixtures', { 
    date: date 
  });
  return data.response;
}