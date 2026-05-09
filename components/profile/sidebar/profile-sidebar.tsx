import { Profile } from "@/hooks/profile/use-profile";
import { BioCard } from "./bio-card";
import { ContactInfoCard } from "./contact-info-card";
import { EducationCard } from "./education-card";
import { PersonalDetailsCard } from "./personal-details-card";
import { PhotosWidget } from "./photos-widget";
import { WorkCard } from "./work-card";

interface ProfileSidebarProps {
  profile: Profile;
  isOwner: boolean;
  basePath: string;
  accessToken: string;
}

export function ProfileSidebar({
  profile,
  isOwner,
  basePath,
  accessToken,
}: ProfileSidebarProps) {
  const photos: { url: string; public_id: string }[] = [];

  return (
    <div className="flex flex-col gap-3 w-full">
      <BioCard profile={profile} isOwner={isOwner} accessToken={accessToken} />
      <PersonalDetailsCard
        profile={profile}
        isOwner={isOwner}
        accessToken={accessToken}
      />
      <EducationCard profile={profile} isOwner={isOwner} />
      <ContactInfoCard profile={profile} isOwner={isOwner} />
      <WorkCard profile={profile} isOwner={isOwner} />
      <PhotosWidget photos={photos} basePath={basePath} />
    </div>
  );
}
