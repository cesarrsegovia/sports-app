// ./app/debug/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDebugData() {
  const BASE = "https://www.thesportsdb.com/api/v1/json/3";
  const ID_ARG = "4406"; // Primera División

  // 1. Preguntamos: ¿Qué temporadas tienes guardadas para Argentina?
  const seasonsRes = await fetch(`${BASE}/search_all_seasons.php?id=${ID_ARG}`);
  const seasonsData = await seasonsRes.json();

  // 2. Preguntamos: Dame los próximos 5 partidos de BOCA JUNIORS (ID 133602)
  // Esto prueba si la API por equipo funciona mejor que la de liga.
  const bocaRes = await fetch(`${BASE}/eventsnext.php?id=133602`);
  const bocaData = await bocaRes.json();

  // 3. Preguntamos: Dame los últimos 5 resultados de RIVER PLATE (ID 133604)
  const riverRes = await fetch(`${BASE}/eventslast.php?id=133604`);
  const riverData = await riverRes.json();

  return { 
    seasons: seasonsData.seasons, 
    bocaUpcoming: bocaData.events,
    riverPast: riverData.results 
  };
}

export default async function DebugPage() {
  const data = await getDebugData();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-blue-500">🔬 Laboratorio de Datos</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* COLUMNA 1: ¿CÓMO SE LLAMAN LAS TEMPORADAS? */}
        <Card>
          <CardHeader><CardTitle>Temporadas Disponibles (ID 4406)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Aquí veremos cómo nombra la API a la temporada actual. ¿Es "2026"? ¿"2025-2026"?
            </p>
            <div className="h-64 overflow-auto bg-slate-950 text-green-400 p-4 rounded text-xs font-mono">
              <pre>{JSON.stringify(data.seasons, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA 2: PRUEBA POR EQUIPOS */}
        <Card>
          <CardHeader><CardTitle>Prueba Individual: Boca y River</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Si la lista general falla, ¿funcionan las listas individuales?
            </p>
            
            <div className="space-y-4">
              <div className="border p-2 rounded">
                <span className="font-bold text-yellow-600">Boca (Próximos):</span>
                <pre className="text-xs mt-1">{data.bocaUpcoming ? JSON.stringify(data.bocaUpcoming[0], null, 2) : "Null / Vacío"}</pre>
              </div>

              <div className="border p-2 rounded">
                <span className="font-bold text-red-600">River (Pasados):</span>
                <pre className="text-xs mt-1">{data.riverPast ? JSON.stringify(data.riverPast[0], null, 2) : "Null / Vacío"}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}