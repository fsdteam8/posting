"use client";

import { Profile, Work } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import {
  Briefcase,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkCardProps {
  profile: Profile;
  isOwner: boolean;
  accessToken: string;
}

interface WorkFormEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  current: boolean;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(d: Date | string | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

function formatDisplayDate(d: Date | string | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getDuration(
  from?: Date | string,
  to?: Date | string,
  current?: boolean,
): string {
  if (!from) return "";
  const start = new Date(from);
  const end = current ? new Date() : to ? new Date(to) : null;
  if (!end) return "";
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (months <= 0) return "< 1 month";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rem > 0) parts.push(`${rem} mo`);
  return parts.join(" ");
}

function makeEmpty(id: string): WorkFormEntry {
  return {
    id,
    title: "",
    company: "",
    location: "",
    from: "",
    to: "",
    current: false,
    description: "",
  };
}

function toFormEntries(works: Work[]): WorkFormEntry[] {
  return works.map((w, i) => ({
    id: String(i),
    title: w.title ?? "",
    company: w.company ?? "",
    location: w.location ?? "",
    from: toInputDate(w.from),
    to: toInputDate(w.to),
    current: Boolean(w.current),
    description: w.description ?? "",
  }));
}

function toPayload(entries: WorkFormEntry[]): Partial<Work>[] {
  return (
    entries
      .filter((e) => e.title.trim())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ id: _id, ...e }) => ({
        title: e.title.trim(),
        company: e.company.trim(),
        location: e.location.trim(),
        from: e.from ? new Date(e.from) : undefined,
        to: e.current ? undefined : e.to ? new Date(e.to) : undefined,
        current: Boolean(e.current),
        description: e.description.trim(),
      }))
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Single work entry form ───────────────────────────────────────────────────

function WorkEntryForm({
  entry,
  index,
  total,
  onChange,
  onRemove,
}: {
  entry: WorkFormEntry;
  index: number;
  total: number;
  onChange: (
    id: string,
    key: keyof WorkFormEntry,
    value: string | boolean,
  ) => void;
  onRemove: (id: string) => void;
}) {
  const uid = useId();

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 flex flex-col gap-2.5">
      {/* Entry header */}
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
          Work {index + 1}
        </span>
        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Remove entry"
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        )}
      </div>

      {/* Title — required */}
      <input
        value={entry.title}
        onChange={(e) => onChange(entry.id, "title", e.target.value)}
        placeholder="Job title *"
        className={inputCls}
      />

      {/* Company */}
      <input
        value={entry.company}
        onChange={(e) => onChange(entry.id, "company", e.target.value)}
        placeholder="Company name"
        className={inputCls}
      />

      {/* Location */}
      <div className="relative">
        <MapPin
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={entry.location}
          onChange={(e) => onChange(entry.id, "location", e.target.value)}
          placeholder="Location (e.g. New York, NY)"
          className={`${inputCls} pl-8`}
        />
      </div>

      {/* From / To dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${uid}-from`}
            className="text-[11px] text-gray-400 font-medium"
          >
            From
          </label>
          <input
            id={`${uid}-from`}
            type="date"
            value={entry.from}
            onChange={(e) => onChange(entry.id, "from", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${uid}-to`}
            className="text-[11px] text-gray-400 font-medium"
          >
            To
          </label>
          <input
            id={`${uid}-to`}
            type="date"
            value={entry.to}
            disabled={entry.current}
            onChange={(e) => onChange(entry.id, "to", e.target.value)}
            className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        </div>
      </div>

      {/* Currently working here */}
      <label className="inline-flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={entry.current}
          onChange={(e) => onChange(entry.id, "current", e.target.checked)}
          className="size-3.5 rounded accent-blue-500 cursor-pointer"
        />
        <span className="text-[12.5px] text-gray-600">
          I currently work here
        </span>
      </label>

      {/* Description */}
      <textarea
        value={entry.description}
        onChange={(e) => onChange(entry.id, "description", e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className={`${inputCls} resize-none`}
      />
    </div>
  );
}

// ─── Display entry (view mode) ────────────────────────────────────────────────

function WorkEntryDisplay({ work }: { work: Work }) {
  const from = formatDisplayDate(work.from);
  const to = work.current ? "Present" : formatDisplayDate(work.to);
  const duration = getDuration(work.from, work.to, work.current);

  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="size-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
        <Briefcase size={15} className="text-orange-400" />
      </div>

      <div className="min-w-0 flex-1">
        {/* Title */}
        <p className="text-[13px] font-semibold text-gray-800 leading-snug">
          {work.title}
        </p>

        {/* Company */}
        {work.company && (
          <p className="text-[12px] text-gray-600 mt-0.5">{work.company}</p>
        )}

        {/* Date range + duration */}
        {from && (
          <p className="text-[11.5px] text-gray-400 mt-0.5">
            {from}
            {to ? ` – ${to}` : ""}
            {duration ? ` · ${duration}` : ""}
          </p>
        )}

        {/* Location */}
        {work.location && (
          <p className="inline-flex items-center gap-1 text-[11.5px] text-gray-400 mt-0.5">
            <MapPin size={11} />
            {work.location}
          </p>
        )}

        {/* Description */}
        {work.description && (
          <p className="text-[12px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
            {work.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WorkCard({ profile, isOwner, accessToken }: WorkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<WorkFormEntry[]>(() =>
    toFormEntries(profile.works ?? []),
  );

  const { mutate, isPending } = useUpdateProfile({ accessToken });

  const works = profile.works ?? [];
  const hasMore = works.length > 1;

  // Re-sync form when profile refetches
  useEffect(() => {
    if (!isEditing) setEntries(toFormEntries(profile.works ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ── Form helpers ──

  const handleChange = (
    id: string,
    key: keyof WorkFormEntry,
    value: string | boolean,
  ) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    );
  };

  const handleAdd = () => {
    setEntries((prev) => [...prev, makeEmpty(String(Date.now()))]);
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    mutate(
      { works: toPayload(entries) as Work[] },
      {
        onSuccess: (res) => {
          if (res.success) setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setEntries(toFormEntries(profile.works ?? []));
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Work</h3>

        {isOwner && !isEditing && (
          <button
            onClick={() => {
              if (entries.length === 0) setEntries([makeEmpty("0")]);
              setIsEditing(true);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Edit work"
          >
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}

        {isOwner && isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
            >
              <X size={14} className="text-gray-400" />
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={14} className="text-green-500 animate-spin" />
              ) : (
                <Check size={14} className="text-green-500" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── View Mode ── */}
      {!isEditing && (
        <>
          {works.length === 0 ? (
            <div>
              {isOwner ? (
                <button
                  onClick={() => {
                    setEntries([makeEmpty("0")]);
                    setIsEditing(true);
                  }}
                  className="text-[13px] text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 italic"
                >
                  + Add work experience
                </button>
              ) : (
                <p className="text-[13px] text-gray-400 italic">
                  No work experience added.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Always show first entry */}
              <WorkEntryDisplay work={works[0]} />

              {/* Animated expand for the rest */}
              {hasMore && (
                <div
                  className={[
                    "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
                    expanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  {works.slice(1).map((work, i) => (
                    <WorkEntryDisplay key={i} work={work} />
                  ))}
                </div>
              )}

              {/* See more / See less */}
              {hasMore && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="inline-flex items-center gap-1 text-[12.5px] text-blue-500 hover:underline cursor-pointer bg-transparent border-0 p-0 w-fit mt-0.5 transition-colors"
                >
                  {expanded
                    ? "See less"
                    : `See more work (${works.length - 1} more)`}
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Edit Mode ── */}
      {isEditing && (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <WorkEntryForm
              key={entry.id}
              entry={entry}
              index={i}
              total={entries.length}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-blue-500 hover:text-blue-700 cursor-pointer bg-transparent border-0 p-0 w-fit font-medium transition-colors"
          >
            <Plus size={13} />
            Add another work experience
          </button>
        </div>
      )}
    </div>
  );
}
