import { Navbar } from "@/components/shared/navbar/navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const WebsiteLayout = ({ children }: Props) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default WebsiteLayout;
