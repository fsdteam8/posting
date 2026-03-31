"use client";

import { Button } from "@/components/ui/button";
import { baseURL } from "@/constants";
import { useProfile } from "@/hooks/profile/use-profile";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface ApiRes {
  success: boolean;
  message: string;
}

interface Props {
  accessToken: string;
}

export default function ProfilePhotoUpload({ accessToken }: Props) {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useProfile(accessToken);

  const profileImage = profile?.profileImage.url ?? "";

  const displayedImage = preview || profileImage;

  const { mutate, isPending } = useMutation({
    mutationKey: ["onboarding-avatar"],
    mutationFn: async (formdata: FormData) => {
      const res = await fetch(`${baseURL}/users/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formdata,
      });
      return res.json();
    },
    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message || "Failed to upload photo");
        return;
      }
      router.push(`/onboarding/people-you-may-know`);
    },
    onError: (err) => {
      console.log("onboarding-avatarUpload-error", err);
      toast.error("Server Error");
    },
  });

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const dropped = e.dataTransfer.files?.[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0];
      if (picked) handleFile(picked);
    },
    [handleFile],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const canContinue = useMemo(() => !!file && !isPending, [file, isPending]);

  const onContinue = useCallback(() => {
    if (!file) {
      toast.error("Please select a photo to continue.");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    mutate(formData);
  }, [file, mutate]);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop a profile photo here or click to upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            className={cn(
              "relative flex size-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/25 hover:border-primary/50",
              preview && "border-transparent hover:border-transparent",
            )}
          >
            {displayedImage ? (
              <Image
                src={displayedImage}
                alt="Profile preview"
                width={112}
                height={112}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-28 items-center justify-center rounded-full bg-muted">
                <User
                  className="size-14 text-muted-foreground/50"
                  strokeWidth={1.2}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openFilePicker();
            }}
            aria-label="Upload profile photo"
            className="absolute bottom-0.5 right-0.5 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <Camera className="size-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <div className="flex w-full items-center justify-center gap-3">
        <Button
          variant="outline"
          className="min-w-32.5 rounded-full"
          disabled={isPending}
          onClick={() => router.push(`/onboarding/people-you-may-know`)}
        >
          Skip for now
        </Button>

        <Button
          className="min-w-32.5 rounded-full"
          disabled={!canContinue}
          onClick={onContinue}
          style={{ backgroundColor: "#1fa0f3" }}
        >
          Continue {isPending && <Loader2 className="animate-spin size-5" />}
        </Button>
      </div>
    </>
  );
}
