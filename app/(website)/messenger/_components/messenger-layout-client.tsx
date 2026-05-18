"use client";

import { useBlockUser } from "@/hooks/features/messenger/api/use-block-user";
import { useCreateGroupConversation } from "@/hooks/features/messenger/api/use-create-group-conversation";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useLeaveConversation } from "@/hooks/features/messenger/api/use-leave-conversation";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import type { MessengerUser } from "@/types/messenger";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { CallScreen } from "./call-screen";
import { ConfirmDialog } from "./confirm-dialog";
import { ConversationList } from "./conversation-list";
import {
  getMutedSnapshot,
  getNicknamesSnapshot,
  getPinnedSnapshot,
  getServerMutedSnapshot,
  getServerNicknamesSnapshot,
  getServerPinnedSnapshot,
  getServerThemesSnapshot,
  getThemesSnapshot,
  setNicknamesForConversation,
  setTheme,
  subscribeMuted,
  subscribeNicknames,
  subscribePinned,
  subscribeThemes,
  toggleMute,
  writePinned,
} from "./helpers";
import { MessengerProvider } from "./messenger-context";
import { MiniSidebar } from "./mini-sidebar";
import { NewGroupDialog } from "./new-group-dialog";
import { NicknamesDialog } from "./nicknames-dialog";
import { ReportDialog } from "./report-dialog";
import { ThemeDialog } from "./theme-dialog";

interface Props {
  accessToken: string;
  me: MessengerUser;
  children: React.ReactNode;
}

export function MessengerLayoutClient({ accessToken, me, children }: Props) {
  const pathname = usePathname();
  const params = useParams<{ conversationId?: string }>();
  const router = useRouter();

  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newGroupPrefill, setNewGroupPrefill] = useState<MessengerUser[]>([]);
  const [themeOpen, setThemeOpen] = useState(false);
  const [nicknamesOpen, setNicknamesOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState<string | null>(null);
  const [call, setCall] = useState<{
    kind: "audio" | "video";
    user: MessengerUser;
  } | null>(null);

  const [blockTarget, setBlockTarget] = useState<{
    user: MessengerUser;
    conversationId: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Local stores
  const pinnedIds = useSyncExternalStore(
    subscribePinned,
    getPinnedSnapshot,
    getServerPinnedSnapshot,
  );
  const mutedIds = useSyncExternalStore(
    subscribeMuted,
    getMutedSnapshot,
    getServerMutedSnapshot,
  );
  const themes = useSyncExternalStore(
    subscribeThemes,
    getThemesSnapshot,
    getServerThemesSnapshot,
  );
  const nicknames = useSyncExternalStore(
    subscribeNicknames,
    getNicknamesSnapshot,
    getServerNicknamesSnapshot,
  );

  const togglePin = useCallback(
    (id: string) => {
      const next = new Set(pinnedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writePinned(next);
    },
    [pinnedIds],
  );

  const toggleMuteConv = useCallback((id: string) => {
    toggleMute(id);
  }, []);

  const setThemeFor = useCallback((conversationId: string, themeId: string) => {
    setTheme(conversationId, themeId);
  }, []);

  const setNicknamesFor = useCallback(
    (conversationId: string, map: Record<string, string>) => {
      setNicknamesForConversation(conversationId, map);
    },
    [],
  );

  const { data: convData, isLoading: convLoading } = useGetConversations({
    accessToken,
  });
  const conversations = useMemo(() => convData?.data ?? [], [convData]);

  const selectedId = params?.conversationId || null;

  useMessengerSocket({
    userId: me._id,
    activeConversationId: selectedId,
  });

  const hasMissedCall = useMemo(
    () => conversations.some((c) => c.lastMessage?.type === "missed-call"),
    [conversations],
  );

  const showConvList =
    pathname === "/messenger" ||
    pathname.startsWith("/messenger/calls") ||
    pathname.startsWith("/messenger/stories") ||
    pathname.startsWith("/messenger/contacts") ||
    pathname.startsWith("/messenger/favorites") ||
    pathname.startsWith("/messenger/settings") ||
    !!selectedId;

  const createGroup = useCreateGroupConversation({ accessToken });
  const leaveConv = useLeaveConversation({ accessToken });
  const blockUser = useBlockUser({ accessToken });

  const openNewGroup = useCallback((prefill?: MessengerUser[]) => {
    setNewGroupPrefill(prefill ?? []);
    setNewGroupOpen(true);
  }, []);

  const ctxValue = useMemo(
    () => ({
      accessToken,
      me,
      pinnedIds,
      togglePin,
      mutedIds,
      toggleMuteConv,
      themes,
      setThemeFor,
      nicknames,
      setNicknamesFor,
      openNewGroup,
      openTheme: () => setThemeOpen(true),
      openNicknames: () => setNicknamesOpen(true),
      openReport: (subject: string) => setReportSubject(subject),
      openCall: (kind: "audio" | "video", user: MessengerUser) =>
        setCall({ kind, user }),
      requestBlock: (user: MessengerUser, conversationId: string) =>
        setBlockTarget({ user, conversationId }),
      requestDeleteChat: (conversationId: string) =>
        setDeleteTarget(conversationId),
    }),
    [
      accessToken,
      me,
      pinnedIds,
      togglePin,
      mutedIds,
      toggleMuteConv,
      themes,
      setThemeFor,
      nicknames,
      setNicknamesFor,
      openNewGroup,
    ],
  );

  return (
    <MessengerProvider value={ctxValue}>
      <div className="relative flex h-[calc(100vh-56px)] w-full overflow-hidden bg-background">
        <MiniSidebar
          avatarUrl={me.profileImage?.url || ""}
          hasMissedCall={hasMissedCall}
          onCreateClick={() => openNewGroup()}
        />

        {showConvList && (
          <ConversationList
            conversations={conversations}
            meId={me._id}
            selectedId={selectedId}
            pinnedIds={pinnedIds}
            loading={convLoading}
          />
        )}

        {children}

        <ThemeDialog
          open={themeOpen}
          onClose={() => setThemeOpen(false)}
          conversationId={selectedId}
          currentTheme={selectedId ? themes[selectedId] : undefined}
          onSelect={(themeId) => {
            if (selectedId) setThemeFor(selectedId, themeId);
            setThemeOpen(false);
          }}
        />

        <NicknamesDialog
          key={`nick-${selectedId ?? "none"}`}
          open={nicknamesOpen}
          onClose={() => setNicknamesOpen(false)}
          conversation={
            conversations.find((c) => c._id === selectedId) || null
          }
          meId={me._id}
          initialMap={selectedId ? nicknames[selectedId] : undefined}
          onSave={(map) => {
            if (selectedId) setNicknamesFor(selectedId, map);
            setNicknamesOpen(false);
          }}
        />

        <NewGroupDialog
          open={newGroupOpen}
          accessToken={accessToken}
          onClose={() => setNewGroupOpen(false)}
          initialSelected={newGroupPrefill}
          onCreate={async (name, participantIds) => {
            const res = await createGroup.mutateAsync({
              name: name || "New group",
              participantIds,
            });
            if (res?.data?._id) {
              router.push(`/messenger/${res.data._id}`);
            }
            setNewGroupOpen(false);
          }}
        />

        <ReportDialog
          open={!!reportSubject}
          subject={reportSubject || ""}
          onClose={() => setReportSubject(null)}
        />

        <ConfirmDialog
          open={!!blockTarget}
          title={`Block ${blockTarget?.user.firstName ?? ""}?`}
          message="They won't be able to message or call you. You'll also leave this conversation."
          confirmLabel="Block"
          destructive
          loading={blockUser.isPending || leaveConv.isPending}
          onClose={() => setBlockTarget(null)}
          onConfirm={async () => {
            if (!blockTarget) return;
            await blockUser.mutateAsync({ userId: blockTarget.user._id });
            await leaveConv.mutateAsync({
              conversationId: blockTarget.conversationId,
            });
            setBlockTarget(null);
            router.push("/messenger");
          }}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete chat?"
          message="This will remove the conversation from your inbox. You can be re-added if someone messages you again."
          confirmLabel="Delete"
          destructive
          loading={leaveConv.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            await leaveConv.mutateAsync({ conversationId: deleteTarget });
            setDeleteTarget(null);
            router.push("/messenger");
          }}
        />

        <CallScreen
          key={call ? `call-${call.user._id}-${call.kind}` : "no-call"}
          open={!!call}
          user={call?.user || null}
          selfUser={me}
          kind={call?.kind || "audio"}
          onClose={() => setCall(null)}
        />
      </div>
    </MessengerProvider>
  );
}
