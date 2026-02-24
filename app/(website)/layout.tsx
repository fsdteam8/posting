import { auth } from "@/auth";
import { Navbar } from "@/components/shared/navbar/navbar";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const WebsiteLayout = async ({ children }: Props) => {
  const cu = await auth();

  // is not loggedin then redirect to the sign in page for authenticate
  if (!cu || !cu.user || !cu.user.id) redirect("/login");
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default WebsiteLayout;
