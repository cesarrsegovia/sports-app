// ./app/leagues/[key]/page.tsx

import { getMatchesByLeague, getScore, LEAGUE_KEYS } from "@/lib/odds-api";
import { getStandingsFD, COMPETITION_IDS } from "@/lib/football-data";
import { getArgentinaStandings } from "@/lib/the-sports-db";
import { Card, CardContent } from "@/components/ui/card"; // Quitamos CardHeader para simplificar si quieres, o lo dejamos
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const ODDS_TO_FD_MAP: Record<string, string> = {
  'soccer_epl': COMPETITION_IDS.PREMIER_LEAGUE,
  'soccer_spain_la_liga': COMPETITION_IDS.LA_LIGA,
  'soccer_italy_serie_a': COMPETITION_IDS.SERIE_A,
  'soccer_uefa_champs_league': COMPETITION_IDS.CHAMPIONS_LEAGUE,
};

export default async function LeaguePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  
  const leagueInfo = LEAGUE_KEYS.find(l => l.key === key);

  let matches: any[] = [];
  try {
    matches = await getMatchesByLeague(key);
    matches.sort((a: any, b: any) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
  } catch (error) {
    console.error("Error cargando partidos:", error);
  }

  let standings: any[] = [];
  try {
    if (key === 'soccer_argentina_primera_division') {
      standings = await getArgentinaStandings();
    } else {
      const fdCode = ODDS_TO_FD_MAP[key];
      if (fdCode) standings = await getStandingsFD(fdCode) || [];
    }
  } catch (error) {
    console.error("Error tabla:", error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <header className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {leagueInfo?.name || key}
        </h1>
        <div className="flex items-center gap-2 text-lg text-muted-foreground">
          <Badge variant="secondary">Temporada Actual</Badge>
          <span>• {leagueInfo?.country || "Internacional"}</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* --- TABLA DE POSICIONES --- */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-2xl font-bold flex items-center gap-2">📊 Tabla de Posiciones</h2>
           {standings.length > 0 ? (
             <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader className="bg-muted/50">
                     <TableRow>
                       <TableHead className="w-12 text-center font-bold">#</TableHead>
                       <TableHead>Equipo</TableHead>
                       <TableHead className="text-center w-12">PJ</TableHead>
                       <TableHead className="text-center w-12 hidden sm:table-cell">DG</TableHead>
                       <TableHead className="text-right w-16 font-black pr-4">Pts</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {standings.map((row: any) => (
                       <TableRow key={row.team.id} className="hover:bg-muted/20">
                         <TableCell className="font-bold text-center">{row.position}</TableCell>
                         <TableCell className="flex items-center gap-3 py-3">
                           {row.team.crest && <img src={row.team.crest} alt="" className="w-6 h-6 object-contain" />}
                           <span className="font-medium whitespace-nowrap">{row.team.name}</span>
                         </TableCell>
                         <TableCell className="text-center text-sm">{row.playedGames}</TableCell>
                         <TableCell className="text-center text-sm hidden sm:table-cell">{row.goalDifference}</TableCell>
                         <TableCell className="text-right font-black text-primary text-lg pr-4">{row.points}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             </div>
           ) : (
             <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/5">
               <p className="text-muted-foreground">Tabla no disponible actualmente</p>
             </div>
           )}
        </div>

        {/* --- PARTIDOS (CSS CORREGIDO) --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">⚽️ Partidos</h2>
            {matches.length > 0 && <Badge variant="outline">{matches.length}</Badge>}
          </div>
          
          {matches.length > 0 ? (
            <div className="flex flex-col gap-3 h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {matches.map((match: any) => {
                 const isFinished = match.completed;
                 const startTime = new Date(match.commence_time);
                 const isLive = !isFinished && startTime < new Date();
                 const homeScore = getScore(match.scores, match.home_team);
                 const awayScore = getScore(match.scores, match.away_team);

                 return (
                  <Card key={match.id} className="hover:border-primary/50 transition-all shadow-sm">
                    <CardContent className="p-4">
                       {/* Fila Superior: Info del partido */}
                       <div className="flex justify-between items-center mb-3 text-xs text-muted-foreground">
                          <span>{startTime.toLocaleDateString([], {weekday: 'short', day: 'numeric'})}</span>
                          {isFinished ? <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Fin</Badge> : 
                           isLive ? <Badge variant="destructive" className="h-5 px-1.5 text-[10px] animate-pulse">Live</Badge> :
                           <span className="font-mono">{startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>}
                       </div>

                       {/* Fila Central: Equipos y Score (LAYOUT MÁS ROBUSTO) */}
                       <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          {/* Local */}
                          <div className="text-right font-semibold text-sm leading-tight break-words">
                             {match.home_team}
                          </div>

                          {/* Marcador */}
                          <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-center min-w-[50px]">
                            {isLive || isFinished ? `${homeScore ?? 0}-${awayScore ?? 0}` : "VS"}
                          </div>

                          {/* Visitante */}
                          <div className="text-left font-semibold text-sm leading-tight break-words">
                             {match.away_team}
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                 )
              })}
            </div>
          ) : (
            <div className="py-10 text-center border rounded-lg border-dashed bg-muted/5">
              <p className="text-muted-foreground text-sm">No hay partidos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}