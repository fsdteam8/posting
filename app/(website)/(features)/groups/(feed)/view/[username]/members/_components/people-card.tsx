"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { ChevronDown, Loader2, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";

interface Member {
  id: string;
  name: string;
  joinedDate: string;
  image?: string;
}

const mockMembers: Member[] = [
  {
    id: "1",
    name: "Sunny Khan",
    joinedDate: "Joined on Monday",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Mahdin Hasan",
    joinedDate: "Joined on Monday",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Aamrat Makavan",
    joinedDate: "Joined on Monday",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Moumita Chakraborty",
    joinedDate: "Joined last Wednesday",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    name: "Gagana S N Bhatta",
    joinedDate: "Joined last Wednesday",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "6",
    name: "Shahana Jasim",
    joinedDate: "Joined last Wednesday",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "7",
    name: "Dinesh Rana",
    joinedDate: "Joined about a week ago",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
];

interface Props {
  accessToken: string;
  groupUserName: string;
}

export default function PeopleCard({ accessToken, groupUserName }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetSingleGroup({
      accessToken,
      username: groupUserName,
    });

  let content;

  if (isLoading) {
    content = (
      <CardContent>
        <Loader2 className="animate-spin" />
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
        {/* Filter and Search Section */}
        <div className="flex gap-3 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-gray-100 border-gray-200 hover:bg-gray-100"
              >
                {statusFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setStatusFilter("All statuses")}>
                All statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="pl-10 bg-gray-100 border-gray-200 placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Members Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Members <span className="text-gray-500">•</span>{" "}
              <span className="text-gray-700">{mockMembers.length}</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              These are people who&apos;ve joined your group.
            </p>
          </div>
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
          >
            See all
          </Button>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
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
                  <h4 className="font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">Joining Date</p>
                </div>
              </div>

              {/* Action Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Invite as Admin</DropdownMenuItem>
                  <DropdownMenuItem>Suspend in group</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Remove member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </CardContent>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">People</CardTitle>
      </CardHeader>

      {content}
    </Card>
  );
}
