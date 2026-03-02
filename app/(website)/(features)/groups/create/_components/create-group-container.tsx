"use client";

import { Card } from "@/components/ui/card";
import { baseURL } from "@/constants";
import { useProfile } from "@/hooks/profile/use-profile";
import { GroupFormValues } from "@/schemas/features/groups";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import { CreateGroupForm } from "./create-group-form";
import { GroupPreview } from "./group-preview";

interface Props {
  accessToken: string;
}

const CreteGroupContainer = ({ accessToken }: Props) => {
  const [formData, setFormData] = useState<Partial<GroupFormValues>>({
    privacy: "private",
    category: "Technology",
  });

  const router = useRouter();

  const { data: profile } = useProfile(accessToken);

  const USER = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : "...",
    avatarUrl:
      profile?.profileImage?.url ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.firstName}&backgroundColor=b6e3f4`,
  };

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["group-create"],
    mutationFn: (formData: FormData) =>
      fetch(`${baseURL}/groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }).then((res) => res.json()),
    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      router.push(`/groups/view/${data.data.groupUserName}`);

      // handle success
      toast.success(data.message);
    },
    onError: (error) => {
      console.error("[groups] Failed to create group:", error.message);
      // TODO: surface a toast notification here
      toast.error("Server Error");
    },
  });

  // Called on every keystroke / field change — drives the live preview
  const handleFormChange = (data: Partial<GroupFormValues>) => {
    setFormData(data);
  };

  const handleFormSubmit = async (data: GroupFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("privacy", data.privacy);
    formData.append("category", data.category);
    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.coverImage) {
      formData.append("coverImage", data.coverImage);
    }

    await mutateAsync(formData);
  };

  return (
    <div className="w-full  px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start gap-8 flex-col md:flex-row">
        {/* Left Column - Form */}
        <div className="w-full md:w-130">
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={USER.avatarUrl}
                  alt={USER.name}
                  height={40}
                  width={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">{USER.name}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You&apos;re creating a new group. Fill in the details below to
                get started.
              </p>
            </div>

            <CreateGroupForm
              onSuccess={handleFormSubmit}
              onFormChange={handleFormChange}
              isLoading={isPending}
            />
          </Card>
        </div>

        {/* Right Column - Preview (sticky, fills viewport height, scrolls internally) */}
        <div className="sticky top-6 w-full h-[calc(100vh-3rem)] overflow-hidden">
          <GroupPreview formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default CreteGroupContainer;

interface ApiRes {
  success: boolean;
  message: string;
  data: {
    _id: string;
    groupUserName: string;
  };
}
