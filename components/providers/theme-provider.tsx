// ./components/providers/theme-provider.tsx

"use client" // Directiva clave: esto es un Client Component

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

// Este es un componente "envoltorio" (wrapper)
// Simplemente pasa todas las props a NextThemesProvider
// pero asegurándose de que se renderice en el cliente.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}