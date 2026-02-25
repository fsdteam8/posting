import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().min(1, "Please enter an email address or phone number"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess: (email: string) => void;
  isPending: boolean;
}

const FindAccountContainer = ({ onSuccess, isPending }: Props) => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    console.log(values);
    onSuccess(values.email);
  }

  return (
    <div className="px-5">
      {/* Back Button: returns user to previous page (login screen) */}
      <button
        onClick={() => router.back()} // Navigate back in history stack
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors mb-8 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> {/* Back arrow icon */}
        Back to Login
      </button>

      {/* Header: page title + supporting instruction text */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">
          Find Your Account
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter your email address or phone number to reset your password
          security
        </p>
      </div>

      {/* Form: collects email/phone and triggers submit */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Field: email/phone input */}
          <FormField
            control={form.control} // Provide react-hook-form control
            name="email" // Field name in form values
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email or phone" // Hint text for user
                    type="text" // Text input since it accepts phone too
                    className="h-11 rounded-full px-4 bg-muted border-input placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage /> {/* Shows validation error message if any */}
              </FormItem>
            )}
          />

          {/* Submit Button: continues to next step */}
          <Button
            type="submit" // Submit the form
            disabled={isPending} // Replace with loading state when API call added
            className="w-full h-10 rounded-full cursor-pointer font-medium"
          >
            Continue {isPending && <Loader2 className="size-5 animate-spin" />}
            {/* Replace `false` with loading state */}
          </Button>
        </form>
      </Form>

      {/* Help Text: secondary support link */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Need more help?{" "}
          <Link
            href="/support" // Navigate to support page
            className="text-primary font-medium hover:underline transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FindAccountContainer;
