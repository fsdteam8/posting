"use client";

import PagePostModalContainer from "@/components/shared/features/post-modal/page-post-modal-container";
import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { useProfile } from "@/hooks/profile/use-profile";

interface Props {
  pageId: string;
  accessToken: string;
}

export function PagePostComposer({ pageId, accessToken }: Props) {
  const { data: pageRes } = useGetPageById({ pageId, accessToken });
  const { data: profile } = useProfile(accessToken);

  if (!pageRes?.data || !profile) return null;

  const userId = profile._id;

  // Page admins from getPageDetails are populated as objects (with _id),
  // but other endpoints return raw ObjectId strings — handle both.
  const isAdmin = (
    pageRes.data.admins as Array<string | { _id: string }>
  ).some((a) => (typeof a === "string" ? a : a._id) === userId);

  if (!isAdmin) return null;

  return (
    <div className="mb-4">
      <PagePostModalContainer accessToken={accessToken} pageId={pageId} />
    </div>
  );
}
