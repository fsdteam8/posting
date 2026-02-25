"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { baseURL } from "@/constants";
import { maskEmail } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  resetMethod: z.enum(["email", "sms", "password"], {
    error: "Something went wrong",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ResetPasswordFormProps {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  avatarUrl?: string;
  onOtpSent: () => void;
  onReset: () => void;
}

const OTPFindContainer = ({
  userName = "Sarah",
  userEmail = "sarah@domain.com",
  avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
  onOtpSent,
  onReset,
}: ResetPasswordFormProps) => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resetMethod: "email",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["otp-sent"],
    mutationFn: (email: string) =>
      fetch(`${baseURL}/auth/forget`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      }).then((res) => res.json()),
    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // handle success
      toast.success(
        "We’ve sent you a password reset code. Enter it to continue.",
      );
      onOtpSent();
    },
    onError: (err) => {
      console.log("otp-sent-error", err);
      toast.error("Server Error");
    },
  });

  async function onSubmit(values: FormValues) {
    if (values["resetMethod"] === "password") {
      router.replace("/login");
      return;
    } else if (values["resetMethod"] === "email") {
      mutate(userEmail);
    }
  }

  const resetMethods = [
    {
      id: "email",
      title: "Send code via Email",
      description: maskEmail(userEmail),
      icon: Mail,
    },
    // {
    //   id: "sms",
    //   title: "Send code via SMS",
    //   description: userPhone,
    //   icon: MessageSquare,
    // },
    {
      id: "password",
      title: "Enter password to log in",
      description: "Use your existing password",
      icon: Lock,
    },
  ];

  return (
    <div className="px-5">
      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted">
          <Image
            src={avatarUrl}
            alt={userName}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-xs text-muted-foreground">
          Hi <span className="font-semibold">{userName}</span>, choose how you
          would like to log in
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="resetMethod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="space-y-3">
                      {resetMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <label
                            key={method.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all duration-200"
                          >
                            <RadioGroupItem
                              value={method.id}
                              id={method.id}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm font-medium text-foreground">
                                  {method.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {method.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-6"
          >
            Continue {isPending && <Loader2 className="size-5 animate-spin" />}
          </Button>
        </form>
      </Form>

      {/* Footer Link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Not you?{" "}
          <button
            className="text-primary font-medium hover:underline transition-colors cursor-pointer"
            onClick={onReset}
          >
            Use another account
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPFindContainer;

interface ApiRes {
  success: boolean;
  message: string;
}
