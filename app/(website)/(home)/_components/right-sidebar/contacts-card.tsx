import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Search } from "lucide-react";
import type { Contact } from "../mock-data";

export function ContactsCard({ contacts }: { contacts: Contact[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-foreground">Contacts</h3>
        <div className="flex items-center gap-1">
          <button className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card">
            <Search className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      {contacts.map((contact) => (
        <button
          key={contact.id}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-card"
        >
          <div className="relative">
            <Avatar className="size-8">
              <AvatarImage src={contact.avatarUrl} alt={contact.name} />
              <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                {contact.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {contact.online && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>
          <span
            className={cn(
              "text-[14px] font-medium",
              contact.online ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {contact.name}
          </span>
        </button>
      ))}
    </div>
  );
}
