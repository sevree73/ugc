import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma/bcrypt here so this can be shared with
// middleware (which runs on the Edge runtime). The Credentials provider
// (which needs the database) is added on top of this in `src/auth.ts`,
// used only by the API route handler and server components.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
