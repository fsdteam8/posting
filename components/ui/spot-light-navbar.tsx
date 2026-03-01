"use client";

import { cn } from "@/lib/utils";
import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface NavItem {
  label: string;
  href: string;
}

export interface SpotlightNavbarProps {
  items?: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem, index: number) => void;
  defaultActiveIndex?: number;
}

export function SpotlightNavbar({
  items = [
    { label: "Overview", href: "#overview" },
    { label: "Team", href: "#team" },
    { label: "Phases", href: "#phases" },
    { label: "Documents", href: "#documents" },
    { label: "Timeline", href: "#timeline" },
  ],
  className,
  onItemClick,
  defaultActiveIndex = 0,
}: SpotlightNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hoverX] = useState<number | null>(null);

  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
  });

  // Refs for the "light" positions so we can animate them imperatively

  const ambienceX = useRef(0);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(
      `[data-index="${activeIndex}"]`,
    ) as HTMLElement | null;

    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      const left = itemRect.left - navRect.left;
      const width = itemRect.width;

      setUnderlineStyle({ left, width });
    }
  }, [activeIndex]);

  // Handle the "Ambience" (Active Item) Movement
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;

      animate(ambienceX.current, targetX, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty("--ambience-x", `${v}px`);
        },
      });
    }
  }, [activeIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    onItemClick?.(item, index);
  };

  return (
    <div className={cn("relative flex justify-start pt-0", className)}>
      <nav
        ref={navRef}
        className={cn(
          "spotlight-nav spotlight-nav-bg glass-border spotlight-nav-shadow",
          "relative h-11 rounded-full transition-all duration-300 overflow-hidden",
        )}
      >
        {/* Content */}
        <ul className="relative flex items-center h-full px-2 gap-0 z-10">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="relative h-full flex items-center justify-center"
            >
              <a
                href={item.href}
                data-index={idx}
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(item, idx);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-white/30",
                  // Active vs Inactive Text
                  activeIndex === idx
                    ? "text-primary dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* LIGHTING LAYERS 
         We use CSS variables --spotlight-x and --ambience-x updated by JS
      */}

        {/* 1. The Moving Spotlight (Follows Mouse) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-1 opacity-0 transition-opacity duration-300"
          style={{
            opacity: hoverX !== null ? 1 : 0,
            background: `
            radial-gradient(
              120px circle at var(--spotlight-x) 100%, 
              var(--spotlight-color, rgba(0,0,0,0.1)) 0%, 
              transparent 50%
            )
          `,
          }}
        />

        {/* 2. The Active State Ambience (Stays on Active) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full 0.5 z-2 bg-primary"
          style={{
            background: `
                radial-gradient(
                  60px circle at var(--ambience-x) 0%, 
                  var(--ambience-color, rgba(0,0,0,1)) 0%, 
                  transparent 100%
                )
              `,
          }}
        />

        {/* Active Underline */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary rounded-none transition-all duration-300"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
        />

        {/* 3. Bottom Border Track (Subtle) */}
        {/* <div className="absolute bottom-0 left-0 w-full h-px bg-primary dark:bg-white/10 z-0" /> */}
      </nav>

      {/* STYLE BLOCK for Dynamic Colors 
      This allows us to switch the gradient colors cleanly using Tailwind classes 
      without messy inline conditionals.
    */}
      <style jsx>{`
        nav {
          /* Light Mode Colors: Dark Gray/Black lights */
          --spotlight-color: rgba(0, 0, 0, 0.08);
          --ambience-color: rgba(0, 0, 0, 0.8);
        }
        :global(.dark) nav {
          /* Dark Mode Colors: White lights */
          --spotlight-color: rgba(255, 255, 255, 0.15);
          --ambience-color: rgba(255, 255, 255, 1);
        }
      `}</style>
    </div>
  );
}
