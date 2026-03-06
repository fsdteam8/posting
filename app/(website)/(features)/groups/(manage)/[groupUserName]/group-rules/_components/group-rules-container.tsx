"use client";
import ErrorScreen from "@/components/shared/screens/error-screen";
import { Button } from "@/components/ui/button";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { FileText, Loader2, Plus } from "lucide-react";
import { User } from "next-auth";
import { useState } from "react";
import GroupRuleCreateModal from "./group-create-modal";
import GroupRulesList from "./group-rule-list";

interface Props {
  groupUserName: string;
  cu: User;
}

const GroupRulesContainer = ({ groupUserName, cu }: Props) => {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetSingleGroup({ username: groupUserName, accessToken: cu.accessToken });

  let content;

  if (isLoading) {
    content = (
      <div className="h-[92vh] flex justify-center items-center">
        <Loader2 className="animate-spin size-5" />
      </div>
    );
  } else if (isError) {
    content = (
      <div>
        <ErrorScreen
          message={error.message}
          onRetry={refetch}
          isRefetching={isRefetching}
        />
      </div>
    );
  } else if (data && data.success) {
    const rules = data.data.rules;

    if (rules.length === 0) {
      content = (
        <div className="h-[92vh] flex justify-center items-center">
          <Empty onButtonClick={() => setOpen((p) => !p)} />
        </div>
      );
    } else {
      content = (
        <GroupRulesList
          rules={rules}
          groupId={groupUserName}
          accessToken={cu.accessToken}
          onCreateClick={() => setOpen((p) => !p)}
        />
      );
    }
  }

  return (
    <>
      {content}
      <GroupRuleCreateModal
        open={open}
        onOpenChange={setOpen}
        accessToken={cu.accessToken}
        groupUserName={groupUserName}
      />
    </>
  );
};

export default GroupRulesContainer;

interface EmptyProps {
  onButtonClick: () => void;
}

const Empty = ({ onButtonClick }: EmptyProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center max-w-sm mx-auto">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-gray-50 border border-gray-200 mb-4">
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
      <h2 className="text-sm font-semibold text-gray-900 mb-1">No rules yet</h2>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Set up to 10 rules to define your group&apos;s tone and prevent
        conflicts.
      </p>
      <Button
        onClick={onButtonClick}
        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-150 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add first rule
      </Button>
    </div>
  );
};
