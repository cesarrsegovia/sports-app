// ./lib/the-sports-db.ts

// La Key '3' es la clave pública de prueba de TheSportsDB.
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

// ID de la Liga Argentina en TheSportsDB
const ARGENTINA_LEAGUE_ID = "4764"; 

export async function getArgentinaStandings() {
  try {
    // Pedimos la temporada 2026 (o la actual)
    // lookuptable.php?l=4351&s=2026
    const res = await fetch(`${BASE_URL}/lookuptable.php?l=${ARGENTINA_LEAGUE_ID}&s=2026`, {
      next: { revalidate: 3600 } // Cache de 1 hora
    });

    if (!res.ok) throw new Error("Error fetching TSDB");

    const data = await res.json();
    const table = data.table;

    if (!table) return [];

    // 🔄 MAGIA: Transformamos los datos al formato de Football-Data.org
    // Para que tu tabla actual funcione sin cambios.
    return table.map((team: any) => ({
      position: team.intRank,
      team: {
        id: team.idTeam,
        name: team.strTeam,
        crest: team.strTeamBadge, // Mapeamos el logo aquí
      },
      playedGames: team.intPlayed,
      goalDifference: team.intGoalDifference,
      points: team.intPoints
    }));

  } catch (error) {
    console.error("Error obteniendo tabla Argentina:", error);
    return [];
  }
}