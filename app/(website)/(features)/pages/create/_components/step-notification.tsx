"use client";

interface NotificationPrefs {
  marketingEmails: boolean;
  pageNotifications: boolean;
}

interface StepNotificationsProps {
  pageName: string;
  prefs: NotificationPrefs;
  onToggle: (key: keyof NotificationPrefs) => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        checked ? "bg-blue-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function StepNotifications({
  pageName,
  prefs,
  onToggle,
}: StepNotificationsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Stay informed about your Page
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Turn on these features to help make the most of{" "}
          <span className="font-medium text-gray-700">{pageName}</span>. You can
          change them at any time in Settings.
        </p>
      </div>

      {/* Settings list */}
      <div className="flex flex-col gap-0 rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {/* Marketing emails */}
        <div className="flex items-start justify-between gap-4 px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              Marketing and promotional emails about your Page
            </p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Find out about products and services that may help make {pageName}{" "}
              a success.
            </p>
          </div>
          <Toggle
            checked={prefs.marketingEmails}
            onChange={() => onToggle("marketingEmails")}
          />
        </div>

        {/* Page notifications */}
        <div className="flex items-start justify-between gap-4 px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              Page notifications on your profile
            </p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Don&apos;t miss updates about your Page while you&apos;re switched
              into your profile.
            </p>
          </div>
          <Toggle
            checked={prefs.pageNotifications}
            onChange={() => onToggle("pageNotifications")}
          />
        </div>
      </div>
    </div>
  );
}
