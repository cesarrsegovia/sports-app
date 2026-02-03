// ./lib/the-sports-db.ts

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
const ARGENTINA_ID = "4406"; 

export async function getLeagueDetails() {
  try {
    const res = await fetch(`${BASE_URL}/lookupleague.php?id=${ARGENTINA_ID}`);
    const data = await res.json();
    return data.leagues?.[0];
  } catch (error) { return null; }
}

/**
 * Obtiene todos los equipos de la liga argentina
 * Esto es más eficiente que buscar equipo por equipo
 */
export async function getAllTeamsInLeague() {
  try {
    // Intentamos con idLeague primero (formato más común)
    let url = `${BASE_URL}/lookup_all_teams.php?idLeague=${ARGENTINA_ID}`;
    let res = await fetch(url, {
      next: { revalidate: 86400 } // Cache por 24 horas
    });
    
    let data = await res.json();
    
    // Verificar si hay un error en la respuesta
    if (data.teams && Array.isArray(data.teams) && data.teams.length > 0 && typeof data.teams[0] === 'string') {
      // Si el primer elemento es un string, probablemente es un mensaje de error
      if (data.teams[0].includes('Invalid') || data.teams[0].includes('error')) {
        console.warn(`⚠️ Error de la API: ${data.teams[0]}. El endpoint lookup_all_teams.php no está disponible para esta liga.`);
        return [];
      }
    }
    
    // Aseguramos que teams sea siempre un array
    let teams = Array.isArray(data.teams) ? data.teams : (data.teams ? [data.teams] : []);
    
    // Si no funcionó con idLeague, intentamos con id
    if (teams.length === 0 || (teams.length === 1 && typeof teams[0] === 'string')) {
      console.log("⚠️ Intentando con parámetro 'id' en lugar de 'idLeague'...");
      url = `${BASE_URL}/lookup_all_teams.php?id=${ARGENTINA_ID}`;
      res = await fetch(url, {
        next: { revalidate: 86400 }
      });
      
      if (res.ok) {
        data = await res.json();
        // Verificar si hay un error
        if (data.teams && Array.isArray(data.teams) && data.teams.length > 0 && typeof data.teams[0] === 'string') {
          if (data.teams[0].includes('Invalid') || data.teams[0].includes('error')) {
            console.warn(`⚠️ Error de la API con parámetro 'id': ${data.teams[0]}`);
            return [];
          }
        }
        // Aseguramos que teams sea siempre un array
        teams = Array.isArray(data.teams) ? data.teams : (data.teams ? [data.teams] : []);
      }
    }
    
    // Filtrar mensajes de error
    teams = teams.filter((team: any) => typeof team === 'object' && team !== null);
    
    // Validación final: asegurar que es un array
    if (!Array.isArray(teams)) {
      console.warn("⚠️ La respuesta de la API no es un array. Convirtiendo...");
      teams = [];
    }
    
    if (teams.length === 0) {
      console.warn(`⚠️ No se encontraron equipos con el ID ${ARGENTINA_ID}. Usando solo logos de eventos.`);
    } else {
      console.log(`✅ Obtenidos ${teams.length} equipos de la liga ${ARGENTINA_ID}`);
    }
    
    return teams;
  } catch (error) {
    console.error("Error obteniendo equipos de la liga:", error);
    return [];
  }
}

/**
 * Extrae logos de equipos desde los eventos (fuente alternativa)
 */
export async function getTeamLogosFromEvents(): Promise<Record<string, string>> {
  try {
    const { past, upcoming } = await getSeasonEvents();
    const allEvents = [...past, ...upcoming];
    const logoMap: Record<string, string> = {};
    
    // Mapa de nombres comunes que pueden variar
    const nameVariations: Record<string, string[]> = {
      "Central Córdoba": ["Central Córdoba de Santiago del Estero", "Central Cordoba"],
      "Huracán": ["Atlético Huracán", "Atletico Huracan", "CA Huracán"],
      "Unión": ["Unión de Santa Fe", "Union Santa Fe", "Union"],
      "Sarmiento": ["Sarmiento de Junín", "Sarmiento de Junin"],
      "Lanús": ["Lanus"],
      "Vélez Sarsfield": ["Velez Sarsfield"],
      "Talleres de Córdoba": ["Talleres", "Talleres de Cordoba"],
      "Gimnasia y Esgrima de La Plata": ["Gimnasia y Esgrima La Plata", "Gimnasia La Plata"],
      "Gimnasia y Esgrima de Mendoza": ["Gimnasia y Esgrima Mendoza", "Gimnasia Mendoza"],
      "Estudiantes de La Plata": ["Estudiantes"],
      "Belgrano": ["Belgrano de Cordoba", "Belgrano de Córdoba"],
      "Instituto": ["Instituto de Córdoba", "Instituto de Cordoba"]
    };
    
    allEvents.forEach((event: any) => {
      // Los eventos tienen strHomeTeamBadge y strAwayTeamBadge
      if (event.strHomeTeam && event.strHomeTeamBadge) {
        const teamName = event.strHomeTeam;
        const badge = event.strHomeTeamBadge;
        
        // Guardamos con el nombre exacto
        logoMap[teamName] = badge;
        logoMap[teamName.toLowerCase()] = badge;
        logoMap[cleanName(teamName)] = badge;
        
        // Agregamos variaciones comunes - buscamos coincidencias más flexibles
        Object.keys(nameVariations).forEach(key => {
          // Verificamos si el nombre del equipo coincide con la clave o alguna variación
          const teamNameLower = teamName.toLowerCase();
          const keyLower = key.toLowerCase();
          
          // Coincidencia directa o parcial
          if (teamNameLower === keyLower || 
              teamNameLower.includes(keyLower) || 
              keyLower.includes(teamNameLower) ||
              nameVariations[key].some(v => {
                const vLower = v.toLowerCase();
                return teamNameLower === vLower || teamNameLower.includes(vLower) || vLower.includes(teamNameLower);
              })) {
            // Guardamos todas las variaciones
            nameVariations[key].forEach(variation => {
              logoMap[variation] = badge;
              logoMap[variation.toLowerCase()] = badge;
              logoMap[cleanName(variation)] = badge;
            });
            logoMap[key] = badge;
            logoMap[key.toLowerCase()] = badge;
            logoMap[cleanName(key)] = badge;
          }
        });
      }
      
      if (event.strAwayTeam && event.strAwayTeamBadge) {
        const teamName = event.strAwayTeam;
        const badge = event.strAwayTeamBadge;
        
        // Guardamos con el nombre exacto
        logoMap[teamName] = badge;
        logoMap[teamName.toLowerCase()] = badge;
        logoMap[cleanName(teamName)] = badge;
        
        // Agregamos variaciones comunes - buscamos coincidencias más flexibles
        Object.keys(nameVariations).forEach(key => {
          // Verificamos si el nombre del equipo coincide con la clave o alguna variación
          const teamNameLower = teamName.toLowerCase();
          const keyLower = key.toLowerCase();
          
          // Coincidencia directa o parcial
          if (teamNameLower === keyLower || 
              teamNameLower.includes(keyLower) || 
              keyLower.includes(teamNameLower) ||
              nameVariations[key].some(v => {
                const vLower = v.toLowerCase();
                return teamNameLower === vLower || teamNameLower.includes(vLower) || vLower.includes(teamNameLower);
              })) {
            // Guardamos todas las variaciones
            nameVariations[key].forEach(variation => {
              logoMap[variation] = badge;
              logoMap[variation.toLowerCase()] = badge;
              logoMap[cleanName(variation)] = badge;
            });
            logoMap[key] = badge;
            logoMap[key.toLowerCase()] = badge;
            logoMap[cleanName(key)] = badge;
          }
        });
      }
    });
    
    if (Object.keys(logoMap).length > 0) {
      console.log(`✅ Extraídos ${Object.keys(logoMap).length} logos desde eventos`);
    }
    
    return logoMap;
  } catch (error) {
    console.error("Error extrayendo logos de eventos:", error);
    return {};
  }
}

/**
 * Función auxiliar para limpiar nombres (igual que en hybrid-soccer.ts)
 */
function cleanName(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}

/**
 * Crea un mapa de nombres de equipos a logos usando todos los equipos de la liga
 * También intenta obtener logos desde los eventos como fuente alternativa
 */
export async function getTeamLogoMap(): Promise<Record<string, string>> {
  try {
    const logoMap: Record<string, string> = {};
    
    // PRIMERO: Intentamos obtener logos desde los eventos (más confiable)
    console.log("📡 Obteniendo logos desde eventos...");
    const eventLogos = await getTeamLogosFromEvents();
    Object.assign(logoMap, eventLogos);
    
    // SEGUNDO: Intentamos obtener logos desde los equipos de la liga (complemento)
    try {
      const teams = await getAllTeamsInLeague();
      
      // Validación: asegurar que teams es un array
      if (Array.isArray(teams) && teams.length > 0) {
        teams.forEach((team: any) => {
          // Intentamos obtener el badge primero, luego el logo
          const badge = team.strTeamBadge || team.strTeamLogo || null;
          if (badge && team.strTeam) {
            const teamName = team.strTeam;
            
            // Solo agregamos si no existe ya (los eventos tienen prioridad)
            if (!logoMap[teamName]) {
              logoMap[teamName] = badge;
            }
            
            // Guardamos variaciones del nombre
            logoMap[teamName.toLowerCase()] = badge;
            const clean = cleanName(teamName);
            logoMap[clean] = badge;
            
            // También guardamos variaciones comunes del nombre
            if (team.strAlternate) {
              if (!logoMap[team.strAlternate]) {
                logoMap[team.strAlternate] = badge;
              }
              logoMap[team.strAlternate.toLowerCase()] = badge;
              logoMap[cleanName(team.strAlternate)] = badge;
            }
            
            // Nombre corto si existe
            if (team.strTeamShort) {
              if (!logoMap[team.strTeamShort]) {
                logoMap[team.strTeamShort] = badge;
              }
              logoMap[team.strTeamShort.toLowerCase()] = badge;
            }
          }
        });
      }
    } catch (error) {
      console.warn("⚠️ Error obteniendo equipos de la liga, usando solo eventos:", error);
    }
    
    console.log(`📋 Mapa de logos creado con ${Object.keys(logoMap).length} entradas`);
    return logoMap;
  } catch (error) {
    console.error("Error creando mapa de logos:", error);
    return {};
  }
}

/**
 * BUSCADOR INDIVIDUAL (Fallback si el mapa no funciona)
 * Busca un equipo por su nombre específico.
 */
export async function getTeamLogoByName(teamName: string) {
  try {
    // Encodeamos el nombre para que espacios y tildes no rompan la URL
    // Ej: "Atlético Tucumán" -> "Atl%C3%A9tico%20Tucum%C3%A1n"
    const url = `${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`;
    
    const res = await fetch(url, { 
      next: { revalidate: 86400 } // Guardamos en caché por 24 horas
    });
    
    if (!res.ok) return null;

    const data = await res.json();
    // Intentamos obtener el badge primero, si no está, usamos el logo
    return data.teams?.[0]?.strTeamBadge || data.teams?.[0]?.strTeamLogo || null;
  } catch (error) {
    console.error(`Error buscando logo para ${teamName}:`, error);
    return null;
  }
}

// (Esta función de calendario funciona bien, la dejamos igual)
export async function getSeasonEvents() {
  try {
    const [res2025, res2026] = await Promise.all([
      fetch(`${BASE_URL}/eventsseason.php?id=${ARGENTINA_ID}&s=2025`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/eventsseason.php?id=${ARGENTINA_ID}&s=2026`, { cache: 'no-store' })
    ]);

    const data2025 = await res2025.json();
    const data2026 = await res2026.json();

    const events2025 = data2025.events || [];
    const events2026 = data2026.events || [];
    let allEvents = [...events2025, ...events2026];

    const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.idEvent, item])).values());
    const today = new Date(); 
    const tournamentStartDate = new Date('2026-01-01');

    const currentTournamentEvents = uniqueEvents.filter((e: any) => {
      const eventDate = new Date(e.dateEvent);
      return eventDate >= tournamentStartDate;
    });

    const past = currentTournamentEvents.filter((e: any) => {
      const eventDate = new Date(e.dateEvent + "T" + (e.strTime || "00:00:00"));
      return eventDate < today && e.intHomeScore !== null;
    }).sort((a: any, b: any) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime());

    const upcoming = currentTournamentEvents.filter((e: any) => {
      const eventDate = new Date(e.dateEvent + "T" + (e.strTime || "00:00:00"));
      return eventDate >= today;
    }).sort((a: any, b: any) => new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime());

    return { past, upcoming };

  } catch (error) {
    return { past: [], upcoming: [] };
  }
}