import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  isOnboarded: boolean;
  username: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    isOnboarded: boolean;
    username: string;
  }
}

import "next-auth/jwt";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      accessToken: string;
      refreshToken: string;
      isOnboarded: boolean;
      username: string;
    };
  }
}
