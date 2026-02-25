import { auth } from "@/auth";
import { CircleUserRound } from "lucide-react";
import { redirect } from "next/navigation";
import ProfilePhotoUpload from "./profile-photo-upload";

export default async function OnboardingCard() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return (
    <div className="flex w-full flex-col items-center gap-8 rounded-2xl border border-border/60 bg-card px-8 py-10 shadow-sm">
      {/* Top icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full text-primary">
          <CircleUserRound className="size-7" strokeWidth={1.4} />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-card-foreground text-balance text-center">
            Upload your profile photo
          </h1>
          <p className="max-w-70 text-center text-sm leading-relaxed text-muted-foreground">
            upload a clear profile image for your account so people can
            recognize you.
          </p>
        </div>
      </div>

      {/* Profile upload area */}
      <ProfilePhotoUpload accessToken={cu.user.accessToken} />
    </div>
  );
}
