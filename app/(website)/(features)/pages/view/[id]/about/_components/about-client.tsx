"use client";

import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { cn } from "@/lib/utils";
import type { Page } from "@/types/features/pages";
import {
  Calendar,
  Clock,
  Globe,
  Heart,
  Info,
  Link2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useState } from "react";

interface Props {
  pageId: string;
  accessToken: string;
}

type SectionKey =
  | "category"
  | "contact"
  | "basic"
  | "transparency"
  | "groups"
  | "events"
  | "likes"
  | "following"
  | "followers";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "contact", label: "Contact info" },
  { key: "basic", label: "Basic info" },
  { key: "transparency", label: "Page transparency" },
  { key: "groups", label: "Groups" },
  { key: "events", label: "Events" },
  { key: "likes", label: "Likes" },
  { key: "following", label: "Following" },
  { key: "followers", label: "Followers" },
];

export function AboutClient({ pageId, accessToken }: Props) {
  const [active, setActive] = useState<SectionKey>("category");
  const { data, isLoading, isError, error } = useGetPageById({
    pageId,
    accessToken,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <div className="space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-9 bg-gray-100 animate-pulse rounded-md"
              />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-5 bg-gray-100 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-red-500">
        {error?.message ?? "Failed to load page details."}
      </div>
    );
  }

  const page = data.data;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">About</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <nav
          aria-label="About sections"
          className="px-3 py-4 md:border-r border-gray-100"
        >
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {SECTIONS.map((section) => {
              const isActive = active === section.key;
              return (
                <li key={section.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(section.key)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="px-6 py-6 min-h-[260px]">
          <SectionContent section={active} page={page} />
        </div>
      </div>
    </div>
  );
}

// ─── Section content ────────────────────────────────────────────────────────

function SectionContent({
  section,
  page,
}: {
  section: SectionKey;
  page: Page;
}) {
  switch (section) {
    case "category":
      return <CategorySection page={page} />;
    case "contact":
      return <ContactSection page={page} />;
    case "basic":
      return <BasicInfoSection page={page} />;
    case "transparency":
      return <TransparencySection page={page} />;
    case "groups":
      return (
        <EmptySection
          icon={Users}
          title="No groups yet"
          description="This page hasn't linked any groups."
        />
      );
    case "events":
      return (
        <EmptySection
          icon={Calendar}
          title="No events yet"
          description="This page hasn't created any events."
        />
      );
    case "likes":
      return (
        <Row
          icon={ThumbsUp}
          label={`${formatCount(page.likesCount ?? 0)} likes`}
        />
      );
    case "following":
      return (
        <EmptySection
          icon={Heart}
          title="Not following anyone yet"
          description="Pages this page follows will appear here."
        />
      );
    case "followers":
      return (
        <Row
          icon={Users}
          label={`${formatCount(page.followersCount ?? 0)} followers`}
        />
      );
  }
}

function CategorySection({ page }: { page: Page }) {
  if (!page.category) {
    return (
      <EmptySection
        icon={Info}
        title="No category set"
        description="This page hasn't set a category yet."
      />
    );
  }
  return <Row icon={Calendar} label={page.category} />;
}

function ContactSection({ page }: { page: Page }) {
  const { contact, location } = page;
  const items: { icon: typeof Mail; label: React.ReactNode; key: string }[] = [];

  if (contact?.email) {
    items.push({
      key: "email",
      icon: Mail,
      label: (
        <a
          href={`mailto:${contact.email}`}
          className="text-primary hover:underline break-all"
        >
          {contact.email}
        </a>
      ),
    });
  }
  if (contact?.phone) {
    items.push({ key: "phone", icon: Phone, label: contact.phone });
  }
  if (contact?.website) {
    items.push({
      key: "website",
      icon: Link2,
      label: (
        <a
          href={contact.website}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline break-all"
        >
          {contact.website}
        </a>
      ),
    });
  }
  const addr = [location?.address, location?.city, location?.postcode]
    .filter(Boolean)
    .join(", ");
  if (addr) {
    items.push({ key: "address", icon: MapPin, label: addr });
  }

  if (items.length === 0) {
    return (
      <EmptySection
        icon={Mail}
        title="No contact info"
        description="This page hasn't added any contact details."
      />
    );
  }

  return (
    <ul className="space-y-3 text-[15px] text-gray-800">
      {items.map((item) => (
        <Row key={item.key} icon={item.icon} label={item.label} />
      ))}
    </ul>
  );
}

function BasicInfoSection({ page }: { page: Page }) {
  const items: { icon: typeof Info; label: React.ReactNode; key: string }[] = [];

  if (page.bio) items.push({ key: "bio", icon: Info, label: page.bio });
  if (page.description)
    items.push({ key: "description", icon: Info, label: page.description });
  if (page.hours?.status)
    items.push({ key: "hours", icon: Clock, label: page.hours.status });
  if (page.visibility)
    items.push({
      key: "visibility",
      icon: Globe,
      label: `Visibility: ${page.visibility}`,
    });

  if (items.length === 0) {
    return (
      <EmptySection
        icon={Info}
        title="No basic info"
        description="Bio, description, hours, and other basics will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3 text-[15px] text-gray-800">
      {items.map((item) => (
        <Row key={item.key} icon={item.icon} label={item.label} />
      ))}
    </ul>
  );
}

function TransparencySection({ page }: { page: Page }) {
  const t = page.transparency;
  const created = page.createdAt ? new Date(page.createdAt) : null;

  return (
    <ul className="space-y-3 text-[15px] text-gray-800">
      {created && (
        <Row
          icon={Calendar}
          label={`Page created — ${created.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`}
        />
      )}
      {page.isVerified && (
        <Row icon={ShieldCheck} label="Verified page" />
      )}
      {t?.adminInfo && <Row icon={Info} label={t.adminInfo} />}
      <Row
        icon={Info}
        label={`Running ads: ${t?.isRunningAds ? "Yes" : "No"}`}
      />
    </ul>
  );
}

// ─── Primitives ─────────────────────────────────────────────────────────────

function Row({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <Icon size={18} className="text-gray-500 mt-0.5 shrink-0" />
      <span>{label}</span>
    </li>
  );
}

function EmptySection({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-gray-500" />
      </div>
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
