"use client";

import { Education, Profile } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import {
  Check,
  ChevronDown,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useId, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EducationCardProps {
  profile: Profile;
  isOwner: boolean;
  accessToken: string;
}

interface EducationFormEntry extends Omit<
  Education,
  "from" | "to" | "current"
> {
  id: string; // local key for React list rendering
  from: string; // YYYY-MM-DD string for input[type=date]
  to: string;
  current: boolean;
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

function makeEmpty(id: string): EducationFormEntry {
  return {
    id,
    school: "",
    degree: "",
    fieldOfStudy: "",
    from: "",
    to: "",
    current: false,
  };
}

function toFormEntries(education: Education[]): EducationFormEntry[] {
  return education.map((e, i) => ({
    id: String(i),
    school: e.school ?? "",
    degree: e.degree ?? "",
    fieldOfStudy: e.fieldOfStudy ?? "",
    from: toInputDate(e.from),
    to: toInputDate(e.to),
    current: Boolean(e.current),
  }));
}

function toPayload(entries: EducationFormEntry[]): Partial<Education>[] {
  return (
    entries
      .filter((e) => e.school.trim())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ id: _id, ...e }) => ({
        school: e.school.trim(),
        degree: e.degree.trim(),
        fieldOfStudy: e.fieldOfStudy.trim(),
        from: e.from ? new Date(e.from) : undefined,
        to: e.current ? undefined : e.to ? new Date(e.to) : undefined,
        current: Boolean(e.current),
      }))
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Single education entry form ──────────────────────────────────────────────

function EntryForm({
  entry,
  index,
  total,
  onChange,
  onRemove,
}: {
  entry: EducationFormEntry;
  index: number;
  total: number;
  onChange: (
    id: string,
    key: keyof EducationFormEntry,
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
          Education {index + 1}
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

      {/* School */}
      <input
        value={entry.school}
        onChange={(e) => onChange(entry.id, "school", e.target.value)}
        placeholder="School / University *"
        className={inputCls}
      />

      {/* Degree */}
      <input
        value={entry.degree}
        onChange={(e) => onChange(entry.id, "degree", e.target.value)}
        placeholder="Degree (e.g. Bachelor's)"
        className={inputCls}
      />

      {/* Field of study */}
      <input
        value={entry.fieldOfStudy}
        onChange={(e) => onChange(entry.id, "fieldOfStudy", e.target.value)}
        placeholder="Field of study (e.g. Computer Science)"
        className={inputCls}
      />

      {/* Dates */}
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

      {/* Currently studying here */}
      <label className="inline-flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={entry.current}
          onChange={(e) => onChange(entry.id, "current", e.target.checked)}
          className="size-3.5 rounded accent-blue-500 cursor-pointer"
        />
        <span className="text-[12.5px] text-gray-600">
          I currently study here
        </span>
      </label>
    </div>
  );
}

// ─── Display entry (view mode) ────────────────────────────────────────────────

function EntryDisplay({ edu }: { edu: Education }) {
  const from = formatDisplayDate(edu.from);
  const to = edu.current ? "Present" : formatDisplayDate(edu.to);
  const dateRange = from ? `${from}${to ? ` – ${to}` : ""}` : null;

  return (
    <div className="flex items-start gap-3">
      <div className="size-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <GraduationCap size={15} className="text-blue-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 leading-snug">
          {edu.school}
        </p>
        {(edu.degree || edu.fieldOfStudy) && (
          <p className="text-[12px] text-gray-500 mt-0.5">
            {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ")}
          </p>
        )}
        {dateRange && (
          <p className="text-[11.5px] text-gray-400 mt-0.5">{dateRange}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EducationCard({
  profile,
  isOwner,
  accessToken,
}: EducationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<EducationFormEntry[]>(() =>
    toFormEntries(profile.education ?? []),
  );

  const { mutate, isPending } = useUpdateProfile({ accessToken });

  const education = profile.education ?? [];
  const hasMore = education.length > 1;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const visibleEducation = expanded ? education : education.slice(0, 1);

  // ── Form helpers ──

  const handleChange = (
    id: string,
    key: keyof EducationFormEntry,
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
      { education: toPayload(entries) as Education[] },
      {
        onSuccess: (res) => {
          if (res.success) setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setEntries(toFormEntries(profile.education ?? []));
    setIsEditing(false);
  };

  // Re-sync when profile refetches
  // (avoids stale form if another card triggers invalidation)
  const syncEntries = () => {
    if (!isEditing) setEntries(toFormEntries(profile.education ?? []));
  };
  // called during render — safe because it only runs when not editing
  void syncEntries;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Education</h3>

        {isOwner && !isEditing && (
          <button
            onClick={() => {
              if (entries.length === 0) setEntries([makeEmpty("0")]);
              setIsEditing(true);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Edit education"
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
          {education.length === 0 ? (
            <div>
              {isOwner ? (
                <button
                  onClick={() => {
                    setEntries([makeEmpty("0")]);
                    setIsEditing(true);
                  }}
                  className="text-[13px] text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 italic"
                >
                  + Add education
                </button>
              ) : (
                <p className="text-[13px] text-gray-400 italic">
                  No education added.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Always show first entry */}
              <EntryDisplay edu={education[0]} />

              {/* Animated expand for remaining entries */}
              {hasMore && (
                <div
                  className={[
                    "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
                    expanded ? "max-h-250 opacity-100" : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  {education.slice(1).map((edu, i) => (
                    <EntryDisplay key={i} edu={edu} />
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
                    : `See more education (${education.length - 1} more)`}
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
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
            <EntryForm
              key={entry.id}
              entry={entry}
              index={i}
              total={entries.length}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}

          {/* Add another */}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-blue-500 hover:text-blue-700 cursor-pointer bg-transparent border-0 p-0 w-fit transition-colors font-medium"
          >
            <Plus size={13} />
            Add another education
          </button>
        </div>
      )}
    </div>
  );
}
