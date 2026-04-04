"use client";

interface Props {
  count: number;
  currentIndex: number;
  progress: number; // 0–100
}

export function StoryProgressBar({ count, currentIndex, progress }: Props) {
  return (
    <div className="flex gap-1 w-full px-3 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-0.75 rounded-full bg-white/40 overflow-hidden"
        >
          <div
            className="h-full bg-white rounded-full transition-none"
            style={{
              width:
                i < currentIndex
                  ? "100%"
                  : i === currentIndex
                    ? `${progress}%`
                    : "0%",
              transition: i === currentIndex ? "width 0.1s linear" : "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}
