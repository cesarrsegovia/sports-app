// ./app/debug/api-test/page.tsx
import { getAllTeamsInLeague, getTeamLogoMap } from "@/lib/the-sports-db";

export default async function ApiTestPage() {
  const teams = await getAllTeamsInLeague();
  const logoMap = await getTeamLogoMap();

  return (
    <div className="p-8 font-mono text-sm space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold text-yellow-400">🧪 Test de API TheSportsDB</h1>
      
      <div className="bg-slate-900 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Equipos obtenidos: {teams.length}</h2>
        <h2 className="text-xl font-bold mb-2">Logos en mapa: {Object.keys(logoMap).length}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded">
          <h3 className="font-bold mb-2">Primeros 5 equipos (raw):</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(teams.slice(0, 5), null, 2)}
          </pre>
        </div>

        <div className="bg-slate-900 p-4 rounded">
          <h3 className="font-bold mb-2">Primeros 10 logos en mapa:</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(Object.entries(logoMap).slice(0, 10), null, 2)}
          </pre>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded">
        <h3 className="font-bold mb-2">Todos los equipos con logos:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teams.map((team: any) => {
            const badge = team.strTeamBadge || team.strTeamLogo || null;
            return (
              <div key={team.idTeam} className="border border-slate-700 p-2 rounded">
                {badge ? (
                  <img src={badge} alt={team.strTeam} className="w-16 h-16 object-contain mx-auto mb-2" />
                ) : (
                  <div className="w-16 h-16 bg-red-900 mx-auto mb-2 flex items-center justify-center text-xs">❌</div>
                )}
                <p className="text-xs text-center">{team.strTeam}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
