"use client";

import FeedPostModalContainer from "@/components/shared/features/post-modal/feed-post-modal-container";
import { useProfile } from "@/hooks/profile/use-profile";
import { Session } from "next-auth";
import FeedPostContainer from "./_components/FeedPostContainer";
import { StoryReel } from "./_components/story";

interface Props {
  user: Session["user"];
}

const CenterPartContainer = ({ user }: Props) => {
  const accessToken = user.accessToken;

  const { data: profile } = useProfile(accessToken);

  if (!profile) return;

  return (
    <div className="py-4 space-y-4">
      <StoryReel
        accessToken={user.accessToken}
        currentUser={{
          _id: profile?._id,
          name: profile.firstName,
          avatar: profile.profileImage.url ?? "",
        }}
      />

      <FeedPostModalContainer accessToken={user.accessToken!} />

      {/* your feed posts list will go here */}
      <FeedPostContainer
        accessToken={user.accessToken!}
        loggedinUser={user.id!}
      />
    </div>
  );
};

export default CenterPartContainer;
