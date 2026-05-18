import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EmptyChat } from "./_components/empty-chat";

export const metadata = {
  title: "Messenger | Postin",
  description: "Chat with friends and groups",
};

export default async function MessengerPage() {
  const session = await auth();
  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  return <EmptyChat />;
}
