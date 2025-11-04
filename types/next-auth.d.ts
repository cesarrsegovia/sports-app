// ./types/next-auth.d.ts

import type { DefaultSession, User } from 'next-auth';

/**
 * Extiende los tipos de 'next-auth' para incluir nuestro ID de usuario.
 */
declare module 'next-auth' {
  /**
   * Retornado por `auth()`, `useSession()`, etc.
   * Aquí extendemos la sesión para incluir el 'id' del usuario.
   */
  interface Session {
    user: {
      /** El ID del usuario en la base de datos. */
      id: string;
    } & DefaultSession['user']; // Mantiene name, email, e image de DefaultSession
  }
}