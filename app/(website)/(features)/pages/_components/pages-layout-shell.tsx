"use client";

import { usePathname } from "next/navigation";
import { PagesSidebar } from "./pages-sidebar";

export function PagesLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isViewRoute = pathname.startsWith("/pages/view/");

  if (isViewRoute) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-4 items-start">
        <PagesSidebar />
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-150">
          {children}
        </main>
      </div>
    </div>
  );
}
