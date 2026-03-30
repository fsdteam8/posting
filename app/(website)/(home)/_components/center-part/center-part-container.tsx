import FeedPostModalContainer from "@/components/shared/features/post-modal/feed-post-modal-container";
import { Session } from "next-auth";
import FeedPostContainer from "./_components/FeedPostContainer";
import { StoryReel } from "./_components/story";

interface Props {
  user: Session["user"];
}

const CenterPartContainer = ({ user }: Props) => {
  return (
    <div className="py-4 space-y-4">
      <FeedPostModalContainer accessToken={user.accessToken!} />

      <StoryReel
        accessToken={user.accessToken}
        currentUser={{
          _id: user.id,
          name: user.firstName,
          avatar: user.image ?? "",
        }}
      />

      {/* your feed posts list will go here */}
      <FeedPostContainer
        accessToken={user.accessToken!}
        loggedinUser={user.id!}
      />
    </div>
  );
};

export default CenterPartContainer;
