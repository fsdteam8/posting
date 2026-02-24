import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  accessToken: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    id: string;
    accessToken: string;
  }
}

import "next-auth/jwt";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user: {
      id: string;
      accessToken: string;
    };
  }
}
