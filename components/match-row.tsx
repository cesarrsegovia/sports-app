// ./components/match-row.tsx
import { Badge } from "@/components/ui/badge";

export function MatchRow({ match }: { match: any }) {
  const dateObj = new Date(match.date);
  
  // Formato: "03 Feb"
  const dateStr = dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  // Formato: "21:30"
  const timeStr = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Si tiene score, asumimos que se jugó o se está jugando
  const showScore = match.homeScore !== null && match.homeScore !== undefined;
  const isLive = match.isLive || false;

  return (
    <div className={`flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/40 transition-colors ${isLive ? 'bg-red-950/20 border-red-500/30' : ''}`}>
      
      {/* FECHA */}
      <div className="flex flex-col items-center justify-center w-12 text-muted-foreground border-r pr-2 mr-2">
        {isLive ? (
          <Badge variant="destructive" className="text-[8px] px-1 py-0 mb-1 animate-pulse">
            EN VIVO
          </Badge>
        ) : (
          <span className="font-bold text-sm uppercase">{dateStr}</span>
        )}
        <span className="text-[10px]">{timeStr}</span>
      </div>

      {/* PARTIDO */}
      <div className="flex flex-1 items-center justify-between gap-2">
        
        {/* Local */}
        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
          <span className="font-medium text-sm text-right truncate hidden sm:block">
            {match.homeTeam}
          </span>
          <span className="font-medium text-sm text-right sm:hidden">
            {match.homeTeam.substring(0, 3).toUpperCase()}
          </span>
          
          {match.homeLogo ? (
            <img src={match.homeLogo} alt={match.homeTeam} className="w-8 h-8 object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0 flex items-center justify-center text-[8px]">?</div>
          )}
        </div>

        {/* Marcador */}
        <div className="min-w-[50px] text-center font-bold">
          {showScore ? (
            <span className={`px-2 py-1 rounded border ${
              isLive 
                ? 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-700 dark:text-red-300' 
                : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs font-mono">VS</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex items-center justify-start gap-2 flex-1 min-w-0">
          {match.awayLogo ? (
            <img src={match.awayLogo} alt={match.awayTeam} className="w-8 h-8 object-contain shrink-0" />
          ) : (
             <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0 flex items-center justify-center text-[8px]">?</div>
          )}
          
          <span className="font-medium text-sm text-left truncate hidden sm:block">
            {match.awayTeam}
          </span>
          <span className="font-medium text-sm text-left sm:hidden">
            {match.awayTeam.substring(0, 3).toUpperCase()}
          </span>
        </div>

      </div>
    </div>
  );
}