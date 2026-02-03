// ./app/page.tsx
import { getArgentineData } from "@/lib/hybrid-soccer";
import { MatchRow } from "@/components/match-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, History } from "lucide-react";

// OJO: Esta función DEBE ser 'export default' y 'async'
// NO agregues "use client" al principio de este archivo.
export default async function HomePage() {
  
  // Llamamos a nuestro motor híbrido
  const { league, upcoming, past } = await getArgentineData();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER: Banner y Escudo (Desde TheSportsDB) */}
      <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 to-blue-950 shadow-xl border border-blue-900/50 min-h-[250px] flex items-center">
        
        {/* Banner de fondo */}
        {league?.strBanner && (
           <img 
             src={league.strBanner} 
             className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" 
             alt="Banner"
           />
        )}
        
        <div className="relative p-8 flex flex-col md:flex-row items-center gap-8 z-10 w-full">
           {/* Escudo */}
           {league?.strBadge && (
             <img 
               src={league.strBadge} 
               alt="Logo" 
               className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_25px_rgba(0,200,255,0.4)]" 
             />
           )}
           
           <div className="text-center md:text-left">
             <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
               Fútbol Argentino
             </h1>
             <p className="text-blue-200 font-medium text-xl uppercase tracking-widest mt-2">
               Primera División • 2026
             </p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: PRÓXIMOS (Desde Odds API) */}
        <Card className="border-blue-500/20 shadow-lg">
          <CardHeader className="bg-muted/40 pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-500">
              <CalendarDays className="w-6 h-6" />
              Próximos Partidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcoming && upcoming.length > 0 ? (
              <div className="flex flex-col">
                {upcoming.map((match: any) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                No hay partidos programados próximamente.
              </div>
            )}
          </CardContent>
        </Card>

        {/* COLUMNA 2: RESULTADOS (Desde Odds API) */}
        <Card className="border-green-500/20 shadow-lg">
          <CardHeader className="bg-muted/40 pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-green-500">
              <History className="w-6 h-6" />
              Resultados Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {past && past.length > 0 ? (
              <div className="flex flex-col">
                {past.slice(0, 15).map((match: any) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                No hay resultados recientes.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}