// ./app/debug/logos/page.tsx
import { getMatchesByLeague } from "@/lib/odds-api";
import { getTeamLogoMap } from "@/lib/the-sports-db";

export default async function LogoDebugPage() {
  // 1. Pedimos los datos crudos
  const matches = await getMatchesByLeague('soccer_argentina_primera_division');
  const logos = await getTeamLogoMap();
  
  // 2. Extraemos los nombres únicos de los partidos (Odds API)
  const oddsNames = Array.from(new Set(matches.flatMap((m: any) => [m.home_team, m.away_team]))).sort();
  
  // 3. Extraemos los nombres disponibles en la base de datos de logos (TheSportsDB)
  const dbNames = Object.keys(logos).sort();

  return (
    <div className="p-8 font-mono text-sm space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold text-yellow-400">🕵️‍♂️ Detective de Logos</h1>
      <p>Compara las dos listas. Si los nombres no son idénticos, no habrá logo.</p>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: LO QUE NECESITAMOS (Odds API) */}
        <div className="border border-red-800 p-4 rounded bg-red-950/20">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            Nombres en Partidos ({oddsNames.length})
          </h2>
          <ul className="space-y-1">
            {oddsNames.map(name => (
              <li key={name} className="flex justify-between items-center border-b border-red-900/50 pb-1">
                <span>{name}</span>
                {/* Check visual si encontramos coincidencia directa */}
                {logos[name] ? (
                  <span className="text-green-500">✅ OK</span>
                ) : (
                  <span className="text-red-500 font-bold">❌ Faltante</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMNA 2: LO QUE TENEMOS (TheSportsDB) */}
        <div className="border border-green-800 p-4 rounded bg-green-950/20">
          <h2 className="text-xl font-bold mb-4 text-green-400">
            Logos Disponibles ({dbNames.length})
          </h2>
          {dbNames.length === 0 ? (
            <div className="p-4 bg-red-900/50 text-white font-bold rounded animate-pulse">
              ⚠️ ¡ALERTA! La lista de logos está vacía.
              <br/>
              Revisa lib/the-sports-db.ts y el ID 4406.
            </div>
          ) : (
            <ul className="space-y-1 h-screen overflow-y-auto">
              {dbNames.map(name => (
                <li key={name} className="flex items-center gap-2 border-b border-green-900/50 pb-1">
                  <img src={logos[name]} className="w-6 h-6 object-contain" alt="logo" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
      
      <div className="bg-slate-900 p-4 rounded mt-8">
        <h3 className="font-bold mb-2">JSON Raw (Primeros 3):</h3>
        <pre className="text-xs text-muted-foreground">
          {JSON.stringify({ logos_sample: dbNames.slice(0,3) }, null, 2)}
        </pre>
      </div>
    </div>
  );
}