import { auth } from "@/auth"; // replace with your actual auth utility
import { NotificationsPageClient } from "@/components/features/notifications/notifications-page-client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Notifications | Postin",
  description: "See all your notifications",
};

export default async function NotificationsPage() {
  const session = await auth(); // replace with your session/auth pattern

  if (!session?.user.accessToken) {
    redirect("/login");
  }

  return <NotificationsPageClient accessToken={session.user.accessToken} />;
}
