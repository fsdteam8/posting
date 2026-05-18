"use client";

import {
  Flag,
  MoreHorizontal,
  RefreshCw,
  Settings2,
  UserMinus,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ManagedPageRowProps {
  id: string;
  name: string;
  profileImage?: string;
  subtitle?: string;
  actionType: "switch" | "manage";
  isDeactivated?: boolean;
  onSwitch?: (id: string) => void;
  onManage?: (id: string) => void;
  onActivate?: (id: string) => void;
  onViewPage?: (id: string) => void;
  onRemoveSelf?: (id: string) => void;
}

export function ManagedPageRow({
  id,
  name,
  profileImage,
  subtitle,
  actionType,
  isDeactivated,
  onSwitch,
  onManage,
  onActivate,
  onViewPage,
  onRemoveSelf,
}: ManagedPageRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 relative">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
        {profileImage ? (
          <Image
            src={profileImage}
            alt={name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}

        {/* Action Button */}
        {!isDeactivated && (
          <button
            onClick={() =>
              actionType === "switch" ? onSwitch?.(id) : onManage?.(id)
            }
            className="mt-2 flex items-center gap-2 w-full justify-center py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            {actionType === "switch" ? (
              <>
                <RefreshCw size={13} />
                Switch Now
              </>
            ) : (
              <>
                <Settings2 size={13} />
                Manage Now
              </>
            )}
          </button>
        )}
      </div>

      {/* Right side */}
      {isDeactivated ? (
        <button
          onClick={() => onActivate?.(id)}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Activate
        </button>
      ) : (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <MoreHorizontal size={18} className="text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => {
                  onViewPage?.(id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Flag size={16} className="text-gray-500" />
                View Page
              </button>
              <button
                onClick={() => {
                  onRemoveSelf?.(id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserMinus size={16} className="text-gray-500" />
                Remove Yourself From Page
              </button>
            </div>
          )}
        </div>
      )}

      {/* Deactivated badge */}
      {isDeactivated && (
        <div className="absolute bottom-2 left-16 flex items-center gap-1 text-xs text-gray-400">
          {/* Eye slash icon via SVG */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
          Not visible to the public
        </div>
      )}
    </div>
  );
}
