import { Separator } from "@/components/ui/separator";

import { contacts, sponsoredAds } from "../mock-data";
import { BirthdaysCard } from "./birthday-card";
import { ContactsCard } from "./contacts-card";
import { FriendRequestCard } from "./friend-request-card";
import { SponsoredCard } from "./sponsor-card";

interface Props {
  accessToken: string;
}

export function RightSidebar({ accessToken }: Props) {
  return (
    <aside className="flex flex-col gap-4 py-4 pl-2">
      <BirthdaysCard />
      <Separator />
      <SponsoredCard ads={sponsoredAds} />
      <Separator />
      <FriendRequestCard accessToken={accessToken} />
      <Separator />

      <ContactsCard contacts={contacts} />
    </aside>
  );
}
