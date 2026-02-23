"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const getStrengthColor = (score: number) => {
  if (score <= 1) return "bg-destructive"; // Weak → red
  if (score === 2) return "bg-orange-500"; // Fair → orange
  if (score === 3) return "bg-amber-500"; // Medium → amber
  if (score === 4) return "bg-primary"; // Good → brand color
  return "bg-green-600"; // Strong → green
};

/**
 * Strong password rules:
 * - min 8 chars
 * - at least 1 uppercase, 1 lowercase, 1 number, 1 special
 */
const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must include at least 1 lowercase letter")
  .regex(/[A-Z]/, "Must include at least 1 uppercase letter")
  .regex(/[0-9]/, "Must include at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must include at least 1 special character");

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z
    .date({
      error: "Date of birth is required",
    })
    .refine((d) => d <= new Date(), "Date of birth cannot be in the future")
    .refine((d) => {
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age >= 13;
    }, "You must be at least 13 years old"),
  gender: z.string().min(1, "Please select your gender"),
  email: z
    .string()
    .min(1, "Email or phone number is required")
    .refine(
      (v) => {
        const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        const phoneLike = /^[+]?[\d\s().-]{7,}$/.test(v);
        return emailLike || phoneLike;
      },
      { message: "Enter a valid email or phone number" },
    ),
  password: strongPassword,
});

type RegisterValues = z.infer<typeof registerSchema>;

function getPasswordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5); // 0..5
}

function PasswordStrength({ value }: { value: string }) {
  const score = getPasswordScore(value);
  const labels = ["Very weak", "Weak", "Okay", "Good", "Strong", "Very strong"];
  const label = labels[score] ?? "Very weak";

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Password strength</span>
        <span className={cn(score >= 4 && "text-foreground")}>{label}</span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full bg-muted transition-all duration-300",
              i < score && getStrengthColor(score),
            )}
          />
        ))}
      </div>

      <ul className="text-xs text-muted-foreground space-y-1">
        <li className={cn(value.length >= 8 && "text-foreground")}>
          • At least 8 characters
        </li>
        <li className={cn(/[A-Z]/.test(value) && "text-foreground")}>
          • 1 uppercase letter
        </li>
        <li className={cn(/[a-z]/.test(value) && "text-foreground")}>
          • 1 lowercase letter
        </li>
        <li className={cn(/[0-9]/.test(value) && "text-foreground")}>
          • 1 number
        </li>
        <li className={cn(/[^A-Za-z0-9]/.test(value) && "text-foreground")}>
          • 1 special character
        </li>
      </ul>
    </div>
  );
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      // dateOfBirth is Date in schema; keep undefined until selected
      dateOfBirth: undefined as unknown as Date,
      gender: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const passwordValue = useWatch({
    control: form.control,
    name: "password",
    defaultValue: "",
  });

  function onSubmit(data: RegisterValues) {
    console.log("Registration submitted:", data);
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Create a new Account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please sign in to continue
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First name"
                      className="h-11 rounded-lg border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Surname"
                      className="h-11 rounded-lg border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date of Birth (shadcn Calendar) */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-foreground">
                  Date of Birth
                </FormLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start rounded-lg border-border bg-card text-left font-normal text-card-foreground",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>

                <FormDescription className="text-xs">
                  You must be at least 13 years old.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Gender
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 w-full rounded-lg border-border bg-card text-card-foreground">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email or Phone */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Email or Phone
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email or Phone number"
                    className="h-11 rounded-lg border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password (strong + show/hide + strength meter) */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      autoComplete="new-password"
                      className="h-11 rounded-lg border-border bg-card pr-12 text-card-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>

                <PasswordStrength value={passwordValue ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms text */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {"By creating an account, you agree to our "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>
            {", "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            {", and "}
            <Link href="#" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            {
              ". You may receive updates or notifications, and you can manage your preferences anytime."
            }
          </p>

          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            Sign up
          </Button>
        </form>
      </Form>
    </div>
  );
}
