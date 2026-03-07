"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeelingActivity {
  id: string;
  type: "feeling" | "activity";
  category?: string;
  label: string;
  emoji: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const FEELINGS: FeelingActivity[] = [
  { id: "f1", type: "feeling", label: "happy", emoji: "😊" },
  { id: "f2", type: "feeling", label: "loved", emoji: "🥰" },
  { id: "f3", type: "feeling", label: "sad", emoji: "😢" },
  { id: "f4", type: "feeling", label: "angry", emoji: "😡" },
  { id: "f5", type: "feeling", label: "excited", emoji: "🤩" },
  { id: "f6", type: "feeling", label: "blessed", emoji: "🙏" },
  { id: "f7", type: "feeling", label: "thankful", emoji: "😌" },
  { id: "f8", type: "feeling", label: "amazed", emoji: "😲" },
  { id: "f9", type: "feeling", label: "tired", emoji: "😴" },
  { id: "f10", type: "feeling", label: "sick", emoji: "🤒" },
  { id: "f11", type: "feeling", label: "confused", emoji: "😕" },
  { id: "f12", type: "feeling", label: "nervous", emoji: "😬" },
  { id: "f13", type: "feeling", label: "proud", emoji: "😤" },
  { id: "f14", type: "feeling", label: "motivated", emoji: "💪" },
  { id: "f15", type: "feeling", label: "bored", emoji: "😑" },
  { id: "f16", type: "feeling", label: "silly", emoji: "🤪" },
  { id: "f17", type: "feeling", label: "beautiful", emoji: "🤗" },
  { id: "f18", type: "feeling", label: "cool", emoji: "😎" },
  { id: "f19", type: "feeling", label: "heartbroken", emoji: "💔" },
  { id: "f20", type: "feeling", label: "festive", emoji: "🥳" },
  { id: "f21", type: "feeling", label: "hungry", emoji: "😋" },
  { id: "f22", type: "feeling", label: "stressed", emoji: "😩" },
  { id: "f23", type: "feeling", label: "shocked", emoji: "😳" },
  { id: "f24", type: "feeling", label: "hopeful", emoji: "🌟" },
];

export const ACTIVITY_CATEGORIES: {
  id: string;
  label: string;
  emoji: string;
  items: FeelingActivity[];
}[] = [
  {
    id: "watching",
    label: "Watching",
    emoji: "📺",
    items: [
      {
        id: "a1",
        type: "activity",
        category: "watching",
        label: "a movie",
        emoji: "🎬",
      },
      {
        id: "a2",
        type: "activity",
        category: "watching",
        label: "a TV show",
        emoji: "📺",
      },
      {
        id: "a3",
        type: "activity",
        category: "watching",
        label: "anime",
        emoji: "🗾",
      },
      {
        id: "a4",
        type: "activity",
        category: "watching",
        label: "a documentary",
        emoji: "🎥",
      },
      {
        id: "a5",
        type: "activity",
        category: "watching",
        label: "the game",
        emoji: "🏆",
      },
      {
        id: "a6",
        type: "activity",
        category: "watching",
        label: "YouTube",
        emoji: "▶️",
      },
    ],
  },
  {
    id: "eating",
    label: "Eating",
    emoji: "🍽️",
    items: [
      {
        id: "a7",
        type: "activity",
        category: "eating",
        label: "pizza",
        emoji: "🍕",
      },
      {
        id: "a8",
        type: "activity",
        category: "eating",
        label: "sushi",
        emoji: "🍣",
      },
      {
        id: "a9",
        type: "activity",
        category: "eating",
        label: "breakfast",
        emoji: "🍳",
      },
      {
        id: "a10",
        type: "activity",
        category: "eating",
        label: "lunch",
        emoji: "🥗",
      },
      {
        id: "a11",
        type: "activity",
        category: "eating",
        label: "dinner",
        emoji: "🍜",
      },
      {
        id: "a12",
        type: "activity",
        category: "eating",
        label: "dessert",
        emoji: "🍰",
      },
      {
        id: "a13",
        type: "activity",
        category: "eating",
        label: "fast food",
        emoji: "🍔",
      },
      {
        id: "a14",
        type: "activity",
        category: "eating",
        label: "a snack",
        emoji: "🍿",
      },
    ],
  },
  {
    id: "drinking",
    label: "Drinking",
    emoji: "☕",
    items: [
      {
        id: "a15",
        type: "activity",
        category: "drinking",
        label: "coffee",
        emoji: "☕",
      },
      {
        id: "a16",
        type: "activity",
        category: "drinking",
        label: "tea",
        emoji: "🍵",
      },
      {
        id: "a17",
        type: "activity",
        category: "drinking",
        label: "juice",
        emoji: "🧃",
      },
      {
        id: "a18",
        type: "activity",
        category: "drinking",
        label: "boba",
        emoji: "🧋",
      },
      {
        id: "a19",
        type: "activity",
        category: "drinking",
        label: "wine",
        emoji: "🍷",
      },
      {
        id: "a20",
        type: "activity",
        category: "drinking",
        label: "a smoothie",
        emoji: "🥤",
      },
    ],
  },
  {
    id: "traveling",
    label: "Traveling to",
    emoji: "✈️",
    items: [
      {
        id: "a21",
        type: "activity",
        category: "traveling",
        label: "the beach",
        emoji: "🏖️",
      },
      {
        id: "a22",
        type: "activity",
        category: "traveling",
        label: "the mountains",
        emoji: "🏔️",
      },
      {
        id: "a23",
        type: "activity",
        category: "traveling",
        label: "a new city",
        emoji: "🌆",
      },
      {
        id: "a24",
        type: "activity",
        category: "traveling",
        label: "home",
        emoji: "🏠",
      },
      {
        id: "a25",
        type: "activity",
        category: "traveling",
        label: "abroad",
        emoji: "🌍",
      },
      {
        id: "a26",
        type: "activity",
        category: "traveling",
        label: "on a road trip",
        emoji: "🚗",
      },
    ],
  },
  {
    id: "playing",
    label: "Playing",
    emoji: "🎮",
    items: [
      {
        id: "a27",
        type: "activity",
        category: "playing",
        label: "video games",
        emoji: "🎮",
      },
      {
        id: "a28",
        type: "activity",
        category: "playing",
        label: "chess",
        emoji: "♟️",
      },
      {
        id: "a29",
        type: "activity",
        category: "playing",
        label: "football",
        emoji: "⚽",
      },
      {
        id: "a30",
        type: "activity",
        category: "playing",
        label: "basketball",
        emoji: "🏀",
      },
      {
        id: "a31",
        type: "activity",
        category: "playing",
        label: "tennis",
        emoji: "🎾",
      },
      {
        id: "a32",
        type: "activity",
        category: "playing",
        label: "golf",
        emoji: "⛳",
      },
    ],
  },
  {
    id: "listening",
    label: "Listening to",
    emoji: "🎵",
    items: [
      {
        id: "a33",
        type: "activity",
        category: "listening",
        label: "music",
        emoji: "🎵",
      },
      {
        id: "a34",
        type: "activity",
        category: "listening",
        label: "a podcast",
        emoji: "🎙️",
      },
      {
        id: "a35",
        type: "activity",
        category: "listening",
        label: "an audiobook",
        emoji: "📖",
      },
      {
        id: "a36",
        type: "activity",
        category: "listening",
        label: "the radio",
        emoji: "📻",
      },
    ],
  },
  {
    id: "celebrating",
    label: "Celebrating",
    emoji: "🎉",
    items: [
      {
        id: "a37",
        type: "activity",
        category: "celebrating",
        label: "a birthday",
        emoji: "🎂",
      },
      {
        id: "a38",
        type: "activity",
        category: "celebrating",
        label: "an anniversary",
        emoji: "💑",
      },
      {
        id: "a39",
        type: "activity",
        category: "celebrating",
        label: "a graduation",
        emoji: "🎓",
      },
      {
        id: "a40",
        type: "activity",
        category: "celebrating",
        label: "a promotion",
        emoji: "📈",
      },
      {
        id: "a41",
        type: "activity",
        category: "celebrating",
        label: "a new job",
        emoji: "💼",
      },
      {
        id: "a42",
        type: "activity",
        category: "celebrating",
        label: "a new home",
        emoji: "🏡",
      },
    ],
  },
  {
    id: "reading",
    label: "Reading",
    emoji: "📚",
    items: [
      {
        id: "a43",
        type: "activity",
        category: "reading",
        label: "a book",
        emoji: "📖",
      },
      {
        id: "a44",
        type: "activity",
        category: "reading",
        label: "a comic",
        emoji: "💬",
      },
      {
        id: "a45",
        type: "activity",
        category: "reading",
        label: "the news",
        emoji: "📰",
      },
      {
        id: "a46",
        type: "activity",
        category: "reading",
        label: "a magazine",
        emoji: "📄",
      },
    ],
  },
];

const ALL_ACTIVITIES = ACTIVITY_CATEGORIES.flatMap((c) => c.items);

// ─── View states ──────────────────────────────────────────────────────────────

type View = "home" | "activities" | { categoryId: string };

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeelingActivityPickerProps {
  value: FeelingActivity | null;
  onChange: (val: FeelingActivity | null) => void;
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FeelingActivityPicker = ({
  value,
  onChange,
  open,
  onClose,
}: FeelingActivityPickerProps) => {
  const [view, setView] = useState<View>("home");
  const [search, setSearch] = useState("");

  const currentCategory =
    typeof view === "object"
      ? ACTIVITY_CATEGORIES.find((c) => c.id === view.categoryId)
      : null;

  const filteredFeelings = useMemo(
    () =>
      search
        ? FEELINGS.filter((f) =>
            f.label.toLowerCase().includes(search.toLowerCase()),
          )
        : FEELINGS,
    [search],
  );

  const filteredActivities = useMemo(
    () =>
      search
        ? ALL_ACTIVITIES.filter((a) =>
            a.label.toLowerCase().includes(search.toLowerCase()),
          )
        : [],
    [search],
  );

  const handleSelect = (item: FeelingActivity) => {
    onChange(item);
    onClose();
  };

  const handleBack = () => {
    if (typeof view === "object") {
      setView("activities");
    } else {
      setView("home");
    }
    setSearch("");
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
      // reset internal state when closing
      setTimeout(() => {
        setView("home");
        setSearch("");
      }, 200);
    }
  };

  const title =
    view === "home"
      ? "How are you feeling?"
      : view === "activities"
        ? "What are you doing?"
        : `${currentCategory?.label}`;

  const showBack = view !== "home";
  const showSearch = view === "home" || view === "activities";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex-row items-center gap-2 px-4 py-3 border-b border-border space-y-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-muted transition-colors -ml-1 shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <DialogTitle className="flex-1 text-center text-[15px] font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        {showSearch && (
          <div className="px-4 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  view === "home"
                    ? "Search feelings or activities..."
                    : "Search activities..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-muted rounded-full text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea>
          <div className="max-h-[70vh]">
            {/* ── Home view ── */}
            {view === "home" && (
              <div>
                {/* Search results */}
                {search && (
                  <div className="px-2 py-2">
                    {filteredFeelings.length > 0 && (
                      <>
                        <p className="text-[11px] font-semibold text-muted-foreground px-2 pb-1 uppercase tracking-wide">
                          Feelings
                        </p>
                        {filteredFeelings.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            selected={value?.id === item.id}
                            onSelect={handleSelect}
                          />
                        ))}
                      </>
                    )}
                    {filteredActivities.length > 0 && (
                      <>
                        <p className="text-[11px] font-semibold text-muted-foreground px-2 pt-2 pb-1 uppercase tracking-wide">
                          Activities
                        </p>
                        {filteredActivities.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            selected={value?.id === item.id}
                            onSelect={handleSelect}
                            prefix={
                              ACTIVITY_CATEGORIES.find(
                                (c) => c.id === item.category,
                              )?.label
                            }
                          />
                        ))}
                      </>
                    )}
                    {filteredFeelings.length === 0 &&
                      filteredActivities.length === 0 && (
                        <p className="text-center text-[13px] text-muted-foreground py-6">
                          No results for &quot;{search}&quot;
                        </p>
                      )}
                  </div>
                )}

                {/* Default home */}
                {!search && (
                  <>
                    {/* Feelings grid */}
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[11px] font-semibold text-muted-foreground pb-2 uppercase tracking-wide">
                        Feelings
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {FEELINGS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                              value?.id === item.id
                                ? "bg-blue-50 dark:bg-blue-950 text-primary"
                                : "hover:bg-muted",
                            )}
                          >
                            <span className="text-xl leading-none">
                              {item.emoji}
                            </span>
                            <span className="text-[13px] font-medium capitalize text-foreground">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Activities entry */}
                    <div className="px-4 pt-1 pb-3">
                      <p className="text-[11px] font-semibold text-muted-foreground pb-2 uppercase tracking-wide">
                        Activities
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {ACTIVITY_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setView({ categoryId: cat.id })}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-muted transition-colors"
                          >
                            <span className="text-xl leading-none">
                              {cat.emoji}
                            </span>
                            <span className="text-[13px] font-medium text-foreground">
                              {cat.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Category detail view ── */}
            {typeof view === "object" && currentCategory && (
              <div className="px-2 py-2">
                {currentCategory.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    selected={value?.id === item.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FeelingActivityPicker;
// ─── Item row ─────────────────────────────────────────────────────────────────

const ItemRow = ({
  item,
  selected,
  onSelect,
  prefix,
}: {
  item: FeelingActivity;
  selected: boolean;
  onSelect: (item: FeelingActivity) => void;
  prefix?: string;
}) => (
  <button
    type="button"
    onClick={() => onSelect(item)}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
      selected ? "bg-blue-50 dark:bg-blue-950 text-primary" : "hover:bg-muted",
    )}
  >
    <span className="text-2xl leading-none w-8 text-center">{item.emoji}</span>
    <div>
      {prefix && (
        <p className="text-[10px] text-muted-foreground capitalize">{prefix}</p>
      )}
      <p className="text-[13px] font-medium text-foreground capitalize">
        {item.label}
      </p>
    </div>
  </button>
);
