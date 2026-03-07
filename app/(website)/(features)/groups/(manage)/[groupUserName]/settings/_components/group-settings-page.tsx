"use client";

import AlertModal from "@/components/ui/custom/alert-modal"; // adjust path as needed
import { useDeleteGroup } from "@/hooks/features/groups/api/use-delete-group";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { useUpdateGroup } from "@/hooks/features/groups/api/use-update-group";
import type { Group } from "@/types/features/groups";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AtSign,
  Check,
  CheckSquare,
  ChevronRight,
  Eye,
  FileText,
  Globe,
  Link2,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  Settings,
  Tag,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS } from "../../../../create/_components/select-option";

// ─── Editable subset of Group ─────────────────────────────────────────────────

type EditableGroup = Pick<
  Group,
  | "name"
  | "description"
  | "privacy"
  | "category"
  | "location"
  | "website"
  | "whoCanPost"
  | "postApprovalRequired"
  | "whoCanInvite"
  | "discoverability"
  | "groupUserName"
>;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit: () => void;
}

function FieldRow({ icon, label, value, onEdit }: FieldRowProps) {
  return (
    <button
      onClick={onEdit}
      className="group w-full flex items-center gap-4 px-5 py-4 hover:bg-[#EFF8FF] transition-colors duration-150 text-left border-b border-[#D1EFFE] last:border-b-0"
    >
      <span className="text-[#1fa0f3] shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64b8f5] mb-0.5">
          {label}
        </p>
        <p className="text-sm text-[#0F2B3D] truncate font-medium">
          {value || <span className="text-[#93CAFA] italic">Not set</span>}
        </p>
      </div>
      <ChevronRight
        size={16}
        className="text-[#A8D8FC] group-hover:text-[#1fa0f3] transition-colors shrink-0"
      />
    </button>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  saving?: boolean;
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
  saving,
}: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-[#D1EFFE] last:border-b-0">
      <span className="text-[#1fa0f3] shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F2B3D]">{label}</p>
        <p className="text-xs text-[#64b8f5] mt-0.5">{description}</p>
      </div>
      {saving ? (
        <Loader2 size={18} className="animate-spin text-[#1fa0f3]" />
      ) : (
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
            checked ? "bg-[#1fa0f3]" : "bg-[#BAE0FD]"
          }`}
          aria-checked={checked}
          role="switch"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      )}
    </div>
  );
}

interface SelectRowProps<T extends string> {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
  saving?: boolean;
}

function SelectRow<T extends string>({
  icon,
  label,
  description,
  value,
  options,
  onChange,
  saving,
}: SelectRowProps<T>) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-[#D1EFFE] last:border-b-0">
      <span className="text-[#1fa0f3] shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F2B3D]">{label}</p>
        <p className="text-xs text-[#64b8f5] mt-0.5 mb-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              disabled={saving}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                value === opt.value
                  ? "bg-[#1fa0f3] text-white shadow-sm"
                  : "bg-[#DBEFFE] text-[#1fa0f3] hover:bg-[#BAE0FD]"
              }`}
            >
              {opt.value === value && saving ? (
                <Loader2 size={10} className="inline animate-spin mr-1" />
              ) : null}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inline Edit Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  title: string;
  fieldKey: keyof EditableGroup;
  currentValue: string;
  multiline?: boolean;
  onSave: (key: keyof EditableGroup, value: string) => void;
  onClose: () => void;
  saving: boolean;
  placeholder?: string;
  hint?: string;
}

function EditModal({
  title,
  fieldKey,
  currentValue,
  multiline,
  onSave,
  onClose,
  saving,
  placeholder,
  hint,
}: EditModalProps) {
  const [value, setValue] = useState(currentValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1EFFE]">
          <h3 className="text-base font-bold text-[#0F2B3D]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#93CAFA] hover:text-[#1fa0f3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {multiline ? (
            <textarea
              autoFocus
              rows={4}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm text-[#0F2B3D] placeholder-[#A8D8FC] bg-[#EFF8FF] rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-[#1fa0f3] transition-colors resize-none"
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && onSave(fieldKey, value)}
              className="w-full text-sm text-[#0F2B3D] placeholder-[#A8D8FC] bg-[#EFF8FF] rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-[#1fa0f3] transition-colors"
            />
          )}
          {hint && <p className="text-xs text-[#93CAFA] mt-2">{hint}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F5FBFF] border-t border-[#D1EFFE]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#64b8f5] hover:text-[#1fa0f3] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(fieldKey, value)}
            disabled={saving || value === currentValue}
            className="flex items-center gap-2 px-5 py-2 bg-[#1fa0f3] hover:bg-[#1890dc] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors duration-150"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Modal ───────────────────────────────────────────────────────────

interface CategoryModalProps {
  current: string;
  onSelect: (val: string) => void;
  onClose: () => void;
  saving: boolean;
}

function CategoryModal({
  current,
  onSelect,
  onClose,
  saving,
}: CategoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1EFFE]">
          <h3 className="text-base font-bold text-[#0F2B3D]">
            Select Category
          </h3>
          <button
            onClick={onClose}
            className="text-[#93CAFA] hover:text-[#1fa0f3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = cat === current;
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                disabled={saving}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  isSelected
                    ? "bg-[#1fa0f3] text-white border-[#1fa0f3] shadow-sm"
                    : "bg-[#EFF8FF] text-[#0F2B3D] border-[#D1EFFE] hover:border-[#1fa0f3] hover:text-[#1fa0f3]"
                }`}
              >
                <span>{cat}</span>
                {isSelected &&
                  (saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  ))}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#64b8f5] hover:text-[#1fa0f3] border border-[#D1EFFE] hover:border-[#1fa0f3] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#D1EFFE] bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-[#EFF8FF] border-b border-[#D1EFFE]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1fa0f3]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface GroupSettingsPageProps {
  username: string;
  accessToken: string;
}

export default function GroupSettingsPage({
  username,
  accessToken,
}: GroupSettingsPageProps) {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetSingleGroup({ username, accessToken });

  const group = data?.data;

  const [localSettings, setLocalSettings] = useState<Partial<EditableGroup>>(
    {},
  );
  const [categoryModal, setCategoryModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState<{
    key: keyof EditableGroup;
    title: string;
    multiline?: boolean;
    placeholder?: string;
    hint?: string;
  } | null>(null);
  const [savingField, setSavingField] = useState<keyof EditableGroup | null>(
    null,
  );

  // Sync localSettings when group data loads
  useEffect(() => {
    if (group) {
      setLocalSettings({
        name: group.name,
        description: group.description ?? "",
        privacy: group.privacy,
        category: group.category,
        location: group.location,
        website: group.website,
        whoCanPost: group.whoCanPost,
        postApprovalRequired: group.postApprovalRequired,
        whoCanInvite: group.whoCanInvite,
        discoverability: group.discoverability,
        groupUserName: group.groupUserName,
      });
    }
  }, [group]);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync } = useUpdateGroup({
    groupId: group?._id ?? "",
    accessToken,
  });

  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup({
    groupId: group?._id ?? "",
    accessToken,
  });

  const handleDelete = () => {
    deleteGroup(undefined, {
      onSuccess: (res) => {
        if (res?.success === false) {
          toast.error(res.message);
          return;
        }
        toast.success("Group deleted successfully");
        setDeleteModal(false);
        router.push("/groups");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        toast.error(err.message ?? "Failed to delete group");
      },
    });
  };

  // Merged view: group data + any optimistic local overrides
  const settings = { ...group, ...localSettings } as EditableGroup & {
    name: string;
  };

  const save = async (key: keyof EditableGroup, value: string | boolean) => {
    setSavingField(key);
    try {
      const formData = new FormData();
      formData.append(key, String(value));

      const res = await mutateAsync(formData);
      if (res.success) {
        setLocalSettings((prev) => ({ ...prev, [key]: value }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(["single-group", username], (old: any) =>
          old ? { ...old, data: { ...old.data, [key]: value } } : old,
        );
        setEditModal(null);
      } else {
        toast.error(res.message);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSavingField(null);
    }
  };

  const openEdit = (
    key: keyof EditableGroup,
    title: string,
    multiline?: boolean,
    placeholder?: string,
    hint?: string,
  ) => setEditModal({ key, title, multiline, placeholder, hint });

  const privacyLabel: Record<Group["privacy"], string> = {
    public: "Public — Anyone can see & join",
    private: "Private — Members-only content",
    closed: "Closed — Approval required to join",
  };

  const discoverabilityLabel: Record<Group["discoverability"], string> = {
    visible: "Visible in search",
    hidden: "Hidden from search",
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-[#EFF8FF] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="flex flex-col items-center gap-3 text-[#64b8f5]">
          <Loader2 size={28} className="animate-spin text-[#1fa0f3]" />
          <p className="text-sm font-medium">Loading settings…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (isError || !group) {
    return (
      <div
        className="min-h-screen bg-[#EFF8FF] flex items-center justify-center p-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="w-full max-w-sm bg-white rounded-2xl border border-red-100 shadow-sm p-6 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0F2B3D] mb-1">
            Failed to load settings
          </p>
          <p className="text-xs text-[#64b8f5] mb-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(error as any)?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#1fa0f3] text-white hover:bg-[#1890dc] disabled:opacity-60 transition-colors"
          >
            {isRefetching ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#EFF8FF]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#D1EFFE]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1fa0f3] flex items-center justify-center shadow-sm">
            <Settings size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#0F2B3D] leading-tight">
              Group Settings
            </h1>
            <p className="text-xs text-[#64b8f5]">
              {settings?.name || "Unnamed group"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* ── Basic Info ── */}
        <Section title="Basic Information">
          <FieldRow
            icon={<FileText size={16} />}
            label="Group Name"
            value={settings.name}
            onEdit={() =>
              openEdit("name", "Group Name", false, "e.g. Photography Lovers")
            }
          />
          <FieldRow
            icon={<FileText size={16} />}
            label="Description"
            value={settings.description}
            onEdit={() =>
              openEdit(
                "description",
                "Description",
                true,
                "What is this group about?",
              )
            }
          />
          <FieldRow
            icon={<AtSign size={16} />}
            label="Username"
            value={settings.groupUserName ? `@${settings.groupUserName}` : ""}
            onEdit={() =>
              openEdit(
                "groupUserName",
                "Group Username",
                false,
                "your-group-name",
                "Only lowercase letters, numbers, and hyphens. Used in your group URL.",
              )
            }
          />
          <FieldRow
            icon={<Tag size={16} />}
            label="Category"
            value={settings.category}
            onEdit={() => setCategoryModal(true)}
          />
          <FieldRow
            icon={<MapPin size={16} />}
            label="Location"
            value={settings.location}
            onEdit={() =>
              openEdit("location", "Location", false, "City, Country")
            }
          />
          <FieldRow
            icon={<Link2 size={16} />}
            label="Website"
            value={settings.website}
            onEdit={() =>
              openEdit(
                "website",
                "Website",
                false,
                "https://yourwebsite.com",
                "External link shown on your group profile.",
              )
            }
          />
        </Section>

        {/* ── Privacy & Visibility ── */}
        <Section title="Privacy & Visibility">
          <SelectRow
            icon={<Lock size={16} />}
            label="Privacy"
            description="Control who can see and join this group."
            value={settings.privacy}
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
              { value: "closed", label: "Closed" },
            ]}
            onChange={(val) => save("privacy", val)}
            saving={savingField === "privacy"}
          />
          <div className="px-5 py-3 border-b border-[#D1EFFE] last:border-b-0">
            <p className="text-xs text-[#64b8f5] italic">
              {privacyLabel[settings.privacy]}
            </p>
          </div>

          <SelectRow
            icon={<Eye size={16} />}
            label="Discoverability"
            description="Choose whether this group appears in search results."
            value={settings.discoverability}
            options={[
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ]}
            onChange={(val) => save("discoverability", val)}
            saving={savingField === "discoverability"}
          />
          <div className="px-5 py-3 border-b border-[#D1EFFE] last:border-b-0">
            <p className="text-xs text-[#64b8f5] italic">
              {discoverabilityLabel[settings.discoverability]}
            </p>
          </div>
        </Section>

        {/* ── Posting & Membership ── */}
        <Section title="Posting & Membership">
          <SelectRow
            icon={<Globe size={16} />}
            label="Who Can Post"
            description="Restrict posting to admins only, or allow all members."
            value={settings.whoCanPost}
            options={[
              { value: "anyone", label: "Anyone" },
              { value: "admins", label: "Admins Only" },
            ]}
            onChange={(val) => save("whoCanPost", val)}
            saving={savingField === "whoCanPost"}
          />

          <ToggleRow
            icon={<CheckSquare size={16} />}
            label="Post Approval Required"
            description="All posts must be approved by an admin before they appear."
            checked={settings.postApprovalRequired}
            onChange={(val) => save("postApprovalRequired", val)}
            saving={savingField === "postApprovalRequired"}
          />

          <SelectRow
            icon={<UserPlus size={16} />}
            label="Who Can Invite"
            description="Control who can send invitations to new members."
            value={settings.whoCanInvite}
            options={[
              { value: "anyone", label: "Anyone" },
              { value: "admins", label: "Admins Only" },
            ]}
            onChange={(val) => save("whoCanInvite", val)}
            saving={savingField === "whoCanInvite"}
          />
        </Section>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-100 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-red-50 border-b border-red-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400">
              Danger Zone
            </h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0F2B3D]">
                Delete this group
              </p>
              <p className="text-xs text-[#64b8f5] mt-0.5">
                Permanently remove this group and all its content.
              </p>
            </div>
            <button
              onClick={() => setDeleteModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors shrink-0"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {categoryModal && (
        <CategoryModal
          current={settings.category ?? ""}
          saving={savingField === "category"}
          onClose={() => setCategoryModal(false)}
          onSelect={(val) => {
            save("category", val);
            setCategoryModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModal}
        loading={isDeleting}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action is permanent and cannot be undone."
      />

      {/* Edit Modal */}
      {editModal && (
        <EditModal
          title={editModal.title}
          fieldKey={editModal.key}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentValue={String((settings as any)[editModal.key] ?? "")}
          multiline={editModal.multiline}
          placeholder={editModal.placeholder}
          hint={editModal.hint}
          saving={savingField === editModal.key}
          onClose={() => setEditModal(null)}
          onSave={(key, value) => save(key as keyof EditableGroup, value)}
        />
      )}
    </div>
  );
}
