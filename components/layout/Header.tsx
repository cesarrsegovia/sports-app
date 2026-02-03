// ./components/layout/Header.tsx

import Link from "next/link";
// ¡Importamos NUESTRO botón!
import { Button } from "@/components/ui/button";
import { LEAGUE_KEYS } from "@/lib/odds-api";

// Importamos un ícono (opcional, pero se ve bien)
// Instala lucide-react: pnpm install lucide-react
// import { LogIn } from "lucide-react"; 

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">⚽ Sports App</span>
        </Link>
        
        {/* NAVEGACIÓN ACTUALIZADA */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {LEAGUE_KEYS.map((league) => (
            <Link 
              key={league.key} 
              // Usamos la 'key' (ej: soccer_epl) en la URL
              href={`/leagues/${league.key}`} 
              className="transition-colors hover:text-blue-500 text-muted-foreground hover:text-foreground"
            >
              {league.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
           {/* ... botones de login ... */}
        </div>
      </div>
    </header>
  );
}