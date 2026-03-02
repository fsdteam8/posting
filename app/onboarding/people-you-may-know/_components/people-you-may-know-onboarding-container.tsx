"use client";
import { PeopleYouMayKnowCard } from "@/components/shared/cards/friend-request/people-you-may-know-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import OnboardingProgress from "../interest/_components/on-boarding-progress";

// Mock data - replace with real data from your API
const SUGGESTED_PEOPLE = [
  {
    id: "1",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "2",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "3",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "4",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1506362612048-46a378dd3085?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "5",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "6",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "7",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
  {
    id: "8",
    name: "Sarah Rozario",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    mutualFriendsCount: 8,
  },
];

interface Props {
  accessToken: string;
}

const PeopleYouMayKnowOnBoradingContainer = ({}: Props) => {
  const router = useRouter();
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());

  const handleAddFriend = (id: string) => {
    setAddedFriends((prev) => new Set([...prev, id]));
    // TODO: Call your API to add friend
  };

  const handleContinue = () => {
    console.log(addedFriends);
    router.push("/onboarding/people-you-may-know/interest");
  };
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/onboarding/interest"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <OnboardingProgress currentStep={2} totalSteps={3} />

        {/* Spacer for centering the progress bar */}
        <div className="w-13" />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8 pb-6">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          {/* Heading */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance text-center sm:text-3xl">
              Suggested for you
            </h1>
            <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
              Built your network. Connect with people you may know to see their
              updates and share your thoughts.
            </p>
          </div>

          {/* People grid */}
          <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUGGESTED_PEOPLE.map((person) => (
              <PeopleYouMayKnowCard
                key={person.id}
                id={person.id}
                name={person.name}
                avatar={person.avatar}
                mutualFriendsCount={person.mutualFriendsCount}
                onAddFriend={handleAddFriend}
                isLoading={false}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom action bar */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 px-6 py-5">
          <Button
            variant="outline"
            className="min-w-35 rounded-full"
            disabled={false}
            onClick={() =>
              router.push("/onboarding/people-you-may-know/interest")
            }
          >
            Skip for Now
          </Button>
          <Button
            className="min-w-35 rounded-full"
            onClick={handleContinue}
            disabled={false}
          >
            Continue {false && <Loader2 className="animate-spin size-5" />}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default PeopleYouMayKnowOnBoradingContainer;
