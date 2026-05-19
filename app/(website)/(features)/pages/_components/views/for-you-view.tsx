"use client";

import { ManagedPageRow } from "../managed-page-row";

interface ForYouViewProps {
  accessToken: string;
}

// Mock data — replace with real hook data
const MOCK_MANAGED = [
  { id: "1", name: "StudySphere Online", actionType: "switch" as const },
  {
    id: "2",
    name: "StudySphere Online",
    subtitle: "You can manage this page using Meta Business Suite",
    actionType: "manage" as const,
  },
];

const MOCK_DEACTIVATED = [
  {
    id: "3",
    name: "StudySphere Online",
    isDeactivated: true,
    actionType: "switch" as const,
  },
];

export function ForYouView({}: ForYouViewProps) {
  return (
    <div className="space-y-6">
      {/* Tab pills */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {["For You", "Discover", "Invitations", "Liked Pages"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              i === 0
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pages You Manage */}
      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Pages You Manage
        </h3>
        <div className="space-y-3">
          {MOCK_MANAGED.map((page) => (
            <ManagedPageRow key={page.id} {...page} />
          ))}
        </div>
      </section>

      {/* Deactivated Pages */}
      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Deactivated Pages
        </h3>
        <div className="space-y-3">
          {MOCK_DEACTIVATED.map((page) => (
            <ManagedPageRow key={page.id} {...page} />
          ))}
        </div>
      </section>
    </div>
  );
}
