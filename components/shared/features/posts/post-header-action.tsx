"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSavePost } from "@/hooks/features/groups/posts/api/use-save-post";
import { Post } from "@/types/features/posts";
import {
  Bookmark,
  EyeOff,
  MessageCircleOff,
  MoreHorizontal,
  PencilLine,
  Pin,
  Trash2,
} from "lucide-react";

interface Props {
  data: Post;
  accessToken: string;
}

const PostHeaderAction = ({ data, accessToken }: Props) => {
  const { mutate, isPending: isSaving } = useSavePost({
    postId: data._id,
    accessToken,
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-fb-hover shadow-none"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5 text-fb-text-secondary" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 p-1">
        <DropdownMenuItem
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
          onClick={() => mutate()}
          disabled={isSaving}
        >
          <Bookmark className="w-4 h-4 text-fb-text shrink-0" />
          <span className="text-[13px] font-medium text-fb-text">
            Save post
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer">
          <Pin className="w-4 h-4 text-fb-text shrink-0" />
          <span className="text-[13px] font-medium text-fb-text">
            {data.isPinned ? "Unpin post" : "Pin to featured"}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer">
          <EyeOff className="w-4 h-4 text-fb-text shrink-0" />
          <span className="text-[13px] font-medium text-fb-text">
            Hide post
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer">
          <MessageCircleOff className="w-4 h-4 text-fb-text shrink-0" />
          <span className="text-[13px] font-medium text-fb-text">
            {data.allowComments ? "Turn off commenting" : "Turn on commenting"}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer">
          <PencilLine className="w-4 h-4 text-fb-text shrink-0" />
          <span className="text-[13px] font-medium text-fb-text">
            Edit post
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer">
          <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-[13px] font-medium text-red-500">
            Delete post
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostHeaderAction;
