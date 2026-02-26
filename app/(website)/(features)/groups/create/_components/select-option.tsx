import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Lock } from "lucide-react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}

export const PRIVACY_OPTIONS = [
  { value: "private", label: "Private", icon: Lock },
  { value: "public", label: "Public", icon: Eye },
] as const;

export const CATEGORY_OPTIONS = [
  "Technology",
  "Business",
  "Health",
  "Entertainment",
  "Sports",
  "Education",
  "Travel",
  "Lifestyle",
  "Science",
  "Gaming",
  "Music",
  "Art",
] as const;

export function PrivacySelect({
  value,
  onValueChange,
  placeholder = "Choose privacy",
}: SelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {PRIVACY_OPTIONS.map((option) => {
          const IconComponent = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = "Select category",
}: SelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_OPTIONS.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
