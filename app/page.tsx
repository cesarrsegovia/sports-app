// ./app/page.tsx
import { LEAGUE_KEYS, getMatchesByLeague, getScore } from "@/lib/odds-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  // 1. Pedimos los partidos de TODAS las ligas en paralelo
  const promises = LEAGUE_KEYS.map(league => 
    getMatchesByLeague(league.key)
      .then(matches => ({ ...league, matches })) // Añadimos info de la liga a los partidos
      .catch(() => ({ ...league, matches: [] })) // Si falla una, no rompemos toda la app
  );

  const leaguesData = await Promise.all(promises);

  // 2. Aplanamos todo en una sola lista de partidos
  const allMatches = leaguesData.flatMap(league => 
    league.matches.map((match: any) => ({ ...match, leagueName: league.name }))
  );

  // 3. Ordenamos: Primero los que están jugándose (comenzaron hace poco), luego los futuros
  allMatches.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Partidos Destacados</h1>
        <p className="text-muted-foreground">
          Resultados en vivo y próximos encuentros (Argentina, Premier, La Liga).
        </p>
      </div>

      {allMatches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allMatches.map((match: any) => {
            const isFinished = match.completed;
            const startTime = new Date(match.commence_time);
            // Si el partido ya empezó pero no terminó, asumimos "En Vivo" (lógica simple)
            const isLive = !isFinished && startTime < new Date(); 

            // Extraemos goles usando nuestra función auxiliar
            const homeScore = getScore(match.scores, match.home_team);
            const awayScore = getScore(match.scores, match.away_team);

            return (
              <Card key={match.id} className="overflow-hidden hover:border-blue-500/50 transition-all">
                {/* Cabecera */}
                <div className="bg-muted/40 p-3 flex justify-between items-center border-b text-xs font-medium">
                  <span className="text-blue-400 font-bold">{match.leagueName}</span>
                  {isFinished ? (
                    <Badge variant="secondary">Finalizado</Badge>
                  ) : isLive ? (
                    <Badge variant="destructive" className="animate-pulse">En Juego</Badge>
                  ) : (
                    <Badge variant="outline">
                      {startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Local */}
                    <div className="flex-1 text-right">
                      <span className="font-semibold block text-sm">{match.home_team}</span>
                    </div>

                    {/* Marcador */}
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-md font-mono font-bold text-lg min-w-[60px] text-center">
                      {isLive || isFinished ? (
                        `${homeScore ?? 0} - ${awayScore ?? 0}`
                      ) : (
                        "VS"
                      )}
                    </div>

                    {/* Visitante */}
                    <div className="flex-1 text-left">
                      <span className="font-semibold block text-sm">{match.away_team}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/10">
          <p className="text-2xl">😴</p>
          <p className="mt-2 font-medium">No hay partidos ahora mismo</p>
          <p className="text-sm text-muted-foreground">Vuelve más tarde para ver la acción.</p>
        </div>
      )}
    </div>
  );
}