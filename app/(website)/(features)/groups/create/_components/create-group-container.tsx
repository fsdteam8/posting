"use client";

import { Card } from "@/components/ui/card";
import { baseURL } from "@/constants";
import { GroupFormValues } from "@/schemas/features/groups";
import { useMutation } from "@tanstack/react-query";
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
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

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
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Monir Hossain Rabby
                  </p>
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
