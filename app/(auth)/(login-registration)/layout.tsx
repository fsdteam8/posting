import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AuthFooter from "./_components/auth-footer";
import AuthSidebar from "./_components/auth-sidebar";
import BottomIllustration from "./_components/bottom-illustration";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cu = await auth();

  if (cu) {
    const isOnboarded = cu.user.isOnboarded;

    if (isOnboarded) redirect("/");
    else redirect("/onboarding");
  }
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Left blue panel - hidden on mobile */}
        <AuthSidebar />

        {/* Right content area */}
        <main className="relative flex flex-1 flex-col">
          {children}

          {/* Bottom illustration */}
          <BottomIllustration />
        </main>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
