// ./lib/football-data.ts

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = "https://api.football-data.org/v4";

// IDs oficiales de Football-Data.org
export const COMPETITION_IDS = {
  PREMIER_LEAGUE: "PL",
  LA_LIGA: "PD", // Primera Division
  SERIE_A: "SA",
  CHAMPIONS_LEAGUE: "CL",
  // Argentina no está en el tier gratuito standard, pero Europa va perfecto.
};

export async function getStandingsFD(competitionCode: string) {
  const res = await fetch(`${API_URL}/competitions/${competitionCode}/standings`, {
    headers: {
      "X-Auth-Token": API_KEY || "",
    },
    next: { revalidate: 3600 }, // Cachear 1 hora (las tablas no cambian tan rápido)
  });

  if (!res.ok) {
    console.error("Error Football-Data:", res.statusText);
    return null;
  }

  const data = await res.json();
  return data.standings?.[0]?.table || [];
}