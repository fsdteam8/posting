import { GroupsSidebar } from "./group-sidebar";

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <GroupsSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className=" mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
