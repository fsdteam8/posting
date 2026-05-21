"use client";

import { useProfile } from "@/hooks/profile/use-profile";
import {
  ProfileFormPayload,
  useUpdateProfileForm,
} from "@/hooks/profile/use-update-profile-form";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "single", label: "Single" },
  { value: "in_a_relationship", label: "In a relationship" },
  { value: "engaged", label: "Engaged" },
  { value: "married", label: "Married" },
  { value: "its_complicated", label: "It's complicated" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "github", label: "GitHub" },
  { value: "pinterest", label: "Pinterest" },
  { value: "snapchat", label: "Snapchat" },
  { value: "twitch", label: "Twitch" },
  { value: "reddit", label: "Reddit" },
  { value: "discord", label: "Discord" },
  { value: "other", label: "Other" },
];

const LANGUAGES_LIST = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani",
  "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan",
  "Chinese (Simplified)", "Chinese (Traditional)", "Croatian", "Czech",
  "Danish", "Dutch", "English", "Estonian", "Finnish", "French", "German",
  "Greek", "Gujarati", "Hebrew", "Hindi", "Hungarian", "Icelandic",
  "Indonesian", "Italian", "Japanese", "Korean", "Latin", "Latvian",
  "Lithuanian", "Malay", "Malayalam", "Marathi", "Mongolian", "Nepali",
  "Norwegian", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian",
  "Russian", "Serbian", "Slovak", "Slovenian", "Spanish", "Swahili",
  "Swedish", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu",
  "Vietnamese", "Welsh",
];

const MAX_BIO = 200;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinkEntry {
  id: string;
  platform: string;
  url: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  dob: string;
  gender: string;
  phone: string;
  website: string;
  address: string;
  currentCity: string;
  hometown: string;
  relationshipStatus: string;
  languages: string[];
  interests: string[];
  hobbies: string[];
  skills: string[];
  socialLinks: SocialLinkEntry[];
  avatarFile: File | null;
  coverFile: File | null;
  avatarPreview: string | null;
  coverPreview: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInputValue(dob: string | undefined) {
  if (!dob) return "";
  return new Date(dob).toISOString().split("T")[0];
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-[12.5px] text-gray-500 mt-0.5">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Backspace" && !draft && values.length > 0) {
              remove(values[values.length - 1]);
            }
          }}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={commit}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-blue-500 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0 shrink-0"
        >
          <Plus size={13} />
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[12px] font-medium px-2.5 py-1 rounded-full"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="hover:text-blue-800 transition-colors bg-transparent border-0 p-0 cursor-pointer leading-none"
                aria-label={`Remove ${v}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguagePicker({
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

  return (
    <div ref={ref} className="relative">
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
          className={`shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[12px] font-medium px-2.5 py-1 rounded-full"
            >
              {lang}
              <button
                type="button"
                onClick={() => onChange(selected.filter((l) => l !== lang))}
                className="hover:text-blue-800 transition-colors bg-transparent border-0 p-0 cursor-pointer leading-none"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
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
          <ul className="max-h-60 overflow-y-auto py-1">
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

function PhotosCard({
  firstName,
  lastName,
  coverPreview,
  avatarPreview,
  onPickCover,
  onClearCover,
  onPickAvatar,
  onClearAvatar,
}: {
  firstName: string;
  lastName: string;
  coverPreview: string | null;
  avatarPreview: string | null;
  onPickCover: (f: File) => void;
  onClearCover: () => void;
  onPickAvatar: (f: File) => void;
  onClearAvatar: () => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handlePick =
    (cb: (f: File) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) cb(file);
      e.target.value = "";
    };

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <header className="px-5 pt-5 pb-3">
        <h2 className="text-[15px] font-bold text-gray-900">Profile photos</h2>
        <p className="text-[12.5px] text-gray-500 mt-0.5">
          Add a cover photo and profile picture. JPG or PNG.
        </p>
      </header>

      {/* Cover photo */}
      <div className="relative h-52 w-full bg-slate-800 overflow-hidden">
        {coverPreview ? (
          <Image
            src={coverPreview}
            alt="Cover preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-900 via-blue-900 to-rose-700" />
        )}

        {/* Cover action buttons — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-800 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0 backdrop-blur-sm shadow-sm"
          >
            <Camera size={13} />
            {coverPreview ? "Change cover" : "Add cover"}
          </button>
          {coverPreview && (
            <button
              type="button"
              onClick={onClearCover}
              className="inline-flex items-center justify-center size-8 rounded-lg bg-white/95 hover:bg-white text-red-500 transition-colors cursor-pointer border-0 backdrop-blur-sm shadow-sm"
              aria-label="Remove cover photo"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handlePick(onPickCover)}
          className="hidden"
        />
      </div>

      {/* Avatar + name row */}
      <div className="relative px-5 pb-5">
        <div className="flex items-end gap-4 -mt-12">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="size-28 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile preview"
                  width={112}
                  height={112}
                  className="size-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="size-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {initials || <Camera size={26} />}
                </div>
              )}
            </div>

            {/* Avatar edit button — bottom right of avatar */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 inline-flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 border-3 border-white text-gray-700 transition-colors cursor-pointer shadow-sm"
              aria-label={
                avatarPreview ? "Change profile picture" : "Add profile picture"
              }
            >
              <Camera size={14} />
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handlePick(onPickAvatar)}
              className="hidden"
            />
          </div>

          {/* Helper text + remove avatar */}
          <div className="flex-1 min-w-0 pb-1 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-gray-800 truncate">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : "Your profile picture"}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Click the camera icon to upload a new photo.
              </p>
            </div>

            {avatarPreview && (
              <button
                type="button"
                onClick={onClearAvatar}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-500 hover:text-red-600 cursor-pointer bg-transparent border-0 p-0 shrink-0"
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface EditProfileClientProps {
  accessToken: string;
}

export function EditProfileClient({ accessToken }: EditProfileClientProps) {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useProfile(accessToken);
  const { mutate, isPending } = useUpdateProfileForm({ accessToken });

  const buildInitialForm = useMemo(
    () => (): FormState => ({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      username: profile?.username ?? "",
      bio: profile?.bio ?? "",
      dob: toDateInputValue(profile?.dob),
      gender: profile?.gender ?? "",
      phone: profile?.phone ?? "",
      website: profile?.website ?? "",
      address: profile?.address ?? "",
      currentCity: profile?.currentCity ?? "",
      hometown: profile?.hometown ?? "",
      relationshipStatus: profile?.relationshipStatus ?? "",
      languages: profile?.languages ?? [],
      interests: profile?.interests ?? [],
      hobbies: profile?.hobbies ?? [],
      skills: profile?.skills ?? [],
      socialLinks:
        profile?.socialLinks?.map((l, i) => ({
          id: String(i),
          platform: l.platform,
          url: l.url,
        })) ?? [],
      avatarFile: null,
      coverFile: null,
      avatarPreview: profile?.profileImage?.url ?? null,
      coverPreview: profile?.coverImage?.url ?? null,
    }),
    [profile],
  );

  const [form, setForm] = useState<FormState>(buildInitialForm);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile && !hydrated) {
      setForm(buildInitialForm());
      setHydrated(true);
    }
  }, [profile, hydrated, buildInitialForm]);

  // Revoke object URLs on unmount/change
  useEffect(() => {
    return () => {
      if (form.avatarPreview?.startsWith("blob:"))
        URL.revokeObjectURL(form.avatarPreview);
      if (form.coverPreview?.startsWith("blob:"))
        URL.revokeObjectURL(form.coverPreview);
    };
  }, [form.avatarPreview, form.coverPreview]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const onPickAvatar = (file: File) => {
    if (form.avatarPreview?.startsWith("blob:"))
      URL.revokeObjectURL(form.avatarPreview);
    setForm((p) => ({
      ...p,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  const onClearAvatar = () => {
    if (form.avatarPreview?.startsWith("blob:"))
      URL.revokeObjectURL(form.avatarPreview);
    setForm((p) => ({ ...p, avatarFile: null, avatarPreview: null }));
  };

  const onPickCover = (file: File) => {
    if (form.coverPreview?.startsWith("blob:"))
      URL.revokeObjectURL(form.coverPreview);
    setForm((p) => ({
      ...p,
      coverFile: file,
      coverPreview: URL.createObjectURL(file),
    }));
  };

  const onClearCover = () => {
    if (form.coverPreview?.startsWith("blob:"))
      URL.revokeObjectURL(form.coverPreview);
    setForm((p) => ({ ...p, coverFile: null, coverPreview: null }));
  };

  const updateLink = (id: string, key: "platform" | "url", value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((l) =>
        l.id === id ? { ...l, [key]: value } : l,
      ),
    }));
  };

  const addLink = () =>
    setForm((p) => ({
      ...p,
      socialLinks: [
        ...p.socialLinks,
        { id: String(Date.now()), platform: "instagram", url: "" },
      ],
    }));

  const removeLink = (id: string) =>
    setForm((p) => ({
      ...p,
      socialLinks: p.socialLinks.filter((l) => l.id !== id),
    }));

  const handleSave = () => {
    const payload: ProfileFormPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      bio: form.bio.trim(),
      dob: form.dob ? new Date(form.dob).toISOString() : "",
      gender: form.gender,
      phone: form.phone.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
      currentCity: form.currentCity.trim(),
      hometown: form.hometown.trim(),
      relationshipStatus: form.relationshipStatus,
      languages: form.languages,
      interests: form.interests,
      hobbies: form.hobbies,
      skills: form.skills,
      socialLinks: form.socialLinks
        .filter((l) => l.platform && l.url.trim())
        .map(({ platform, url }) => ({ platform, url: url.trim() })),
      avatar: form.avatarFile,
      cover: form.coverFile,
    };

    mutate(payload, {
      onSuccess: (res) => {
        if (res.success) router.push("/profile");
      },
    });
  };

  if (isLoading || (!profile && !isError)) {
    return (
      <div className="flex flex-col gap-3">
        {[160, 200, 200, 160, 140, 120].map((h, i) => (
          <div
            key={i}
            className="rounded-2xl bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[400%_100%] animate-[shimmer_1.4s_infinite]"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-10 text-center text-red-500 text-sm bg-white rounded-2xl shadow-sm">
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-200 mx-auto w-full">
      {/* ── Top bar ── */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center size-9 rounded-full hover:bg-gray-100 transition-colors text-gray-500 no-underline shrink-0"
            aria-label="Back to profile"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold text-gray-900 leading-tight">
              Edit profile
            </h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Update your personal information, photos and links.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Save changes
          </button>
        </div>
      </div>

      {/* ── Photos ── */}
      <PhotosCard
        firstName={form.firstName}
        lastName={form.lastName}
        coverPreview={form.coverPreview}
        avatarPreview={form.avatarPreview}
        onPickCover={onPickCover}
        onClearCover={onClearCover}
        onPickAvatar={onPickAvatar}
        onClearAvatar={onClearAvatar}
      />

      {/* ── Basic info ── */}
      <Section title="Basic info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="First name">
            <input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="First name"
              className={inputCls}
            />
          </Field>
          <Field label="Last name">
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Last name"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Username" hint={`facebook.com/${form.username || "your-username"}`}>
          <input
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            placeholder="your-username"
            className={inputCls}
          />
        </Field>

        <Field
          label="Bio"
          hint={
            <span className="flex items-center justify-between gap-2">
              <span>A short description of yourself.</span>
              <span
                className={
                  form.bio.length >= MAX_BIO
                    ? "text-red-400 font-medium"
                    : "text-gray-400 font-medium"
                }
              >
                {form.bio.length}/{MAX_BIO}
              </span>
            </span>
          }
        >
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value.slice(0, MAX_BIO))}
            placeholder="Write something about yourself..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Date of birth">
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Gender">
            <div className="relative">
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={`${inputCls} appearance-none pr-8 cursor-pointer`}
              >
                {GENDER_OPTIONS.map((opt) => (
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
          </Field>
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section title="Contact">
        <Field label="Email" hint="Your email cannot be changed.">
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-100 px-3 py-2">
            <span className="text-[13px] text-gray-400 select-none flex-1 truncate">
              {profile.email}
            </span>
            <span className="text-[10.5px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full shrink-0">
              locked
            </span>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              className={inputCls}
            />
          </Field>
          <Field label="Website">
            <input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://yourwebsite.com"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* ── Places & Personal ── */}
      <Section title="Places & personal details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Current city">
            <input
              value={form.currentCity}
              onChange={(e) => set("currentCity", e.target.value)}
              placeholder="e.g. New York"
              className={inputCls}
            />
          </Field>
          <Field label="Hometown">
            <input
              value={form.hometown}
              onChange={(e) => set("hometown", e.target.value)}
              placeholder="e.g. Los Angeles"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street address"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Relationship status">
            <div className="relative">
              <select
                value={form.relationshipStatus}
                onChange={(e) => set("relationshipStatus", e.target.value)}
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
          </Field>
          <Field label="Languages">
            <LanguagePicker
              selected={form.languages}
              onChange={(langs) => set("languages", langs)}
            />
          </Field>
        </div>
      </Section>

      {/* ── Interests / hobbies / skills ── */}
      <Section
        title="Interests, hobbies & skills"
        description="Press Enter or comma to add a tag."
      >
        <Field label="Interests">
          <ChipInput
            values={form.interests}
            onChange={(v) => set("interests", v)}
            placeholder="e.g. Photography"
          />
        </Field>
        <Field label="Hobbies">
          <ChipInput
            values={form.hobbies}
            onChange={(v) => set("hobbies", v)}
            placeholder="e.g. Hiking"
          />
        </Field>
        <Field label="Skills">
          <ChipInput
            values={form.skills}
            onChange={(v) => set("skills", v)}
            placeholder="e.g. JavaScript"
          />
        </Field>
      </Section>

      {/* ── Social links ── */}
      <Section
        title="Social links"
        description="Add links to your other social profiles."
      >
        {form.socialLinks.length === 0 && (
          <p className="text-[12.5px] text-gray-400 italic">
            No social links yet.
          </p>
        )}

        {form.socialLinks.map((link) => (
          <div key={link.id} className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={link.platform}
                onChange={(e) => updateLink(link.id, "platform", e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 pr-7 py-2 text-[12.5px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer"
                style={{ minWidth: 140 }}
              >
                {PLATFORMS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <input
              value={link.url}
              onChange={(e) => updateLink(link.id, "url", e.target.value)}
              placeholder="https://..."
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => removeLink(link.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-0 shrink-0"
              aria-label="Remove social link"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addLink}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-blue-500 hover:text-blue-700 cursor-pointer bg-transparent border-0 p-0 w-fit font-semibold transition-colors mt-1"
        >
          <Plus size={13} />
          Add social link
        </button>
      </Section>

      {/* ── Education & Work — link out ── */}
      <Section
        title="Education & work"
        description="Manage these from your profile page."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent no-underline"
          >
            Manage education
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent no-underline"
          >
            Manage work
          </Link>
        </div>
      </Section>

      {/* ── Bottom action bar ── */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-end gap-2 sticky bottom-4">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold px-4 py-1.75 rounded-lg transition-colors cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-1.75 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}
