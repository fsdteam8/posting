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
          accessToken: user.accessToken,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          accessToken: token.user.accessToken,
        };
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }

      return token;
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
