// ./lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Declara una variable global para 'cachear' el cliente de Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Esta es la instancia de tu cliente de Prisma.
 * Usamos 'globalThis.prisma' para mantener la misma instancia
 * durante el "hot-reload" en desarrollo. En producción,
 * simplemente creará una nueva instancia.
 */
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    // Opcional: puedes descomentar esto para ver las queries de Prisma
    // en la consola de tu servidor de desarrollo.
    // log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}