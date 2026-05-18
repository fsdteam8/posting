import { auth } from "@/auth";
import { baseURL } from "@/constants";
import type { MessengerUser } from "@/types/messenger";
import { redirect } from "next/navigation";
import { MessengerLayoutClient } from "./_components/messenger-layout-client";

export default async function MessengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  const accessToken = session.user.accessToken;

  // Fetch current user
  let me: MessengerUser = {
    _id: session.user.id,
    firstName: "",
    lastName: "",
  };
  try {
    const res = await fetch(`${baseURL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const u = json?.data;
      if (u) {
        me = {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          profileImage: u.profileImage,
          isOnline: u.isOnline,
        };
      }
    }
  } catch {
    // Fall back to session id only
  }

  return (
    <MessengerLayoutClient accessToken={accessToken} me={me}>
      {children}
    </MessengerLayoutClient>
  );
}
