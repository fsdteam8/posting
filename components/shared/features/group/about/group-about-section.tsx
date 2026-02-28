"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { Button } from "@/components/ui/button";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { format } from "date-fns";
import { ChevronRight, Clock, Eye, Globe } from "lucide-react";

interface GroupAboutSectionProps {
  username: string;
  accessToken: string;
  onSeeMore?: () => void;
}

export function GroupAboutSection({
  onSeeMore,
  username,
  accessToken,
}: GroupAboutSectionProps) {
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetSingleGroup({ username, accessToken });

  if (isLoading) return null;

  if (isError) {
    return (
      <ErrorScreen
        message={(error as Error)?.message ?? "Something went wrong"}
        isRefetching={isRefetching}
        onRetry={refetch}
      />
    );
  }

  if (!data?.success) return null;

  const group = data.data;
  const formattedDate = format(new Date(group.createdAt), "MMMM dd, yyyy");

  const privacyDescription =
    group.privacy === "public"
      ? "Anyone can see who's in the group and what they post."
      : "Only members can see who is in the group and what they post.";

  const visibilityDescription = "Anyone can find this group.";

  return (
    <div className="w-full max-w-150 rounded-xl border border-border/50 bg-background p-4">
      {/* Title */}
      <h2 className="text-sm font-semibold text-foreground mb-3">
        About this group
      </h2>

      {/* Description */}
      {group.rules?.length > 0 && (
        <p className="text-[13px] text-muted-foreground leading-snug mb-4">
          {group.rules[0]}
        </p>
      )}

      <div className="space-y-4">
        <Row
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          title={<span className="capitalize">{group.privacy}</span>}
          description={privacyDescription}
        />

        <Row
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          title="Visible"
          description={visibilityDescription}
        />

        <Row
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          title="History"
          description={
            <>
              Group created on{" "}
              <span className="font-medium text-foreground/90">
                {formattedDate}
              </span>
            </>
          }
          right={
            onSeeMore ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-primary hover:bg-transparent hover:underline"
                onClick={onSeeMore}
              >
                See more
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
}

const Row = ({
  icon,
  title,
  description,
  right,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <div className="flex gap-3">
    <div className="shrink-0 pt-0.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-foreground leading-tight">
          {title}
        </h3>
        {right}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
        {description}
      </p>
    </div>
  </div>
);
