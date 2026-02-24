import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AuthLayout = async ({ children }: Props) => {
  return <div>{children}</div>;
};

export default AuthLayout;
