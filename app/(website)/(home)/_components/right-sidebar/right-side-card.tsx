import { Separator } from "@/components/ui/separator";

import { contacts, friendRequests, sponsoredAds } from "../mock-data";
import { BirthdaysCard } from "./birthday-card";
import { ContactsCard } from "./contacts-card";
import { FriendRequestCard } from "./friend-request-card";
import { SponsoredCard } from "./sponsor-card";

export function RightSidebar() {
  return (
    <aside className="flex flex-col gap-4 py-4 pl-2">
      <SponsoredCard ads={sponsoredAds} />
      <Separator />
      <FriendRequestCard requests={friendRequests} />
      <Separator />
      <BirthdaysCard />
      <Separator />
      <ContactsCard contacts={contacts} />
    </aside>
  );
}
