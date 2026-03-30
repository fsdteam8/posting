import FeedPostModalContainer from "@/components/shared/features/post-modal/feed-post-modal-container";
import { Session } from "next-auth";
import FeedPostContainer from "./_components/FeedPostContainer";

interface Props {
  user: Session["user"];
}

const CenterPartContainer = ({ user }: Props) => {
  return (
    <div className="py-4 space-y-4">
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
