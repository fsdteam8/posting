"use client";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { GroupRule } from "@/types/features/groups";

import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface GroupRulesAccordionProps {
  groupUserName: string;
  accessToken: string;
}

const GroupRulesAccordion = ({
  groupUserName,
  accessToken,
}: GroupRulesAccordionProps) => {
  const { data, isLoading, isError } = useGetSingleGroup({
    username: groupUserName,
    accessToken,
  });

  // Hide while loading or on error
  if (isLoading || isError || !data?.success) return null;

  const rules = data.data.rules;

  // Hide entirely if no rules
  if (!rules || rules.length === 0) return null;

  return <RulesAccordion rules={rules} />;
};

export default GroupRulesAccordion;

// ─── Inner accordion (receives sorted rules) ─────────────────────────────────

const RulesAccordion = ({ rules }: { rules: GroupRule[] }) => {
  const sorted = [...rules].sort((a, b) => a.order - b.order);
  const [openId, setOpenId] = useState<string | null>(sorted[0]._id);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="w-full rounded-xl border border-border/50 bg-background p-4 max-w-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/40">
        <h2 className="text-sm font-semibold text-foreground">
          Group rules from the admins
        </h2>
      </div>

      {/* Rules */}
      <div className="divide-y divide-border/40">
        {sorted.map((rule, index) => {
          const isOpen = openId === rule._id;

          return (
            <div key={rule._id}>
              <button
                onClick={() => toggle(rule._id)}
                className="w-full flex items-start gap-3 py-3 text-left hover:opacity-80 transition-opacity duration-100 cursor-pointer"
              >
                <span className="text-sm text-muted-foreground shrink-0 w-4 mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground leading-snug">
                  {rule.title}
                </span>
                <span className="shrink-0 mt-0.5 text-muted-foreground">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {isOpen && rule.description && (
                <div className="flex items-start gap-3 pb-3">
                  <span className="shrink-0 w-4" />
                  <div className="flex-1 flex items-start justify-between gap-3">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {rule.description}
                    </p>
                    <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
