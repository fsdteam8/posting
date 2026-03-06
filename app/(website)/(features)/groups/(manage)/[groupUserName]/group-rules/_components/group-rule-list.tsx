"use client";

import { useDeleteGroupRule } from "@/hooks/features/groups/api/rules/use-delete-group-rule";
import { useUpdateGroupRule } from "@/hooks/features/groups/api/rules/use-update-group-rule";
import { GroupRule } from "@/types/features/groups";
import { useQueryClient } from "@tanstack/react-query";
import {
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface GroupRulesListProps {
  rules: GroupRule[];
  groupId: string;
  accessToken: string;
  onCreateClick: () => void;
}

const GroupRulesList = ({
  rules,
  groupId,
  accessToken,
  onCreateClick,
}: GroupRulesListProps) => {
  // Sort by `order` ascending and keep local copy for optimistic drag UX
  const [localRules, setLocalRules] = useState<GroupRule[]>(
    [...rules].sort((a, b) => a.order - b.order),
  );

  // Keep localRules in sync when the parent re-fetches
  const prevRulesRef = useRef(rules);
  if (rules !== prevRulesRef.current) {
    prevRulesRef.current = rules;
    setLocalRules([...rules].sort((a, b) => a.order - b.order));
  }

  // ── Drag state ──────────────────────────────────────────────────────────────
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragging, setIsDragging] = useState(false);

  const queryClient = useQueryClient();

  // One mutation instance per rule would be expensive here; we call the hook
  // generically and pass ruleId + order through a wrapper instead.
  // We use a shared "order update" state to show a saving indicator.
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const updateOrderOnServer = async (ruleId: string, newOrder: number) => {
    setSavingOrderId(ruleId);
    try {
      const { baseURL } = await import("@/constants");
      const res = await fetch(`${baseURL}/groups/${groupId}/rules/${ruleId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order: newOrder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update order");
      }
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update order",
      );
      // Revert optimistic update
      setLocalRules([...rules].sort((a, b) => a.order - b.order));
    } finally {
      setSavingOrderId(null);
    }
  };

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
    setIsDragging(true);
  };

  const handleDragEnter = (index: number) => {
    if (dragIndexRef.current === null || dragIndexRef.current === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      resetDragState();
      return;
    }

    // Reorder locally
    const reordered = [...localRules];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Assign new `order` values (1-based, matching position)
    const updated = reordered.map((r, i) => ({ ...r, order: i + 1 }));
    setLocalRules(updated);

    // Find rules whose order actually changed and persist each one
    updated.forEach((rule) => {
      const original = localRules.find((r) => r._id === rule._id);
      if (original && original.order !== rule.order) {
        updateOrderOnServer(rule._id, rule.order);
      }
    });

    resetDragState();
  };

  const resetDragState = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
    setIsDragging(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-3">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Group rules</h2>
        <button
          onClick={onCreateClick}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          Create
        </button>
      </div>

      {/* Rules Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        {localRules.map((rule, index) => (
          <RuleRow
            key={rule._id}
            rule={rule}
            index={index}
            groupId={groupId}
            accessToken={accessToken}
            isSavingOrder={savingOrderId === rule._id}
            isDragOver={dragOverIndex === index}
            // drag events
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            onDragEnd={resetDragState}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupRulesList;

// ─── Rule Row ─────────────────────────────────────────────────────────────────

interface RuleRowProps {
  rule: GroupRule;
  index: number;
  groupId: string;
  accessToken: string;
  isSavingOrder: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

const RuleRow = ({
  rule,
  index,
  groupId,
  accessToken,
  isSavingOrder,
  isDragOver,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
}: RuleRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteRule, isPending: isDeleting } = useDeleteGroupRule({
    groupId,
    groupRuleId: rule._id,
    accessToken,
  });

  const handleDelete = () => {
    setMenuOpen(false);
    deleteRule(undefined, {
      onSuccess: () => {
        toast.success("Rule deleted");
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to delete rule");
      },
    });
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={[
          "flex items-start gap-3 px-5 py-4 relative transition-colors duration-150",
          isDragOver ? "bg-blue-50 border-l-2 border-blue-400" : "bg-white",
        ].join(" ")}
      >
        {/* Drag Handle */}
        <div className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 transition-colors">
          {isSavingOrder ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <GripVertical className="w-4 h-4" />
          )}
        </div>

        {/* Rule Number */}
        <span className="text-sm font-semibold text-gray-900 shrink-0 w-4 mt-0.5">
          {index + 1}
        </span>

        {/* Rule Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {rule.title}
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {rule.description}
          </p>
        </div>

        {/* Options Menu Trigger */}
        <div className="relative shrink-0 mt-0.5">
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-20 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {editOpen && (
        <EditRuleForm
          rule={rule}
          groupId={groupId}
          accessToken={accessToken}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
};

// ─── Edit Rule Inline Form ────────────────────────────────────────────────────

interface EditRuleFormProps {
  rule: GroupRule;
  groupId: string;
  accessToken: string;
  onClose: () => void;
}

const EditRuleForm = ({
  rule,
  groupId,
  accessToken,
  onClose,
}: EditRuleFormProps) => {
  const [title, setTitle] = useState(rule.title);
  const [description, setDescription] = useState(rule.description);
  const queryClient = useQueryClient();

  const { mutate: updateRule, isPending } = useUpdateGroupRule({
    groupId,
    groupRuleId: rule._id,
    accessToken,
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    updateRule(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          toast.success("Rule updated");
          queryClient.invalidateQueries({ queryKey: ["group", groupId] });
          onClose();
        },
        onError: (err) => {
          toast.error(err.message ?? "Failed to update rule");
        },
      },
    );
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800">Edit rule</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Rule title"
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Rule description (optional)"
          rows={3}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onClose}
          className="text-sm font-medium text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || !title.trim()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
};
