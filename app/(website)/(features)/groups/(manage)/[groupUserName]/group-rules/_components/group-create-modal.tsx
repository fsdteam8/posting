"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGroupRule } from "@/hooks/features/groups/api/rules/use-create-group-rule";
import { toast } from "sonner";

const exampleRules = [
  {
    title: "Be kind and courteous",
    description:
      "We're all in this together to create a welcoming environment. Let's treat everyone with respect. Healthy debates are natural, but kindness is required.",
  },
  {
    title: "No hate speech or bullying",
    description:
      "Make sure everyone feels safe. Bullying of any kind isn't allowed, and degrading comments about things like race, religion, culture, sexual orientation, gender or identity will not be tolerated.",
  },
  {
    title: "No promotions or spam",
    description:
      "Give more than you take in this group. Self-promotion, spam and irrelevant links aren't allowed.",
  },
  {
    title: "Respect everyone's privacy",
    description:
      "Being part of this group requires mutual trust. Authentic, expressive discussions make groups great, but may also be sensitive and private. What's shared in the group should stay in the group.",
  },
];

const ruleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(2000),
});

type RuleFormValues = z.infer<typeof ruleFormSchema>;

interface GroupRuleCreateModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  groupUserName: string;
  accessToken: string;
}

export default function GroupRuleCreateModal({
  open = false,
  onOpenChange,
  groupUserName,
  accessToken,
}: GroupRuleCreateModalProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const { mutateAsync: createRule, isPending } = useCreateGroupRule({
    groupId: groupUserName,
    accessToken,
    onSuccess: () => {
      form.reset();
      onOpenChange?.(false);
    },
  });

  const handleExampleRuleClick = (rule: {
    title: string;
    description: string;
  }) => {
    form.setValue("title", rule.title, { shouldValidate: true });
    form.setValue("description", rule.description, { shouldValidate: true });
  };

  const handleSubmit = async (values: RuleFormValues) => {
    const res = await createRule(values);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // handle success
    toast.success(res.message);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange?.(false);
  };

  const isFormValid = form.formState.isValid && !isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md mx-4 rounded-lg bg-white shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Create rule
              </h2>
              <DialogClose className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-4 w-4" />
              </DialogClose>
            </div>

            {/* Content */}
            <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Example Rules */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Example rules
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {exampleRules.map((rule) => (
                    <button
                      key={rule.title}
                      onClick={() => handleExampleRuleClick(rule)}
                      className="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200"
                    >
                      {rule.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Form */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Write your own
                </h3>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-3"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600">
                            Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Be respectful"
                              {...field}
                              className="h-8 text-xs border border-gray-300 rounded-md px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this rule means..."
                              {...field}
                              className="text-xs border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 min-h-16 resize-none"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-lg">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
                className="h-7 px-3 text-xs text-gray-600 hover:bg-gray-100 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={!isFormValid}
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md"
              >
                {isPending ? "Creating..." : "Create rule"}
              </Button>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
