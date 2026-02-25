"use client";

import { Button } from "@/components/ui/button";
import { baseURL } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "The code must be 6 digits")
    .regex(/^[0-9]+$/, "The code must contain only numbers"),
});

type OTPSchemaType = z.infer<typeof otpSchema>;

interface Props {
  email: string;
  onVerified: () => void;
}

interface ApiRes {
  success: boolean;
  message: string;
}

const PRIMARY = "#1fa0f3";
const RESEND_SECONDS = 30;

const OTPForm = ({ email, onVerified }: Props) => {
  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const otpValue = useWatch({ control: form.control, name: "otp" }) || "";
  const hasError = !!form.formState.errors.otp?.message;

  const [secondsLeft, setSecondsLeft] = useState<number>(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const canResend = secondsLeft <= 0;

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationKey: ["otp-verify"],
    mutationFn: (body: OTPSchemaType) =>
      fetch(`${baseURL}/auth/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp: body.otp }),
      }).then((res) => res.json()),
    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        form.setError("otp", { message: data.message });
        return;
      }
      toast.success("Code verified. You can now set a new password.");
      onVerified();
    },
    onError: (err) => {
      console.log("otp-verify-error", err);
      toast.error("Server Error");
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationKey: ["otp-resend"],
    mutationFn: () =>
      fetch(`${baseURL}/auth/forget`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((res) => res.json()),
    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      toast.success("Password reset code sent. Please check your email.");
      setSecondsLeft(RESEND_SECONDS);
    },
    onError: (err) => {
      console.log("otp-resend-error", err);
      toast.error("Server Error");
    },
  });

  const handleSubmit = (values: OTPSchemaType) => {
    verifyOtp(values);
  };

  const resendLabel = useMemo(() => {
    return canResend ? "Resend" : `Resend in ${secondsLeft}s`;
  }, [canResend, secondsLeft]);

  return (
    <div className="px-5">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">
          Enter verification code
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a 6-digit code to your email or phone. Enter it below to
          continue.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex flex-col justify-center items-center gap-y-3">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(v) => {
              form.clearErrors("otp");
              form.setValue("otp", v);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} aria-invalid={hasError} />
              <InputOTPSlot index={1} aria-invalid={hasError} />
              <InputOTPSlot index={2} aria-invalid={hasError} />
              <InputOTPSlot index={3} aria-invalid={hasError} />
              <InputOTPSlot index={4} aria-invalid={hasError} />
              <InputOTPSlot index={5} aria-invalid={hasError} />
            </InputOTPGroup>
          </InputOTP>

          <div className="text-center text-sm">
            {hasError ? (
              <p className="text-xs text-red-500 text-center">
                {form.formState.errors.otp?.message}
              </p>
            ) : otpValue === "" ? (
              <>Enter your one-time password.</>
            ) : (
              <>You entered: {otpValue}</>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full h-11 rounded-full font-medium"
          style={{ backgroundColor: PRIMARY }}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <button
              type="button"
              disabled={!canResend || isResending}
              onClick={() => resendOtp()}
              className="font-medium hover:underline transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ color: PRIMARY }}
            >
              {isResending ? "Sending..." : resendLabel}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default OTPForm;
