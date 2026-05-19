"use client";

import { CallScreen } from "@/app/(website)/messenger/_components/call-screen";
import { IncomingCallDialog } from "@/app/(website)/messenger/_components/incoming-call-dialog";
import {
  type CallState,
  useCall,
} from "@/hooks/features/messenger/use-call";
import { useProfile } from "@/hooks/profile/use-profile";
import type { MessengerUser } from "@/types/messenger";
import { createContext, useContext, useMemo } from "react";

interface CallContextValue {
  state: CallState;
  initiateCall: (kind: "audio" | "video", user: MessengerUser) => Promise<void>;
  endCall: () => void;
}

const Ctx = createContext<CallContextValue | null>(null);

interface ProviderProps {
  accessToken: string;
  children: React.ReactNode;
}

export function CallProvider({ accessToken, children }: ProviderProps) {
  const { data: profile } = useProfile(accessToken);

  const me: MessengerUser | null = useMemo(
    () =>
      profile
        ? {
            _id: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            username: profile.username,
            profileImage: profile.profileImage,
            isOnline: profile.isOnline,
          }
        : null,
    [profile],
  );

  const call = useCall({ me, enabled: !!me });

  const value: CallContextValue = useMemo(
    () => ({
      state: call.state,
      initiateCall: call.initiateCall,
      endCall: call.endCall,
    }),
    [call.state, call.initiateCall, call.endCall],
  );

  const showCallScreen =
    call.state.status === "outgoing" ||
    call.state.status === "connecting" ||
    call.state.status === "active";
  const showIncoming = call.state.status === "incoming";

  return (
    <Ctx.Provider value={value}>
      {children}
      {me && (
        <>
          <CallScreen
            key={call.state.roomId || "no-call"}
            open={showCallScreen}
            state={call.state}
            selfUser={me}
            localStream={call.localStream}
            remoteStream={call.remoteStream}
            onEnd={call.endCall}
            onToggleMic={call.toggleMic}
            onToggleCamera={call.toggleCamera}
          />
          <IncomingCallDialog
            open={showIncoming}
            caller={call.state.peer}
            kind={call.state.kind}
            onAccept={call.acceptCall}
            onReject={call.rejectCall}
          />
        </>
      )}
    </Ctx.Provider>
  );
}

export function useGlobalCall(): CallContextValue | null {
  return useContext(Ctx);
}
