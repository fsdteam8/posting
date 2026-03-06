import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import GroupsLayout from "./_components/groups-layout";

interface Props {
  children: ReactNode;
}

export const metadata = {
  title: "Groups",
  description: "Join and discover groups",
};

const Layout = async ({ children }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return (
    <GroupsLayout accessToken={cu.user.accessToken}>{children}</GroupsLayout>
  );
};

export default Layout;
