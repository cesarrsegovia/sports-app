// ./auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config'; // <-- Importa la config ligera
import { prisma } from '@/lib/prisma'; // <-- Importa el singleton de BD

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig, // <-- Expande la config ligera
  //asds
  // AÑADE las cosas pesadas (Prisma)
  adapter: PrismaAdapter(prisma), 
  session: { strategy: 'database' }, 
  
  providers: [
    // Aquí pondremos Google, etc.
  ],
  
  callbacks: {
    ...authConfig.callbacks, // Expande los callbacks ligeros
    
    // AÑADE los callbacks pesados (que necesitan la BD)
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; 
      }
      return session;
    },
  },
});