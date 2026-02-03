// ./lib/hybrid-soccer.ts
import { getMatchesByLeague, getScore } from "./odds-api";
import { getLeagueDetails, getTeamLogoMap, getTeamLogoByName } from "./the-sports-db";

const TEAM_NAME_FIXES: Record<string, string> = {
  "Aldosivi Mar del Plata": "Aldosivi",
  "Argentinos Juniors": "Argentinos Juniors",
  "Atl. Tucuman": "Atlético Tucumán",
  "Atletico Tucuman": "Atlético Tucumán",
  "Banfield": "Banfield",
  "Barracas Central": "Barracas Central",
  "Belgrano de Cordoba": "Belgrano",
  "Belgrano": "Belgrano",
  "Boca Juniors": "Boca Juniors",
  "CA Tigre BA": "Tigre",
  "Tigre": "Tigre",
  "Central Cordoba": "Central Córdoba",
  "Central Córdoba": "Central Córdoba",
  "Central Córdoba SdE": "Central Córdoba",
  "Central Córdoba de Santiago del Estero": "Central Córdoba",
  "Defensa y Justicia": "Defensa y Justicia",
  "Deportivo Riestra": "Deportivo Riestra",
  "Estudiantes": "Estudiantes de La Plata",
  "Estudiantes de La Plata": "Estudiantes de La Plata",
  "Gimnasia La Plata": "Gimnasia y Esgrima de La Plata",
  "Gimnasia y Esgrima La Plata": "Gimnasia y Esgrima de La Plata",
  "Gimnasia Mendoza": "Gimnasia y Esgrima de Mendoza",
  "Gimnasia y Esgrima Mendoza": "Gimnasia y Esgrima de Mendoza",
  "Godoy Cruz": "Godoy Cruz",
  "Huracan": "Huracán",
  "Huracán": "Huracán",
  "Atletico Huracan": "Huracán",
  "Atlético Huracán": "Huracán",
  "CA Huracán": "Huracán",
  "Independiente": "Independiente",
  "Independiente Rivadavia": "Independiente Rivadavia",
  "Instituto": "Instituto",
  "Instituto de Córdoba": "Instituto",
  "Lanus": "Lanús",
  "Lanús": "Lanús",
  "Newells Old Boys": "Newell's Old Boys",
  "Newell's Old Boys": "Newell's Old Boys",
  "Platense": "Platense",
  "Racing Club": "Racing Club",
  "River Plate": "River Plate",
  "Rosario Central": "Rosario Central",
  "San Lorenzo": "San Lorenzo",
  "Sarmiento": "Sarmiento",
  "Sarmiento de Junin": "Sarmiento",
  "Sarmiento de Junín": "Sarmiento",
  "Talleres": "Talleres de Córdoba",
  "Talleres de Cordoba": "Talleres de Córdoba",
  "Talleres de Córdoba": "Talleres de Córdoba",
  "Union Santa Fe": "Unión",
  "Union": "Unión",
  "Unión": "Unión",
  "Unión de Santa Fe": "Unión",
  "Velez Sarsfield": "Vélez Sarsfield",
  "Vélez Sarsfield": "Vélez Sarsfield",
  "Velez Sarsfield BA": "Vélez Sarsfield"
};

// Limpiador de nombres para búsquedas flexibles
function cleanName(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}

export async function getArgentineData() {
  console.log("🚀 Iniciando Motor Híbrido...");

  // 1. Pedimos Partidos, Liga y Mapa de Logos
  const [matches, leagueInfo, teamLogoMap] = await Promise.all([
    getMatchesByLeague('soccer_argentina_primera_division'),
    getLeagueDetails(),
    getTeamLogoMap() // Obtenemos todos los logos de una vez
  ]);

  console.log(`📊 Obtenidos ${Object.keys(teamLogoMap).length} logos de equipos de la liga`);

  // 2. Identificar nombres únicos de equipos
  const uniqueTeamNames = new Set<string>();
  matches.forEach((m: any) => {
    // Aplicamos el diccionario primero
    const home = TEAM_NAME_FIXES[m.home_team] || m.home_team;
    const away = TEAM_NAME_FIXES[m.away_team] || m.away_team;
    uniqueTeamNames.add(home);
    uniqueTeamNames.add(away);
  });

  // 3. Buscar logos faltantes usando búsqueda individual (fallback)
  const logoMap: Record<string, string> = { ...teamLogoMap };
  const teamsArray = Array.from(uniqueTeamNames);
  
  // Solo buscamos los que no encontramos en el mapa inicial
  const missingTeams = teamsArray.filter(name => {
    const fixedName = TEAM_NAME_FIXES[name] || name;
    // Verificamos múltiples variaciones
    return !logoMap[fixedName] 
      && !logoMap[cleanName(fixedName)]
      && !logoMap[fixedName.toLowerCase()]
      && !logoMap[name]
      && !logoMap[cleanName(name)];
  });

  if (missingTeams.length > 0) {
    console.log(`🔍 Buscando logos faltantes para ${missingTeams.length} equipos...`);
    for (const name of missingTeams) {
      const fixedName = TEAM_NAME_FIXES[name] || name;
      
      // Intentamos buscar con el nombre corregido
      let logoUrl = await getTeamLogoByName(fixedName);
      
      // Si no encontramos, intentamos con el nombre original
      if (!logoUrl) {
        logoUrl = await getTeamLogoByName(name);
      }
      
      // Si encontramos el logo, lo guardamos con todas las variaciones
      if (logoUrl) {
        logoMap[fixedName] = logoUrl;
        logoMap[name] = logoUrl;
        logoMap[fixedName.toLowerCase()] = logoUrl;
        logoMap[name.toLowerCase()] = logoUrl;
        logoMap[cleanName(fixedName)] = logoUrl;
        logoMap[cleanName(name)] = logoUrl;
      }
    }
  }

  // 4. Mapear resultados a los partidos
  const now = new Date(); // Fecha/hora actual para determinar partidos en vivo
  
  const processedMatches = matches.map((match: any) => {
    // Nombre corregido por diccionario
    const homeNameFixed = TEAM_NAME_FIXES[match.home_team] || match.home_team;
    const awayNameFixed = TEAM_NAME_FIXES[match.away_team] || match.away_team;

    // Función auxiliar para buscar logo con múltiples estrategias
    const findLogo = (fixedName: string, originalName: string): string | null => {
      // Lista de variaciones a intentar
      const variations = [
        fixedName,
        originalName,
        fixedName.toLowerCase(),
        originalName.toLowerCase(),
        cleanName(fixedName),
        cleanName(originalName),
        // Variaciones con "de"
        fixedName.replace(" y Esgrima ", " y Esgrima de "),
        fixedName.replace(" y Esgrima de ", " y Esgrima "),
        originalName.replace(" y Esgrima ", " y Esgrima de "),
        originalName.replace(" y Esgrima de ", " y Esgrima "),
        // Para Talleres
        originalName === "Talleres" ? "Talleres de Córdoba" : null,
        // Para Central Córdoba
        fixedName.includes("Central Córdoba") ? `${fixedName} de Santiago del Estero` : null,
        originalName.includes("Central Córdoba") ? `${originalName} de Santiago del Estero` : null,
      ].filter(Boolean) as string[];
      
      for (const variation of variations) {
        if (logoMap[variation]) {
          return logoMap[variation];
        }
      }
      
      return null;
    };
    
    const homeLogo = findLogo(homeNameFixed, match.home_team);
    const awayLogo = findLogo(awayNameFixed, match.away_team);

    // Log para debugging si no encontramos logo
    if (!homeLogo) {
      console.warn(`❌ Logo no encontrado para equipo local: ${match.home_team} (corregido: ${homeNameFixed})`);
    }
    if (!awayLogo) {
      console.warn(`❌ Logo no encontrado para equipo visitante: ${match.away_team} (corregido: ${awayNameFixed})`);
    }

    const matchDate = new Date(match.commence_time);
    const hasScore = match.scores && match.scores.length > 0;
    const isCompleted = match.completed || false;
    
    // Un partido está en vivo si:
    // - Tiene score (marcador)
    // - No está completado
    // - La fecha/hora ya pasó
    // - Y comenzó en las últimas 2.5 horas (90 min de partido + tiempo adicional + margen)
    const timeSinceStart = now.getTime() - matchDate.getTime();
    const twoAndHalfHours = 2.5 * 60 * 60 * 1000;
    const isLive = hasScore && !isCompleted && matchDate <= now && timeSinceStart >= 0 && timeSinceStart < twoAndHalfHours;

    return {
      id: match.id,
      date: match.commence_time,
      status: isCompleted ? "Finished" : (isLive ? "Live" : "Upcoming"),
      isLive: isLive,
      
      // Usamos el nombre corregido para mostrar, pero guardamos el original también
      homeTeam: homeNameFixed,
      homeScore: getScore(match.scores, match.home_team),
      homeLogo: homeLogo,
      
      awayTeam: awayNameFixed,
      awayScore: getScore(match.scores, match.away_team),
      awayLogo: awayLogo
    };
  });

  // PRÓXIMOS: Partidos que aún no han comenzado
  const upcoming = processedMatches
    .filter((m: any) => !m.isLive && new Date(m.date) > now && m.status !== "Finished")
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // RESULTADOS RECIENTES: Partidos finalizados, en vivo, o que ya comenzaron hoy
  const past = processedMatches
    .filter((m: any) => {
      const matchDate = new Date(m.date);
      const isToday = matchDate.toDateString() === now.toDateString();
      
      // Incluimos:
      // 1. Partidos finalizados
      // 2. Partidos en vivo
      // 3. Partidos de hoy que ya comenzaron (tienen score o la hora ya pasó)
      return m.status === "Finished" || 
             m.isLive || 
             (isToday && (matchDate <= now || m.homeScore !== null));
    })
    .sort((a: any, b: any) => {
      // Priorizamos partidos en vivo primero
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      // Luego por fecha (más recientes primero)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return { league: leagueInfo, upcoming, past };
}