"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreatePagePostForm } from "@/hooks/features/pages/use-create-page-post-form";
import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, ImageIcon, Loader2, Smile, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { FeelingActivity } from "./feeling-activity-picker";
import { MediaFile, MediaUploader } from "./media-uploader";
import { MAX_CHARS } from "./rich-text-editor";

const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
});
const FeelingActivityPicker = dynamic(
  () => import("./feeling-activity-picker"),
  { ssr: false },
);

interface Props {
  accessToken: string;
  pageId: string;
}

const ACTIVITY_CATEGORIES_LABEL: Record<string, string> = {
  watching: "Watching",
  eating: "Eating",
  drinking: "Drinking",
  traveling: "Traveling to",
  playing: "Playing",
  listening: "Listening to",
  celebrating: "Celebrating",
  reading: "Reading",
};

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty.")
    .max(MAX_CHARS, `Post cannot exceed ${MAX_CHARS} characters.`),
  media: z.array(z.custom<MediaFile>()),
  feelingActivity: z.custom<FeelingActivity>().nullable(),
});

type PostFormValues = z.infer<typeof postSchema>;

const DEFAULT_VALUES: PostFormValues = {
  content: "",
  media: [],
  feelingActivity: null,
};

interface PageTriggerProps {
  pageName: string;
  pageAvatarUrl?: string;
  onOpen: () => void;
  onPhotoTrigger: () => void;
  onFeelingTrigger: () => void;
}

const PageTrigger = ({
  pageName,
  pageAvatarUrl,
  onOpen,
  onPhotoTrigger,
  onFeelingTrigger,
}: PageTriggerProps) => {
  return (
    <Card className="px-4 py-3 shadow-sm rounded-full hover:bg-muted transition-colors duration-200">
      <div className="flex items-center gap-x-3">
        {pageAvatarUrl ? (
          <Image
            src={pageAvatarUrl}
            width={40}
            height={40}
            alt={pageName}
            className="rounded-full object-cover shrink-0 w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 shrink-0 flex items-center justify-center text-white font-bold">
            {pageName.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          className="flex-1 text-left bg-muted/60 transition-colors duration-200 rounded-full px-4 py-2 text-sm text-muted-foreground"
        >
          Write something as {pageName}…
        </button>

        <div className="flex items-center gap-x-1 shrink-0">
          <button
            type="button"
            title="Feeling/activity"
            onClick={onFeelingTrigger}
            className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
          >
            <Smile className="w-5 h-5 text-yellow-400" />
          </button>
          <button
            type="button"
            title="Add photo/video"
            onClick={onPhotoTrigger}
            className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
          >
            <ImageIcon className="w-5 h-5 text-[#45bd62]" />
          </button>
        </div>
      </div>
    </Card>
  );
};

const PagePostModalContainer = ({ accessToken, pageId }: Props) => {
  const [open, setOpen] = useState(false);
  const [photoToolOpen, setPhotoToolOpen] = useState(false);
  const [feelingOpen, setFeelingOpen] = useState(false);

  const { data: pageData } = useGetPageById({ pageId, accessToken });
  const page = pageData?.data;

  const { mutateAsync: createPagePost } = useCreatePagePostForm({
    accessToken,
    pageId,
  });

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const isSubmitting = form.formState.isSubmitting;
  const feelingActivity = useWatch({
    control: form.control,
    name: "feelingActivity",
  });

  const resetAll = useCallback(() => {
    form.reset(DEFAULT_VALUES);
    setPhotoToolOpen(false);
    setFeelingOpen(false);
  }, [form]);

  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) resetAll();
      setOpen(val);
    },
    [resetAll],
  );

  const onSubmit = async (values: PostFormValues) => {
    try {
      const formData = new FormData();
      formData.append("content", values.content);
      formData.append("visibility", "public");

      if (values.feelingActivity?.type === "feeling") {
        formData.append("feeling", values.feelingActivity.label);
      } else if (values.feelingActivity?.type === "activity") {
        formData.append("activity", values.feelingActivity.label);
      }

      const newImages = values.media.filter(
        (m) => m.type === "image" && m.file,
      );
      const newVideos = values.media.filter(
        (m) => m.type === "video" && m.file,
      );

      newImages.forEach((m) => formData.append("images", m.file!));
      newVideos.forEach((m) => formData.append("videos", m.file!));

      let postType: "text" | "image" | "video" = "text";
      if (values.media.some((m) => m.type === "video")) postType = "video";
      else if (values.media.some((m) => m.type === "image")) postType = "image";
      formData.append("postType", postType);
      formData.append("status", "published");

      await createPagePost(formData);
      toast.success("Post created!");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (!page) return null;

  const pageName = page.name;
  const pageAvatarUrl = page.profileImage?.url;

  const dialogBody = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Page identity row */}
        <div className="flex items-center gap-x-3">
          {pageAvatarUrl ? (
            <Image
              src={pageAvatarUrl}
              width={44}
              height={44}
              alt={pageName}
              className="rounded-full object-cover shrink-0 w-11 h-11"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-purple-500 to-blue-500 shrink-0 flex items-center justify-center text-white font-bold">
              {pageName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 flex-wrap">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {pageName}
              </p>
              {feelingActivity && (
                <>
                  <span className="text-[13px] text-muted-foreground font-normal">
                    is
                  </span>
                  <span className="text-base leading-none">
                    {feelingActivity.emoji}
                  </span>
                  <span className="text-[12px] font-normal text-foreground capitalize">
                    {feelingActivity.type === "feeling"
                      ? `feeling ${feelingActivity.label}`
                      : `${ACTIVITY_CATEGORIES_LABEL[feelingActivity.category!]} ${feelingActivity.label}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => form.setValue("feelingActivity", null)}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border w-fit text-[11px] font-medium text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </div>
          </div>
        </div>

        {/* Editor + media */}
        <ScrollArea>
          <div className="space-y-3 max-h-80 pr-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MediaUploader
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={10}
                      maxSizeMB={50}
                      draggerOpen={photoToolOpen}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        {/* Feeling picker (Dialog) */}
        <FormField
          control={form.control}
          name="feelingActivity"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FeelingActivityPicker
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setFeelingOpen(false);
                  }}
                  open={feelingOpen}
                  onClose={() => setFeelingOpen(false)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Attachments row */}
        <div className="border border-border rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Add to your post
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Add photo/video"
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              onClick={() => setPhotoToolOpen(true)}
            >
              <ImageIcon className="w-5 h-5 text-[#45bd62]" />
            </button>
            <button
              type="button"
              title="Feeling/activity"
              onClick={() => setFeelingOpen((p) => !p)}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                feelingActivity
                  ? "bg-yellow-100 dark:bg-yellow-950"
                  : "hover:bg-muted",
              )}
            >
              <Smile
                className={cn(
                  "w-5 h-5",
                  feelingActivity ? "text-yellow-500" : "text-yellow-400",
                )}
              />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={isSubmitting || !form.formState.isDirty}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </form>
    </Form>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className="w-full flex-1">
        <PageTrigger
          pageName={pageName}
          pageAvatarUrl={pageAvatarUrl}
          onOpen={() => handleOpenChange(true)}
          onPhotoTrigger={() => {
            handleOpenChange(true);
            setPhotoToolOpen(true);
          }}
          onFeelingTrigger={() => {
            handleOpenChange(true);
            setFeelingOpen(true);
          }}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-center text-[17px] text-foreground">
            Create Post
          </DialogTitle>
        </DialogHeader>
        <div className="mt-1">{dialogBody}</div>
      </DialogContent>
    </Dialog>
  );
};

export default PagePostModalContainer;
