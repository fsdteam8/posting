import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MonthBirthdaysSection } from "./_components/month-birthdays-section";
import { RecentBirthdaysSection } from "./_components/recent-birthdays-section";
import { TodaysBirthdaysSection } from "./_components/todays-birthdays-section";
import { UpcomingBirthdaysSection } from "./_components/upcoming-birthdays-section";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const accessToken = cu.user.accessToken as string;

  // Show the next month after this one as the "looking ahead" group
  // (the screenshot's "June" section under May).
  const nextMonth = (new Date().getMonth() + 1) % 12;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <TodaysBirthdaysSection accessToken={accessToken} />
        <RecentBirthdaysSection accessToken={accessToken} />
        <UpcomingBirthdaysSection accessToken={accessToken} />
        <MonthBirthdaysSection
          accessToken={accessToken}
          monthIndex={nextMonth}
        />
      </div>
    </div>
  );
};

export default Page;
