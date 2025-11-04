// ./middleware.ts
import NextAuth from 'next-auth';
// ¡Importa SOLO desde el archivo de config ligero!
import { authConfig } from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};