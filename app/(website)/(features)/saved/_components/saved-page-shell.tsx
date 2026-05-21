"use client";

import { useState } from "react";
import { SavedSidebar } from "./saved-sidebar";
import { SavedItemsList } from "./saved-items-list";

interface Props {
  accessToken: string;
}

export type SavedView =
  | { kind: "all" }
  | { kind: "collection"; collectionId: string; name: string };

export function SavedPageShell({ accessToken }: Props) {
  const [view, setView] = useState<SavedView>({ kind: "all" });

  return (
    <div className="flex min-h-[92vh] bg-background">
      <SavedSidebar
        accessToken={accessToken}
        view={view}
        onViewChange={setView}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-5">
          <SavedItemsList accessToken={accessToken} view={view} />
        </div>
      </main>
    </div>
  );
}
