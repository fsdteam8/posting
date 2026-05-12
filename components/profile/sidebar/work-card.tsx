"use client";

import { useAddWork } from "@/hooks/profile/use-add-work";
import { useDeleteWork } from "@/hooks/profile/use-delete-work";
import { useEditWork } from "@/hooks/profile/use-edit-work";
import { Profile, Work } from "@/hooks/profile/use-profile";
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
import { useId, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkCardProps {
  profile: Profile;
  isOwner: boolean;
  accessToken: string;
}

interface WorkFormEntry {
  // undefined = new entry (use addWork), string = existing (use workId)
  _id: string | undefined;
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

function workToFormEntry(w: Work): WorkFormEntry {
  return {
    _id: w._id,
    title: w.title ?? "",
    company: w.company ?? "",
    location: w.location ?? "",
    from: toInputDate(w.from),
    to: toInputDate(w.to),
    current: Boolean(w.current),
    description: w.description ?? "",
  };
}

function makeEmptyEntry(): WorkFormEntry {
  return {
    _id: undefined,
    title: "",
    company: "",
    location: "",
    from: "",
    to: "",
    current: false,
    description: "",
  };
}

function entryToWorkPayload(e: WorkFormEntry): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    workTitle: e.title.trim(),
    workCompany: e.company.trim(),
    workLocation: e.location.trim(),
    workCurrent: Boolean(e.current),
    workDescription: e.description.trim(),
  };

  if (e.from) payload.workFrom = new Date(e.from).toISOString();
  if (!e.current && e.to) payload.workTo = new Date(e.to).toISOString();

  return payload;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Single entry form ────────────────────────────────────────────────────────

function WorkEntryForm({
  entry,
  index,
  isNew,
  isSaving,
  onSave,
  onCancel,
  onChange,
}: {
  entry: WorkFormEntry;
  index: number;
  isNew: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (key: keyof WorkFormEntry, value: string | boolean) => void;
}) {
  const uid = useId();

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-3 flex flex-col gap-2.5">
      {/* Entry header */}
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
          {isNew ? "New Work Experience" : `Edit Work ${index + 1}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
          >
            <X size={13} className="text-gray-400" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !entry.title.trim()}
            className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={13} className="text-green-500 animate-spin" />
            ) : (
              <Check size={13} className="text-green-500" />
            )}
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        value={entry.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder="Job title *"
        className={inputCls}
      />

      {/* Company */}
      <input
        value={entry.company}
        onChange={(e) => onChange("company", e.target.value)}
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
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="Location (e.g. New York, NY)"
          className={`${inputCls} pl-8`}
        />
      </div>

      {/* From / To */}
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
            onChange={(e) => onChange("from", e.target.value)}
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
            onChange={(e) => onChange("to", e.target.value)}
            className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        </div>
      </div>

      {/* Currently working here */}
      <label className="inline-flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={entry.current}
          onChange={(e) => onChange("current", e.target.checked)}
          className="size-3.5 rounded accent-blue-500 cursor-pointer"
        />
        <span className="text-[12.5px] text-gray-600">
          I currently work here
        </span>
      </label>

      {/* Description */}
      <textarea
        value={entry.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className={`${inputCls} resize-none`}
      />
    </div>
  );
}

// ─── Display entry (view mode) ────────────────────────────────────────────────

function WorkEntryDisplay({
  work,
  isOwner,
  isDeleting,
  onEdit,
  onDelete,
}: {
  work: Work;
  isOwner: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const from = formatDisplayDate(work.from);
  const to = work.current ? "Present" : formatDisplayDate(work.to);
  const duration = getDuration(work.from, work.to, work.current);

  return (
    <div className="flex items-start gap-3 group">
      <div className="size-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
        <Briefcase size={15} className="text-orange-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 leading-snug">
              {work.title}
            </p>
            {work.company && (
              <p className="text-[12px] text-gray-600 mt-0.5">{work.company}</p>
            )}
            {from && (
              <p className="text-[11.5px] text-gray-400 mt-0.5">
                {from}
                {to ? ` – ${to}` : ""}
                {duration ? ` · ${duration}` : ""}
              </p>
            )}
            {work.location && (
              <p className="inline-flex items-center gap-1 text-[11.5px] text-gray-400 mt-0.5">
                <MapPin size={11} />
                {work.location}
              </p>
            )}
            {work.description && (
              <p className="text-[12px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {work.description}
              </p>
            )}
          </div>

          {/* Edit + Delete icons — visible on hover */}
          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
                aria-label="Edit this work entry"
              >
                <Pencil size={13} className="text-gray-400" />
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
                aria-label="Delete this work entry"
              >
                {isDeleting ? (
                  <Loader2 size={13} className="text-red-400 animate-spin" />
                ) : (
                  <Trash2 size={13} className="text-red-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WorkCard({ profile, isOwner, accessToken }: WorkCardProps) {
  const [expanded, setExpanded] = useState(false);

  // editingId:
  //   null      = nothing is being edited
  //   "new"     = new entry form is open
  //   string    = _id of the existing entry being edited
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state for whichever entry is open
  const [formEntry, setFormEntry] = useState<WorkFormEntry>(makeEmptyEntry);

  const { mutate: addWork, isPending: isAdding } = useAddWork({ accessToken });
  const { mutate: editWork, isPending: isEditing } = useEditWork({
    accessToken,
  });
  const { mutate: deleteWork } = useDeleteWork({
    accessToken,
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const works = profile.works ?? [];
  const hasMore = works.length > 1;
  const isSaving = isAdding || isEditing;

  // ── Handlers ──

  const openAdd = () => {
    setFormEntry(makeEmptyEntry());
    setEditingId("new");
  };

  const openEdit = (work: Work) => {
    setFormEntry(workToFormEntry(work));
    setEditingId(work._id!);
  };

  const closeForm = () => {
    setEditingId(null);
    setFormEntry(makeEmptyEntry());
  };

  const handleDelete = (workId: string) => {
    setDeletingId(workId);
    deleteWork({ workId }, { onSettled: () => setDeletingId(null) });
  };

  const handleChange = (key: keyof WorkFormEntry, value: string | boolean) => {
    setFormEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = entryToWorkPayload(formEntry);

    if (editingId === "new") {
      // ── ADD ──
      addWork(payload as never, {
        onSuccess: (res) => {
          if (res.success) closeForm();
        },
      });
    } else if (editingId) {
      // ── EDIT ──
      editWork(
        { workId: editingId, ...payload },
        {
          onSuccess: (res) => {
            if (res.success) closeForm();
          },
        },
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Work</h3>

        {isOwner && editingId === null && (
          <button
            onClick={openAdd}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Add work"
          >
            <Plus size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {works.length === 0 &&
        editingId === null &&
        (isOwner ? (
          <button
            onClick={openAdd}
            className="text-[13px] text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 italic"
          >
            + Add work experience
          </button>
        ) : (
          <p className="text-[13px] text-gray-400 italic">
            No work experience added.
          </p>
        ))}

      {/* ── Existing entries ── */}
      {works.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* First entry — always visible */}
          {editingId === works[0]._id ? (
            <WorkEntryForm
              entry={formEntry}
              index={0}
              isNew={false}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={closeForm}
              onChange={handleChange}
            />
          ) : (
            <WorkEntryDisplay
              work={works[0]}
              isOwner={isOwner}
              isDeleting={deletingId === works[0]._id}
              onEdit={() => openEdit(works[0])}
              onDelete={() => handleDelete(works[0]._id!)}
            />
          )}

          {/* Remaining entries — animated expand */}
          {hasMore && (
            <div
              className={[
                "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
                expanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0",
              ].join(" ")}
            >
              {works
                .slice(1)
                .map((work, i) =>
                  editingId === work._id ? (
                    <WorkEntryForm
                      key={work._id}
                      entry={formEntry}
                      index={i + 1}
                      isNew={false}
                      isSaving={isSaving}
                      onSave={handleSave}
                      onCancel={closeForm}
                      onChange={handleChange}
                    />
                  ) : (
                    <WorkEntryDisplay
                      key={work._id}
                      work={work}
                      isOwner={isOwner}
                      isDeleting={deletingId === work._id}
                      onEdit={() => openEdit(work)}
                      onDelete={() => handleDelete(work._id!)}
                    />
                  ),
                )}
            </div>
          )}

          {/* See more / See less */}
          {hasMore && editingId === null && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="inline-flex items-center gap-1 text-[12.5px] text-blue-500 hover:underline cursor-pointer bg-transparent border-0 p-0 w-fit mt-0.5"
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

      {/* ── New entry form ── */}
      {editingId === "new" && (
        <div className="mt-3">
          <WorkEntryForm
            entry={formEntry}
            index={works.length}
            isNew={true}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={closeForm}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}
