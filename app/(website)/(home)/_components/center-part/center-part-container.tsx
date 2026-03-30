import FeedPostModalContainer from "@/components/shared/features/post-modal/feed-post-modal-container";
import { Session } from "next-auth";

interface Props {
  user: Session["user"];
}

const CenterPartContainer = ({ user }: Props) => {
  return (
    <div className="py-4 space-y-4">
      <FeedPostModalContainer accessToken={user.accessToken!} />

      {/* your feed posts list will go here */}
    </div>
  );
};

export default CenterPartContainer;
