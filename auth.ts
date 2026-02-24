import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        if (!credentials) return null;
        const user =
          typeof credentials.data === "string"
            ? JSON.parse(credentials.data)
            : credentials.data;

        if (!user) return null;

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          isOnboarded: user.isOnboarded,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id!,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          isOnboarded: user.isOnboarded,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          id: token.user.id,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          email: token.user.email,
          role: token.user.role,
          accessToken: token.user.accessToken,
          refreshToken: token.user.refreshToken,
          isOnboarded: token.user.isOnboarded,
        };
      }
      return session;
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
