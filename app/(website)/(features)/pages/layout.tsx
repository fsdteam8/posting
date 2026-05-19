import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PagesSidebar } from "./_components/pages-sidebar";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-4 items-start">
        {/* Sidebar — always visible, route-aware */}
        <PagesSidebar />

        {/* Page content */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-150">
          {children}
        </main>
      </div>
    </div>
  );
}
