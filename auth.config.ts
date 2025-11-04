// ./auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  // Aquí podemos poner páginas de login personalizadas
  // pages: {
  //   signIn: '/login',
  // },
  callbacks: {
    // Este callback SÍ se puede ejecutar en el middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false; // Redirige a /login
      // }
      return true; // Por ahora, permitimos todo
    },
  },
  providers: [], // Los proveedores se definen en auth.ts
} satisfies NextAuthConfig;