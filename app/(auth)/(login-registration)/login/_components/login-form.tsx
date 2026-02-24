"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema, LoginValues } from "@/schemas/features/login";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginForm() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: LoginValues) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: data.identifier,
          password: data.password,
        }),
      }).then((res) => res.json()),

    onSuccess: async (data: LoginApiResponse) => {
      // handle error
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // handle success
      await signIn("credentials", {
        data: JSON.stringify({
          id: data.data._id,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          email: data.data.user.email,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          role: data.data.role,
        }),
        redirectTo: "/",
      });
    },
    onError: (error) => {
      console.log("error", error);
    },
  });
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true,
    },
    mode: "onChange",
  });

  function onSubmit(data: LoginValues) {
    mutate(data);
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please sign in to continue
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          {/* Email or Phone */}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Email or Phone
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email or phone number"
                    autoComplete="username"
                    className="h-11 rounded-lg border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Password" />
                </FormControl>

                <div className="mt-2 flex items-center justify-end">
                  {/* <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal text-muted-foreground">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  /> */}

                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            disabled={isPending}
          >
            Sign in {isPending && <Loader2 className="animate-spin size-5" />}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/registration" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}

/* ---------------- Types ---------------- */

type LoginSuccessResponse = {
  success: true;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      isEmailVerified: boolean;
      accountStatus: string;
    };
  };
};

type LoginErrorResponse = {
  success: false;
  message: string;
  errorSources?: {
    path: string;
    message: string;
  }[];
  err?: {
    statusCode?: number;
  };
};

type LoginApiResponse = LoginSuccessResponse | LoginErrorResponse;
