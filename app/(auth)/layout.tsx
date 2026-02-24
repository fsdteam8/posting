import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AuthLayout = async ({ children }: Props) => {
  const cu = await auth();

  if (cu) redirect("/");
  return <div>{children}</div>;
};

export default AuthLayout;
