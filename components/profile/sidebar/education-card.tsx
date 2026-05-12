"use client";

import { useAddEducation } from "@/hooks/profile/use-add-education";
import { useDeleteEducation } from "@/hooks/profile/use-delete-education";
import { useEditEducation } from "@/hooks/profile/use-edit-education";
import { Education, Profile } from "@/hooks/profile/use-profile";
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

interface EducationFormEntry {
  // undefined = new entry, string = existing entry _id
  _id: string | undefined;
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
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

function educationToFormEntry(e: Education): EducationFormEntry {
  return {
    _id: e._id,
    school: e.school ?? "",
    degree: e.degree ?? "",
    fieldOfStudy: e.fieldOfStudy ?? "",
    from: toInputDate(e.from),
    to: toInputDate(e.to),
    current: Boolean(e.current),
  };
}

function makeEmptyEntry(): EducationFormEntry {
  return {
    _id: undefined,
    school: "",
    degree: "",
    fieldOfStudy: "",
    from: "",
    to: "",
    current: false,
  };
}

// Build a clean payload with correct backend field names — no undefined values
function entryToEducationPayload(
  e: EducationFormEntry,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    eduSchool: e.school.trim(),
    eduDegree: e.degree.trim(),
    eduFieldOfStudy: e.fieldOfStudy.trim(),
    eduCurrent: Boolean(e.current),
  };

  if (e.from) payload.eduFrom = new Date(e.from).toISOString();
  if (!e.current && e.to) payload.eduTo = new Date(e.to).toISOString();

  return payload;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Single entry form ────────────────────────────────────────────────────────

function EducationEntryForm({
  entry,
  index,
  isNew,
  isSaving,
  onSave,
  onCancel,
  onChange,
}: {
  entry: EducationFormEntry;
  index: number;
  isNew: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (key: keyof EducationFormEntry, value: string | boolean) => void;
}) {
  const uid = useId();

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-3 flex flex-col gap-2.5">
      {/* Entry header */}
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
          {isNew ? "New Education" : `Edit Education ${index + 1}`}
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
            disabled={isSaving || !entry.school.trim()}
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

      {/* School */}
      <input
        value={entry.school}
        onChange={(e) => onChange("school", e.target.value)}
        placeholder="School / University *"
        className={inputCls}
      />

      {/* Degree */}
      <input
        value={entry.degree}
        onChange={(e) => onChange("degree", e.target.value)}
        placeholder="Degree (e.g. Bachelor's)"
        className={inputCls}
      />

      {/* Field of study */}
      <input
        value={entry.fieldOfStudy}
        onChange={(e) => onChange("fieldOfStudy", e.target.value)}
        placeholder="Field of study (e.g. Computer Science)"
        className={inputCls}
      />

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

      {/* Currently studying here */}
      <label className="inline-flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={entry.current}
          onChange={(e) => onChange("current", e.target.checked)}
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

function EducationEntryDisplay({
  edu,
  isOwner,
  isDeleting,
  onEdit,
  onDelete,
}: {
  edu: Education;
  isOwner: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const from = formatDisplayDate(edu.from);
  const to = edu.current ? "Present" : formatDisplayDate(edu.to);
  const dateRange = from ? `${from}${to ? ` – ${to}` : ""}` : null;

  return (
    <div className="flex items-start gap-3 group">
      <div className="size-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <GraduationCap size={15} className="text-blue-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
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

          {/* Edit + Delete icons — visible on hover */}
          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
                aria-label="Edit this education entry"
              >
                <Pencil size={13} className="text-gray-400" />
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
                aria-label="Delete this education entry"
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

export function EducationCard({
  profile,
  isOwner,
  accessToken,
}: EducationCardProps) {
  const [expanded, setExpanded] = useState(false);

  // editingId:
  //   null    = nothing open
  //   "new"   = new entry form open
  //   string  = _id of existing entry being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formEntry, setFormEntry] =
    useState<EducationFormEntry>(makeEmptyEntry);

  const { mutate: addEducation, isPending: isAdding } = useAddEducation({
    accessToken,
  });
  const { mutate: editEducation, isPending: isEditing } = useEditEducation({
    accessToken,
  });
  const { mutate: deleteEducation } = useDeleteEducation({ accessToken });

  // Track which _id is currently being deleted
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const education = profile.education ?? [];
  const hasMore = education.length > 1;
  const isSaving = isAdding || isEditing;

  // ── Handlers ──

  const openAdd = () => {
    setFormEntry(makeEmptyEntry());
    setEditingId("new");
  };

  const openEdit = (edu: Education) => {
    setFormEntry(educationToFormEntry(edu));
    setEditingId(edu._id!);
  };

  const closeForm = () => {
    setEditingId(null);
    setFormEntry(makeEmptyEntry());
  };

  const handleChange = (
    key: keyof EducationFormEntry,
    value: string | boolean,
  ) => {
    setFormEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = entryToEducationPayload(formEntry);

    if (editingId === "new") {
      // ── ADD ──
      addEducation(payload, {
        onSuccess: (res) => {
          if (res.success) closeForm();
        },
      });
    } else if (editingId) {
      // ── EDIT ──
      editEducation(
        { educationId: editingId, ...payload },
        {
          onSuccess: (res) => {
            if (res.success) closeForm();
          },
        },
      );
    }
  };

  const handleDelete = (educationId: string) => {
    setDeletingId(educationId);
    deleteEducation(
      { educationId },
      {
        onSettled: () => setDeletingId(null),
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Education</h3>

        {isOwner && editingId === null && (
          <button
            onClick={openAdd}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Add education"
          >
            <Plus size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {education.length === 0 &&
        editingId === null &&
        (isOwner ? (
          <button
            onClick={openAdd}
            className="text-[13px] text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 italic"
          >
            + Add education
          </button>
        ) : (
          <p className="text-[13px] text-gray-400 italic">
            No education added.
          </p>
        ))}

      {/* ── Existing entries ── */}
      {education.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* First entry — always visible */}
          {editingId === education[0]._id ? (
            <EducationEntryForm
              entry={formEntry}
              index={0}
              isNew={false}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={closeForm}
              onChange={handleChange}
            />
          ) : (
            <EducationEntryDisplay
              edu={education[0]}
              isOwner={isOwner}
              isDeleting={deletingId === education[0]._id}
              onEdit={() => openEdit(education[0])}
              onDelete={() => handleDelete(education[0]._id!)}
            />
          )}

          {/* Remaining entries — animated expand */}
          {hasMore && (
            <div
              className={[
                "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
                expanded ? "max-h-250 opacity-100" : "max-h-0 opacity-0",
              ].join(" ")}
            >
              {education
                .slice(1)
                .map((edu, i) =>
                  editingId === edu._id ? (
                    <EducationEntryForm
                      key={edu._id}
                      entry={formEntry}
                      index={i + 1}
                      isNew={false}
                      isSaving={isSaving}
                      onSave={handleSave}
                      onCancel={closeForm}
                      onChange={handleChange}
                    />
                  ) : (
                    <EducationEntryDisplay
                      key={edu._id}
                      edu={edu}
                      isOwner={isOwner}
                      isDeleting={deletingId === edu._id}
                      onEdit={() => openEdit(edu)}
                      onDelete={() => handleDelete(edu._id!)}
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
                : `See more education (${education.length - 1} more)`}
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
        <div className={education.length > 0 ? "mt-3" : ""}>
          <EducationEntryForm
            entry={formEntry}
            index={education.length}
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
