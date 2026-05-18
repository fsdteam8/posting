"use client";

import { Profile } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import {
  Cake,
  Check,
  ChevronDown,
  Heart,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalDetailsCardProps {
  profile: Profile;
  isOwner: boolean;
  accessToken: string;
}

type RelationshipStatus =
  | ""
  | "single"
  | "in_a_relationship"
  | "engaged"
  | "married"
  | "its_complicated";

interface FormState {
  address: string;
  dob: string;
  currentCity: string;
  hometown: string;
  relationshipStatus: RelationshipStatus;
  languages: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS: { value: RelationshipStatus; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "single", label: "Single" },
  { value: "in_a_relationship", label: "In a relationship" },
  { value: "engaged", label: "Engaged" },
  { value: "married", label: "Married" },
  { value: "its_complicated", label: "It's complicated" },
];

const LANGUAGES_LIST = [
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Catalan",
  "Cebuano",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Esperanto",
  "Estonian",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Haitian",
  "Hausa",
  "Hebrew",
  "Hindi",
  "Hmong",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latin",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Maori",
  "Marathi",
  "Mongolian",
  "Nepali",
  "Norwegian",
  "Pashto",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhalese",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Vietnamese",
  "Welsh",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zulu",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDob(dob: string) {
  if (!dob) return null;
  return new Date(dob).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInputValue(dob: string) {
  if (!dob) return "";
  return new Date(dob).toISOString().split("T")[0];
}

function labelForRelationship(val: RelationshipStatus) {
  return RELATIONSHIP_OPTIONS.find((o) => o.value === val)?.label ?? "";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-[13px] text-gray-700 leading-snug">{text}</span>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Language Multi-Select ────────────────────────────────────────────────────

function LanguageSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (langs: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = LANGUAGES_LIST.filter(
    (l) =>
      l.toLowerCase().includes(search.toLowerCase()) && !selected.includes(l),
  );

  const toggle = (lang: string) => {
    onChange(
      selected.includes(lang)
        ? selected.filter((l) => l !== lang)
        : [...selected, lang],
    );
  };

  const remove = (lang: string) => {
    onChange(selected.filter((l) => l !== lang));
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer text-left"
      >
        <span className="text-gray-400 truncate">
          {selected.length === 0
            ? "Select languages..."
            : `${selected.length} selected`}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[11.5px] font-medium px-2 py-0.5 rounded-full"
            >
              {lang}
              <button
                type="button"
                onClick={() => remove(lang)}
                className="hover:text-blue-800 transition-colors bg-transparent border-0 p-0 cursor-pointer leading-none"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="flex-1 text-[12.5px] text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Options */}
          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12.5px] text-gray-400 italic">
                No results
              </li>
            ) : (
              filtered.map((lang) => (
                <li key={lang}>
                  <button
                    type="button"
                    onClick={() => toggle(lang)}
                    className="w-full text-left px-3 py-1.5 text-[12.5px] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    {lang}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Relationship Dropdown ────────────────────────────────────────────────────

function RelationshipSelect({
  value,
  onChange,
}: {
  value: RelationshipStatus;
  onChange: (v: RelationshipStatus) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RelationshipStatus)}
        className={`${inputCls} appearance-none pr-8 cursor-pointer`}
      >
        {RELATIONSHIP_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PersonalDetailsCard({
  profile,
  isOwner,
  accessToken,
}: PersonalDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const buildForm = (): FormState => ({
    address: profile.address ?? "",
    dob: toDateInputValue(profile.dob),
    currentCity: profile.currentCity ?? "",
    hometown: profile.hometown ?? "",
    relationshipStatus:
      (profile.relationshipStatus as RelationshipStatus) ?? "",
    languages: profile.languages ?? [],
  });

  const [form, setForm] = useState<FormState>(buildForm);

  const { mutate, isPending } = useUpdateProfile({ accessToken });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    mutate(
      {
        address: form.address.trim(),
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        currentCity: form.currentCity.trim(),
        hometown: form.hometown.trim(),
        relationshipStatus: form.relationshipStatus,
        languages: form.languages,
      },
      {
        onSuccess: (res) => {
          if (res.success) setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setForm(buildForm());
    setIsEditing(false);
  };

  // Sync form if profile refetches while not editing
  useEffect(() => {
    if (!isEditing) setForm(buildForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const dob = formatDob(profile.dob);
  const hasAny =
    profile.currentCity ||
    profile.address ||
    profile.hometown ||
    dob ||
    profile.relationshipStatus ||
    profile.languages?.length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-bold text-gray-900">
          Personal details
        </h3>

        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Edit personal details"
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
              aria-label="Cancel"
            >
              <X size={14} className="text-gray-400" />
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
              aria-label="Save"
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
        <div className="divide-y divide-gray-50">
          {!hasAny && (
            <p className="text-[13px] text-gray-400 italic py-2">
              {isOwner ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 italic text-[13px]"
                >
                  + Add personal details
                </button>
              ) : (
                "No personal details yet."
              )}
            </p>
          )}
          {profile.currentCity && (
            <DetailRow
              icon={<MapPin size={16} />}
              text={
                <>
                  Lives in{" "}
                  <span className="font-medium">{profile.currentCity}</span>
                </>
              }
            />
          )}
          {profile.hometown && (
            <DetailRow
              icon={<Home size={16} />}
              text={
                <>
                  From <span className="font-medium">{profile.hometown}</span>
                </>
              }
            />
          )}
          {profile.address && (
            <DetailRow
              icon={<MapPin size={16} />}
              text={<span className="font-medium">{profile.address}</span>}
            />
          )}
          {dob && <DetailRow icon={<Cake size={16} />} text={dob} />}
          {profile.relationshipStatus && (
            <DetailRow
              icon={<Heart size={16} />}
              text={
                <span className="font-medium capitalize">
                  {labelForRelationship(
                    profile.relationshipStatus as RelationshipStatus,
                  )}
                </span>
              }
            />
          )}
          {profile.languages?.length > 0 && (
            <DetailRow
              icon={<MessageCircle size={16} />}
              text={profile.languages.join(", ")}
            />
          )}
        </div>
      )}

      {/* ── Edit Mode ── */}
      {isEditing && (
        <div className="flex flex-col gap-3 mt-2">
          <FormField label="Current City">
            <input
              value={form.currentCity}
              onChange={(e) => set("currentCity", e.target.value)}
              placeholder="e.g. New York"
              className={inputCls}
            />
          </FormField>

          <FormField label="Hometown">
            <input
              value={form.hometown}
              onChange={(e) => set("hometown", e.target.value)}
              placeholder="e.g. Los Angeles"
              className={inputCls}
            />
          </FormField>

          <FormField label="Address">
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="e.g. 123 Main St"
              className={inputCls}
            />
          </FormField>

          <FormField label="Date of Birth">
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className={inputCls}
            />
          </FormField>

          <FormField label="Relationship Status">
            <RelationshipSelect
              value={form.relationshipStatus}
              onChange={(v) => set("relationshipStatus", v)}
            />
          </FormField>

          <FormField label="Languages">
            <LanguageSelect
              selected={form.languages}
              onChange={(langs) => set("languages", langs)}
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
