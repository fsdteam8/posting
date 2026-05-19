"use client";

import { cn } from "@/lib/utils";
import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface ReelPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface ReelPlayerProps {
  src: string;
  poster?: string;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onDoubleTap?: () => void;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export const ReelPlayer = forwardRef<ReelPlayerHandle, ReelPlayerProps>(
  function ReelPlayer(
    { src, poster, isActive, muted, onToggleMute, onDoubleTap },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTapRef = useRef(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [progress, setProgress] = useState(0); // 0..1
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          videoRef.current?.play().catch(() => {});
        },
        pause: () => {
          videoRef.current?.pause();
        },
      }),
      [],
    );

    // Auto play/pause when active changes
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {
            // Autoplay can be blocked. Try once muted.
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }, [isActive]);

    // Sync muted state from prop
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = muted;
    }, [muted]);

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleError = () => {
      setHasError(true);
      setIsBuffering(false);
    };

    const handleLoadedMetadata = () => {
      const video = videoRef.current;
      if (!video) return;
      setDuration(video.duration || 0);
    };

    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;
      setCurrentTime(video.currentTime);
      if (video.duration > 0) {
        setProgress(video.currentTime / video.duration);
      }
    };

    const togglePlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      setShowOverlay(true);
      window.setTimeout(() => setShowOverlay(false), 600);
    }, []);

    const handleTap = useCallback(() => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 280;
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
          tapTimeoutRef.current = null;
        }
        lastTapRef.current = 0;
        onDoubleTap?.();
        return;
      }
      lastTapRef.current = now;
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => {
        togglePlay();
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }, [onDoubleTap, togglePlay]);

    useEffect(() => {
      return () => {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      };
    }, []);

    const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(
        Math.max((event.clientX - rect.left) / rect.width, 0),
        1,
      );
      video.currentTime = ratio * video.duration;
    };

    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        {poster && !isPlaying && progress === 0 && (
          <Image
            src={poster}
            alt="reel thumbnail"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-100"
            priority={isActive}
          />
        )}

        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={handlePlay}
          onPause={handlePause}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
        />

        {/* Tap-capturing layer (sits below action buttons z-index) */}
        <button
          type="button"
          onClick={handleTap}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="absolute inset-0 z-10 cursor-pointer"
        />

        {/* Center play/pause indicator */}
        {showOverlay && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-200">
              {isPlaying ? (
                <Play className="w-8 h-8 text-white fill-white" />
              ) : (
                <Pause className="w-8 h-8 text-white fill-white" />
              )}
            </div>
          </div>
        )}

        {/* Buffering spinner */}
        {isBuffering && !hasError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 pointer-events-none">
            <p className="text-white text-sm px-4 text-center">
              Could not load this reel
            </p>
          </div>
        )}

        {/* Mute toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className={cn(
            "absolute top-3 right-3 z-30 w-10 h-10 rounded-full",
            "bg-black/45 backdrop-blur-sm text-white",
            "flex items-center justify-center cursor-pointer",
            "hover:bg-black/65 transition-colors",
          )}
        >
          {muted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-1 select-none">
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="text-[10px] text-white/80 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] text-white/50 tabular-nums ml-auto">
              {formatTime(duration)}
            </span>
          </div>
          <div
            onClick={handleSeek}
            className="h-1 w-full bg-white/25 rounded-full cursor-pointer overflow-hidden"
          >
            <div
              className="h-full bg-white rounded-full transition-[width] duration-100"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  },
);
