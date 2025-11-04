// ./components/layout/Header.tsx

import Link from "next/link";
// ¡Importamos NUESTRO botón!
import { Button } from "@/components/ui/button"; 

// Importamos un ícono (opcional, pero se ve bien)
// Instala lucide-react: pnpm install lucide-react
// import { LogIn } from "lucide-react"; 

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">

        {/* Logo o Título */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold sm:inline-block">
            ⚽ Sports App
          </span>
        </Link>

        {/* (Aquí irán los links de navegación en el futuro) */}
        <div className="flex flex-1 items-center justify-end space-x-4">

          {/* Este es nuestro componente Shadcn */}
          <Button>
            {/* <LogIn className="mr-2 h-4 w-4" /> (Descomentar si instalaste lucide) */}
            Iniciar Sesión
          </Button>

        </div>
      </div>
    </header>
  );
}