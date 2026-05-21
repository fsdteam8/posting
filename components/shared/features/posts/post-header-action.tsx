"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeletePost } from "@/hooks/features/groups/posts/api/use-delete-post";
import { useEditPost } from "@/hooks/features/groups/posts/api/use-edit-post";
import { useHidePost } from "@/hooks/features/groups/posts/api/use-hide-post";
import { useSavePost } from "@/hooks/features/groups/posts/api/use-save-post";
import { useToggleFeatureGroupPost } from "@/hooks/features/groups/posts/api/use-toggle-feature-group-post";
import { useTogglePinGroupPost } from "@/hooks/features/groups/posts/api/use-toggle-pin-group-post";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { Post } from "@/types/features/posts";
import {
  Bookmark,
  BookmarkX,
  EyeOff,
  MessageCircle,
  MessageCircleOff,
  MoreHorizontal,
  PencilLine,
  Pin,
  PinOff,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import PostModalContainer from "../post-modal/post-modal-container";

const AlertModal = dynamic(() => import("@/components/ui/custom/alert-modal"), {
  ssr: false,
});

interface Props {
  data: Post;
  accessToken: string;
  groupId?: string;
  loggedinUserId: string;
}

const PostHeaderAction = ({
  data,
  accessToken,
  groupId = "",
  loggedinUserId,
}: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isGroupContext = Boolean(groupId);

  const { mutate, isPending: isSaving } = useSavePost({
    postId: data._id,
    accessToken,
    groupId: groupId,
  });

  const { mutate: onHideMutate } = useHidePost({
    postId: data._id,
    accessToken,
    groupId: groupId,
  });

  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost({
    postId: data._id,
    groupId,
    accessToken,
  });

  const { mutate: editPost } = useEditPost({
    postId: data._id,
    groupId,
    accessToken,
  });

  const { mutate: togglePin, isPending: isPinning } = useTogglePinGroupPost({
    postId: data._id,
    accessToken,
    groupId,
  });

  const { mutate: toggleFeature, isPending: isFeaturing } =
    useToggleFeatureGroupPost({
      postId: data._id,
      accessToken,
      groupId,
    });

  const { data: groupInfo } = useGetSingleGroup({
    username: isGroupContext ? groupId : "",
    accessToken,
  });

  const handleDelete = async () => {
    const res = await deletePost();

    if (res.success) {
      setDeleteOpen(false);
    }
  };

  const isCreator = data.author._id === loggedinUserId;
  const isGroupAdmin = Boolean(
    isGroupContext &&
      groupInfo?.data?.admins?.some((admin) => admin._id === loggedinUserId),
  );
  const canManageGroupPost = isGroupContext && (isGroupAdmin || isCreator);

  const onToggleCommenting = (data: "allowed" | "notAllowed") => {
    const formdata = new FormData();

    if (data === "allowed") {
      formdata.append("allowComments", "true");
    } else if (data === "notAllowed") {
      formdata.append("allowComments", "false");
    }

    editPost(formdata);
  };

  const onTogglePinProfile = (value: "true" | "false") => {
    const formdata = new FormData();

    formdata.append("isPinned", value);

    editPost(formdata);
  };

  return (
    <>
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
            {data.isSaved ? (
              <BookmarkX className="w-4 h-4 text-fb-text shrink-0" />
            ) : (
              <Bookmark className="w-4 h-4 text-fb-text shrink-0" />
            )}
            <span className="text-[13px] font-medium text-fb-text">
              {data.isSaved ? "Unsave post" : "Save post"}
            </span>
          </DropdownMenuItem>

          {!isGroupContext && isCreator && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
              onClick={() =>
                onTogglePinProfile(data.isPinned ? "false" : "true")
              }
            >
              {data.isPinned ? (
                <PinOff className="w-4 h-4 text-fb-text shrink-0" />
              ) : (
                <Pin className="w-4 h-4 text-fb-text shrink-0" />
              )}
              <span className="text-[13px] font-medium text-fb-text">
                {data.isPinned ? "Unpin post" : "Pin post"}
              </span>
            </DropdownMenuItem>
          )}

          {canManageGroupPost && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
              onClick={() => togglePin()}
              disabled={isPinning}
            >
              {data.isPinned ? (
                <PinOff className="w-4 h-4 text-fb-text shrink-0" />
              ) : (
                <Pin className="w-4 h-4 text-fb-text shrink-0" />
              )}
              <span className="text-[13px] font-medium text-fb-text">
                {data.isPinned ? "Unpin post" : "Pin post"}
              </span>
            </DropdownMenuItem>
          )}

          {canManageGroupPost && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
              onClick={() => toggleFeature()}
              disabled={isFeaturing}
            >
              {data.isFeatured ? (
                <Sparkles className="w-4 h-4 text-fb-text shrink-0" />
              ) : (
                <Star className="w-4 h-4 text-fb-text shrink-0" />
              )}
              <span className="text-[13px] font-medium text-fb-text">
                {data.isFeatured ? "Unfeature post" : "Feature post"}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
            onClick={() => onHideMutate()}
          >
            <EyeOff className="w-4 h-4 text-fb-text shrink-0" />
            <span className="text-[13px] font-medium text-fb-text">
              Hide post
            </span>
          </DropdownMenuItem>

          {isCreator && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
              onClick={() => {
                onToggleCommenting(
                  data.allowComments ? "notAllowed" : "allowed",
                );
              }}
            >
              {data.allowComments ? (
                <MessageCircleOff className="w-4 h-4 text-fb-text shrink-0" />
              ) : (
                <MessageCircle className="w-4 h-4 text-fb-text shrink-0" />
              )}
              <span className="text-[13px] font-medium text-fb-text">
                {data.allowComments
                  ? "Turn off commenting"
                  : "Turn on commenting"}
              </span>
            </DropdownMenuItem>
          )}

          {isCreator && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
              onClick={() => setEditOpen(true)}
            >
              <PencilLine className="w-4 h-4 text-fb-text shrink-0" />
              <span className="text-[13px] font-medium text-fb-text">
                Edit post
              </span>
            </DropdownMenuItem>
          )}

          {isCreator && (
            <>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-[13px] font-medium text-red-500">
                  Delete post
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteOpen && (
        <AlertModal
          onClose={() => setDeleteOpen(false)}
          isOpen={deleteOpen}
          onConfirm={handleDelete}
          loading={isDeleting}
          title="Permanently delete post?"
          message="Deleting this post will also delete all the associated reactions and comments. This can't be undone. If you need a record of the content, take a screenshot before deleting it."
        />
      )}

      {editOpen && (
        <PostModalContainer
          accessToken={accessToken}
          username={groupId || data.author.username}
          app={groupId ? "group" : "profile"}
          initialData={data}
          externalOpen={editOpen}
          onExternalOpenChange={setEditOpen}
        />
      )}
    </>
  );
};

export default PostHeaderAction;
