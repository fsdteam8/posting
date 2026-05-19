import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PagesLayoutShell } from "./_components/pages-layout-shell";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return <PagesLayoutShell>{children}</PagesLayoutShell>;
}
