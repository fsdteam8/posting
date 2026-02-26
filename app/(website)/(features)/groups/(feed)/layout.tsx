import { ReactNode } from "react";
import GroupsLayout from "./_components/groups-layout";

interface Props {
  children: ReactNode;
}

export const metadata = {
  title: "Groups",
  description: "Join and discover groups",
};

const Layout = ({ children }: Props) => {
  return <GroupsLayout>{children}</GroupsLayout>;
};

export default Layout;
