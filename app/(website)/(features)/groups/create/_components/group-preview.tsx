"use client";

import { cn } from "@/lib/utils";
import { GroupFormValues } from "@/schemas/features/groups";
import { Lock, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { PRIVACY_OPTIONS } from "./select-option";

interface GroupPreviewProps {
  formData?: Partial<GroupFormValues>;
}

type ViewMode = "desktop" | "mobile";

export function GroupPreview({ formData }: GroupPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  const privacyOption = useMemo(
    () => PRIVACY_OPTIONS.find((opt) => opt.value === formData?.privacy),
    [formData?.privacy],
  );

  const PrivacyIcon = privacyOption?.icon || Lock;

  const isMobile = viewMode === "mobile";

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-white p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {isMobile ? "Mobile" : "Desktop"} Preview
            </h3>
            <p className="text-xs text-muted-foreground">
              How your group will look
            </p>
          </div>
          <div className="flex gap-1">
            {/* Desktop button */}
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={cn(
                "p-2 rounded transition-colors cursor-pointer",
                !isMobile ? "bg-muted" : "bg-muted/50 hover:bg-muted",
              )}
              aria-label="Desktop preview"
            >
              <svg
                className={cn(
                  "h-5 w-5 transition-colors",
                  !isMobile ? "text-foreground" : "text-muted-foreground",
                )}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <path d="M8 21h8" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {/* Mobile button */}
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={cn(
                "p-2 rounded transition-colors cursor-pointer",
                isMobile ? "bg-muted" : "bg-muted/50 hover:bg-muted",
              )}
              aria-label="Mobile preview"
            >
              <svg
                className={cn(
                  "h-5 w-5 transition-colors",
                  isMobile ? "text-foreground" : "text-muted-foreground",
                )}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line
                  x1="12"
                  y1="18"
                  x2="12"
                  y2="18.01"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 overflow-auto bg-muted/20 flex items-start justify-center p-4">
        {/* The "device" frame */}
        <div
          className={cn(
            "bg-white border border-border overflow-hidden transition-all duration-300",
            isMobile
              ? "w-93.75 rounded-[2rem] shadow-xl border-4 border-slate-800 min-h-150"
              : "w-full rounded-lg shadow-sm",
          )}
        >
          {/* Mobile notch */}
          {isMobile && (
            <div className="bg-slate-800 h-6 flex items-center justify-center">
              <div className="w-20 h-1.5 bg-slate-600 rounded-full" />
            </div>
          )}

          <div className="flex flex-col">
            {/* Cover Image */}
            <div
              className={cn(
                "relative bg-linear-to-br from-slate-200 to-slate-300 border-b border-border overflow-hidden",
                isMobile ? "h-32" : "h-48",
              )}
            >
              {formData?.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(formData.coverImage)}
                  alt="Group cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-slate-300 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-500">Group cover</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className={cn(
                "flex-1 space-y-4",
                isMobile ? "p-4" : "p-6 space-y-6",
              )}
            >
              {/* Group Header */}
              <div>
                <h1
                  className={cn(
                    "font-bold mb-2",
                    isMobile ? "text-xl" : "text-3xl mb-3",
                    formData?.name
                      ? "text-foreground"
                      : "text-muted-foreground/50",
                  )}
                >
                  {formData?.name || "Group name"}
                </h1>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <PrivacyIcon className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={cn(
                        "font-medium text-foreground",
                        isMobile ? "text-xs" : "text-sm",
                      )}
                    >
                      {privacyOption?.label || "Private"} group
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-muted-foreground",
                        isMobile ? "text-xs" : "text-sm",
                      )}
                    >
                      1 member
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              {formData?.category && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Category
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {formData.category}
                  </div>
                </div>
              )}

              {/* Description */}
              {formData?.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    About
                  </p>
                  <p
                    className={cn(
                      "leading-relaxed text-foreground",
                      isMobile ? "text-xs" : "text-sm",
                    )}
                  >
                    {formData.description}
                  </p>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="border-t border-border pt-4">
                <div className={cn("flex mb-4", isMobile ? "gap-4" : "gap-6")}>
                  <button className="pb-2 border-b-2 border-primary text-xs font-medium text-foreground">
                    About
                  </button>
                  <button className="pb-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Posts
                  </button>
                  <button className="pb-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Members
                  </button>
                </div>

                {/* Post Input */}
                <div className="flex gap-2">
                  <div
                    className={cn(
                      "rounded-full bg-slate-200 shrink-0",
                      isMobile ? "h-8 w-8" : "h-10 w-10",
                    )}
                  />
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className={cn(
                      "flex-1 bg-muted px-4 py-2 rounded-full text-muted-foreground outline-none",
                      isMobile ? "text-xs" : "text-sm",
                    )}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile home bar */}
          {isMobile && (
            <div className="bg-white h-6 flex items-center justify-center border-t border-slate-100">
              <div className="w-24 h-1 bg-slate-300 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
