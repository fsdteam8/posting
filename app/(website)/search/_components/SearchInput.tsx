"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  defaultValue?: string;
};

export default function SearchInput({ defaultValue = "" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (newVal.trim()) {
        router.push(`/search?q=${encodeURIComponent(newVal.trim())}&type=all`);
      } else {
        router.push("/search");
      }
    }, 400);
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]"
        size={16}
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search anything"
        className="
          w-full pl-9 pr-4 py-2 rounded-full bg-[#F0F2F5]
          text-sm text-[#1C1E21] placeholder:text-[#65676B]
          border border-transparent focus:outline-none focus:border-[#1877F2]
          transition-colors duration-200
        "
      />
    </div>
  );
}
