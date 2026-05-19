"use client";

import type { MessengerUser } from "@/types/messenger";
import { useCallback, useEffect, useRef, useState } from "react";
import { getMessengerSocket, peekMessengerSocket } from "./socket-singleton";

export type CallKind = "audio" | "video";

export type CallStatus =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connecting"
  | "active"
  | "ended";

export interface CallParticipantInfo {
  userId: string;
  firstName: string;
  lastName: string;
  profileImage?: { url?: string };
}

export interface CallState {
  status: CallStatus;
  kind: CallKind;
  /** The remote peer (only for direct calls — group calls aren't surfaced here yet) */
  peer: CallParticipantInfo | null;
  roomId: string | null;
  isInitiator: boolean;
  micOn: boolean;
  cameraOn: boolean;
}

interface CallReceivePayload {
  from: string;
  type: CallKind;
  roomId: string;
  callerInfo?: CallParticipantInfo;
  isGroup?: boolean;
}

interface CallResponsePayload {
  from: string;
  status: "accepted" | "rejected";
  roomId: string;
}

interface CallSignalPayload {
  from: string;
  signal:
    | { sdp: RTCSessionDescriptionInit }
    | { candidate: RTCIceCandidateInit };
  roomId: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
};

interface UseCallParams {
  me: MessengerUser | null;
  enabled: boolean;
}

const INITIAL_STATE: CallState = {
  status: "idle",
  kind: "audio",
  peer: null,
  roomId: null,
  isInitiator: false,
  micOn: true,
  cameraOn: true,
};

export function useCall({ me, enabled }: UseCallParams) {
  const [state, setState] = useState<CallState>(INITIAL_STATE);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const stateRef = useRef<CallState>(state);
  stateRef.current = state;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function stopLocalStream() {
    setLocalStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }

  const closePc = useCallback(() => {
    const pc = pcRef.current;
    if (!pc) return;
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.oniceconnectionstatechange = null;
    pc.onconnectionstatechange = null;
    try {
      pc.close();
    } catch {
      /* noop */
    }
    pcRef.current = null;
  }, []);

  const teardown = useCallback(() => {
    closePc();
    stopLocalStream();
    remoteStreamRef.current = null;
    setRemoteStream(null);
    pendingIceRef.current = [];
    setState(INITIAL_STATE);
  }, [closePc]);

  const getOrCreateRemoteStream = useCallback((): MediaStream => {
    if (!remoteStreamRef.current) {
      remoteStreamRef.current = new MediaStream();
      setRemoteStream(remoteStreamRef.current);
    }
    return remoteStreamRef.current;
  }, []);

  const createPeerConnection = useCallback((): RTCPeerConnection => {
    closePc();
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.ontrack = (e) => {
      const stream = getOrCreateRemoteStream();
      e.streams[0]?.getTracks().forEach((t) => {
        if (!stream.getTracks().some((existing) => existing.id === t.id)) {
          stream.addTrack(t);
        }
      });
    };
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const s = stateRef.current;
      if (!s.peer || !s.roomId) return;
      const socket = peekMessengerSocket();
      if (!socket) return;
      socket.emit("call:signal", {
        to: s.peer.userId,
        roomId: s.roomId,
        signal: { candidate: e.candidate.toJSON() },
      });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setState((p) => ({ ...p, status: "active" }));
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        // Let the user decide; or treat as ended
      }
    };
    pcRef.current = pc;
    return pc;
  }, [closePc, getOrCreateRemoteStream]);

  async function acquireLocalStream(kind: CallKind): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: kind === "video",
    });
    setLocalStream(stream);
    return stream;
  }

  async function flushPendingIce() {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) return;
    while (pendingIceRef.current.length > 0) {
      const c = pendingIceRef.current.shift()!;
      try {
        await pc.addIceCandidate(c);
      } catch (err) {
        console.warn("[Call] addIceCandidate failed", err);
      }
    }
  }

  // ── Outgoing call ────────────────────────────────────────────────────────
  const initiateCall = useCallback(
    async (kind: CallKind, peer: MessengerUser) => {
      if (!me || !enabled) return;
      const socket = peekMessengerSocket() || getMessengerSocket(me._id);
      if (!socket) return;

      const roomId = `${me._id}-${peer._id}-${Date.now()}`;
      const peerInfo: CallParticipantInfo = {
        userId: peer._id,
        firstName: peer.firstName,
        lastName: peer.lastName,
        profileImage: peer.profileImage,
      };
      const callerInfo: CallParticipantInfo = {
        userId: me._id,
        firstName: me.firstName,
        lastName: me.lastName,
        profileImage: me.profileImage,
      };

      setState({
        status: "outgoing",
        kind,
        peer: peerInfo,
        roomId,
        isInitiator: true,
        micOn: true,
        cameraOn: kind === "video",
      });

      try {
        await acquireLocalStream(kind);
      } catch (err) {
        console.error("[Call] getUserMedia failed", err);
        alert("Couldn't access your microphone/camera.");
        teardown();
        return;
      }

      socket.emit("call:initiate", {
        to: peer._id,
        type: kind,
        roomId,
        callerInfo,
        isGroup: false,
      });
    },
    [me, enabled, teardown],
  );

  // ── Incoming call accept/reject ──────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    const s = stateRef.current;
    if (!me || s.status !== "incoming" || !s.peer || !s.roomId) return;
    const socket = peekMessengerSocket();
    if (!socket) return;

    setState((p) => ({ ...p, status: "connecting" }));

    let stream: MediaStream;
    try {
      stream = await acquireLocalStream(s.kind);
    } catch (err) {
      console.error("[Call] getUserMedia failed", err);
      alert("Couldn't access your microphone/camera.");
      socket.emit("call:respond", {
        to: s.peer.userId,
        status: "rejected",
        roomId: s.roomId,
      });
      teardown();
      return;
    }

    socket.emit("call:respond", {
      to: s.peer.userId,
      status: "accepted",
      roomId: s.roomId,
    });
    socket.emit("call:join", { roomId: s.roomId });

    const pc = createPeerConnection();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    // Wait for the caller's offer (handled in onSignal below).
  }, [me, teardown, createPeerConnection]);

  const rejectCall = useCallback(() => {
    const s = stateRef.current;
    if (!s.peer || !s.roomId) {
      teardown();
      return;
    }
    const socket = peekMessengerSocket();
    socket?.emit("call:respond", {
      to: s.peer.userId,
      status: "rejected",
      roomId: s.roomId,
    });
    teardown();
  }, [teardown]);

  // ── End call ─────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    const s = stateRef.current;
    const socket = peekMessengerSocket();
    if (socket && s.roomId) {
      socket.emit("call:leave", { roomId: s.roomId });
    }
    teardown();
  }, [teardown]);

  // ── Media toggles ────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    setLocalStream((stream) => {
      if (!stream) return stream;
      const next = !stream.getAudioTracks().some((t) => t.enabled);
      stream.getAudioTracks().forEach((t) => (t.enabled = next));
      setState((p) => ({ ...p, micOn: next }));
      const s = stateRef.current;
      const socket = peekMessengerSocket();
      if (socket && s.roomId) {
        socket.emit("call:toggle-media", {
          roomId: s.roomId,
          audio: next,
          video: s.cameraOn,
        });
      }
      return stream;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setLocalStream((stream) => {
      if (!stream) return stream;
      const tracks = stream.getVideoTracks();
      if (tracks.length === 0) return stream;
      const next = !tracks.some((t) => t.enabled);
      tracks.forEach((t) => (t.enabled = next));
      setState((p) => ({ ...p, cameraOn: next }));
      const s = stateRef.current;
      const socket = peekMessengerSocket();
      if (socket && s.roomId) {
        socket.emit("call:toggle-media", {
          roomId: s.roomId,
          audio: s.micOn,
          video: next,
        });
      }
      return stream;
    });
  }, []);

  // ── Signaling listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !me) return;
    const socket = getMessengerSocket(me._id);

    async function onReceive(payload: CallReceivePayload) {
      const s = stateRef.current;
      if (s.status !== "idle") {
        // Already in a call — auto-reject
        socket.emit("call:respond", {
          to: payload.from,
          status: "rejected",
          roomId: payload.roomId,
        });
        return;
      }
      setState({
        status: "incoming",
        kind: payload.type,
        peer: payload.callerInfo
          ? { ...payload.callerInfo, userId: payload.from }
          : {
              userId: payload.from,
              firstName: "Unknown",
              lastName: "",
            },
        roomId: payload.roomId,
        isInitiator: false,
        micOn: true,
        cameraOn: payload.type === "video",
      });
    }

    async function onResponse(payload: CallResponsePayload) {
      const s = stateRef.current;
      if (!s.isInitiator || s.roomId !== payload.roomId) return;

      if (payload.status === "rejected") {
        teardown();
        return;
      }

      // Accepted — start WebRTC offer
      const pc = createPeerConnection();
      const stream = localStream;
      stream?.getTracks().forEach((t) => pc.addTrack(t, stream));

      socket.emit("call:join", { roomId: s.roomId });
      setState((p) => ({ ...p, status: "connecting" }));

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:signal", {
          to: s.peer!.userId,
          roomId: s.roomId,
          signal: { sdp: offer },
        });
      } catch (err) {
        console.error("[Call] createOffer failed", err);
        endCall();
      }
    }

    async function onSignal(payload: CallSignalPayload) {
      const s = stateRef.current;
      if (s.roomId !== payload.roomId) return;
      let pc = pcRef.current;

      if ("sdp" in payload.signal) {
        const remoteDesc = payload.signal.sdp;
        // Receiver path: we got the offer from caller
        if (remoteDesc.type === "offer") {
          if (!pc) {
            pc = createPeerConnection();
            const stream = localStream;
            stream?.getTracks().forEach((t) => pc!.addTrack(t, stream));
          }
          await pc.setRemoteDescription(remoteDesc);
          await flushPendingIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("call:signal", {
            to: payload.from,
            roomId: s.roomId,
            signal: { sdp: answer },
          });
        } else if (remoteDesc.type === "answer") {
          if (!pc) return;
          await pc.setRemoteDescription(remoteDesc);
          await flushPendingIce();
        }
      } else if ("candidate" in payload.signal) {
        const cand = payload.signal.candidate;
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(cand);
          } catch (err) {
            console.warn("[Call] addIceCandidate failed", err);
          }
        } else {
          pendingIceRef.current.push(cand);
        }
      }
    }

    function onPeerLeft() {
      // Other side hung up — tear down locally
      teardown();
    }

    socket.on("call:receive", onReceive);
    socket.on("call:response", onResponse);
    socket.on("call:signal", onSignal);
    socket.on("call:peer-left", onPeerLeft);

    return () => {
      socket.off("call:receive", onReceive);
      socket.off("call:response", onResponse);
      socket.off("call:signal", onSignal);
      socket.off("call:peer-left", onPeerLeft);
    };
  }, [enabled, me, localStream, teardown, endCall, createPeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePc();
      const ls = localStream;
      ls?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
  };
}
