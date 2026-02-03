// ./app/debug/page.tsx
import { getActiveSports } from "@/lib/odds-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebugPage() {
  // Pedimos la lista de TODOS los deportes activos
  const sports = await getActiveSports();

  // Filtramos solo fútbol (soccer) para no llenarnos de info
  const soccerLeagues = sports.filter((s: any) => s.key.startsWith('soccer'));

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">🕵️‍♂️ The Odds API Explorer</h1>
      <p>Estas son las ligas que la API detecta como "Activas" en este momento.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {soccerLeagues.map((league: any) => (
          <Card key={league.key} className="hover:border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground">
                {league.key}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-lg">{league.title}</p>
              <p className="text-xs text-muted-foreground">{league.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-slate-950 text-slate-50 p-4 rounded overflow-auto h-64">
        <pre>{JSON.stringify(soccerLeagues, null, 2)}</pre>
      </div>
    </div>
  );
}