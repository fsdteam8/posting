import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { FriendRequest } from "../mock-data";

export function FriendRequestCard({ requests }: { requests: FriendRequest[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-foreground">
          Friend Requests
        </h3>
        <button className="text-[14px] font-medium text-primary hover:underline">
          See all
        </button>
      </div>
      {requests.map((request) => (
        <div key={request.id} className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarImage src={request.avatarUrl} alt={request.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {request.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-foreground">
                {request.name}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {request.mutualFriends} mutual friends
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 flex-1 rounded-md text-[13px] font-semibold"
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 flex-1 rounded-md text-[13px] font-semibold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
