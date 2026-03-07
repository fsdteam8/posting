"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAddGroupAdmin } from "@/hooks/features/groups/api/use-add-group-admin";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  accessToken: string;
  groupUserName: string;
  variant: "manage" | "view";
}

export default function PeopleCard({
  accessToken,
  groupUserName,
  variant,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetSingleGroup({ accessToken, username: groupUserName });

  const { mutate: addAdmin, isPending } = useAddGroupAdmin({
    groupId: groupUserName,
    accessToken,
  });

  const onGroupMemberAdd = (id: string) => {
    addAdmin(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["group", groupUserName] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const isAdmin = (id: string) => {
    const admins = data?.data.admins || [];
    return Boolean(admins.find((item) => item._id === id));
  };

  let content;

  if (isLoading) {
    content = (
      <CardContent>
        <Loader2 className="animate-spin text-muted-foreground" />
      </CardContent>
    );
  } else if (isError) {
    content = (
      <CardContent>
        <ErrorScreen
          message={error.message}
          isRefetching={isRefetching}
          onRetry={refetch}
        />
      </CardContent>
    );
  } else if (data && data.success) {
    const members = data.data.members;

    const filteredMembers = members.filter((member) =>
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    content = (
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-10 bg-muted border-border placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Members header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              Members <span className="text-muted-foreground">•</span>{" "}
              <span className="text-muted-foreground">{members.length}</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              These are people who&apos;ve joined your group.
            </p>
          </div>
          {/* <Button
            variant="link"
            className="text-primary hover:text-primary/80 p-0 h-auto"
          >
            See all
          </Button> */}
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 hover:bg-muted rounded-md transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.profileImage.url}
                    alt={member.firstName}
                  />
                  <AvatarFallback>{member.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {member.firstName} {member.lastName}
                  </h4>
                  <p className="text-sm text-muted-foreground">Joining Date</p>
                </div>
              </div>

              {variant === "manage" &&
                (isAdmin(member._id) ? (
                  <Button variant="outline">Remove from Admin</Button>
                ) : (
                  <Button
                    onClick={() => onGroupMemberAdd(member._id)}
                    disabled={isPending}
                  >
                    Add As Admin
                  </Button>
                ))}
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No members found</p>
          </div>
        )}
      </CardContent>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-foreground">
          People
        </CardTitle>
      </CardHeader>
      {content}
    </Card>
  );
}
