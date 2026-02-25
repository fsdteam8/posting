"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { baseURL } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const PRIMARY = "#1fa0f3";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface Props {
  email: string;
  otp: string;
  onSuccess: () => void;
}

const ResetNowForm = ({ email, otp, onSuccess }: Props) => {
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["reset-pass"],
    mutationFn: (password: string) =>
      fetch(`${baseURL}/auth/reset-password`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      }).then((res) => res.json()),
    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      onSuccess();
    },
    onError: (err) => {
      console.log("otp-reset-error", err);
      toast.error("Server Error");
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    mutate(values.password);
  };

  return (
    <div className="px-5">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Create a new password for your account. Make sure it&apos;s at least 8
          characters long.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Enter your new password"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">
                    Confirm new password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Re-enter your new password"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-full font-medium"
            style={{ backgroundColor: PRIMARY }}
          >
            {isPending ? "Updating..." : "Update Password"}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-medium hover:underline transition-colors"
                style={{ color: PRIMARY }}
              >
                Back to login
              </button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ResetNowForm;

interface ApiRes {
  success: boolean;
  message: string;
}
