import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorScreen({
  message,
  onRetry,
  isRefetching,
}: {
  message: string;
  onRetry: () => void;
  isRefetching: boolean;
}) {
  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/40 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 dark:border-red-800 bg-card">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            We couldn&apos;t load your groups
          </p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {message || "Please check your connection and try again."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-3.5 py-2 text-sm font-semibold text-background hover:opacity-90 active:opacity-80 transition-opacity"
            >
              <RefreshCcw
                className={cn("h-4 w-4", isRefetching && "animate-spin")}
              />
              Retry
            </button>

            <button
              type="button"
              onClick={() => navigator?.clipboard?.writeText(message)}
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Copy error
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
