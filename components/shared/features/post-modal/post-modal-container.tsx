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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { useProfile } from "@/hooks/profile/use-profile";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BarChart3,
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Smile,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { MediaFile, MediaUploader } from "./media-uploader";
import { MAX_CHARS } from "./rich-text-editor";
const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
});

// Add this import at the top
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateGroupPost } from "@/hooks/features/groups/api/use-create-group-post";
import { useEditPost } from "@/hooks/features/groups/posts/api/use-edit-post";
import { GroupUser } from "@/types/features/groups";
import { Post } from "@/types/features/posts";
import {
  ACTIVITY_CATEGORIES,
  FeelingActivity,
  FeelingActivityPicker,
  FEELINGS,
} from "./feeling-activity-picker";
import { TagPeoplePicker } from "./tag-people-picker";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  accessToken: string;
  username: string;
  app: "group" | "page" | "profile";
  initialData?: Post;
  externalOpen?: boolean; // ← add
  onExternalOpenChange?: (v: boolean) => void; // ← add
}

interface GroupTriggerProps {
  accessToken: string;
  onOpen?: () => void;
  onAnonymousCall?: () => void;
  onFeelingTrigger?: () => void;
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
// ─── Schema ──────────────────────────────────────────────────────────────────

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty.")
    .max(MAX_CHARS, `Post cannot exceed ${MAX_CHARS} characters.`),
  visibility: z.enum(["public", "members", "private"], {
    error: "Please select who can see this post.",
  }),
  isAnonymous: z.boolean(),
  media: z.array(z.custom<MediaFile>()),
  feelingActivity: z.custom<FeelingActivity>().nullable(),
  taggedUsers: z.array(z.custom<GroupUser>()),
});

type PostFormValues = z.infer<typeof postSchema>;

const GroupTrigger = ({
  accessToken,
  onOpen,
  onAnonymousCall,
  onFeelingTrigger,
}: GroupTriggerProps) => {
  const { data: profile } = useProfile(accessToken);

  const USER = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : "...",
    avatarUrl: profile?.profileImage?.url,
  };

  console.log(USER);

  return (
    <Card className="p-2 pt-5">
      <div className="px-5 py-0">
        <div className="flex items-center gap-x-2">
          {USER.avatarUrl ? (
            <Image
              src={USER.avatarUrl}
              width={40}
              height={40}
              alt={USER.name}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-fb-blue to-[#6a3cb5] shrink-0" />
          )}
          <Button
            variant="secondary"
            className="bg-slate-100 hover:bg-gray-200 flex-1 rounded-full"
            onClick={onOpen}
          >
            Write something...
          </Button>
        </div>
      </div>
      <div className="border-t border-fb-divider p-3 pb-0">
        <div className="flex justify-between">
          <Button
            variant="secondary"
            className="bg-transparent flex-1 hover:bg-gray-200 transition-colors duration-300"
            onClick={onAnonymousCall}
          >
            <UserPlus className="w-5 h-5 text-[#45bd62]" />
            <span className="text-[13px] sm:text-[15px] font-semibold text-fb-text-secondary">
              Anonymous post
            </span>
          </Button>
          <Button
            variant="secondary"
            className="bg-transparent flex-1 hover:bg-gray-200 transition-colors duration-300"
            onClick={onFeelingTrigger}
          >
            <Smile className="w-5 h-5 text-[#f7b928]" />
            <span className="text-[13px] sm:text-[15px] font-semibold text-fb-text-secondary">
              Feeling/activity
            </span>
          </Button>
          <Button
            variant="secondary"
            className="bg-transparent flex-1 hover:bg-gray-200 transition-colors duration-300"
          >
            <BarChart3 className="w-5 h-5 text-[#f5533d]" />
            <span className="text-[13px] sm:text-[15px] font-semibold text-fb-text-secondary">
              Poll
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ─── Visibility icon helper ───────────────────────────────────────────────────

const visibilityIcons = {
  public: <Globe className="w-3.5 h-3.5" />,
  members: <Users className="w-3.5 h-3.5" />,
  private: <Lock className="w-3.5 h-3.5" />,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PostModalContainer = ({
  accessToken,
  username,
  app,
  initialData,
  externalOpen,
  onExternalOpenChange,
}: Props) => {
  const [photoToolOpen, setPhotoToolOpen] = useState(false);
  const [feelingOpen, setFeelingOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  // In the component, merge external and internal open state:
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onExternalOpenChange ?? setInternalOpen;

  const { data: profile } = useProfile(accessToken);
  const { data, isLoading, isError, error } = useGetSingleGroup({
    username,
    accessToken,
  });

  // Detect edit mode
  const isEditMode = Boolean(initialData);

  const groupId = data?.success ? data.data._id : "";

  const { mutateAsync: createGroupPost } = useCreateGroupPost({
    groupId,
    accessToken,
  });

  const { mutateAsync: editPost } = useEditPost({
    postId: initialData?._id ?? "",
    accessToken,
    groupId,
  });

  const groupPrivacy = data?.data.privacy ?? "private";

  const USER = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : "...",
    avatarUrl: profile?.profileImage?.url,
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      media: [],
      visibility: "public",
      isAnonymous: false,
      content: "",
      feelingActivity: null,
      taggedUsers: [],
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const feelingActivity = useWatch({
    control: form.control,
    name: "feelingActivity",
  });
  const taggedUsers = useWatch({
    control: form.control,
    name: "taggedUsers",
  });

  // Derive fixed visibility for group/page apps
  const fixedVisibility = useMemo(() => {
    if (app === "profile") return null;
    if (!data?.success) return null;
    const group = data.data;
    return group.privacy === "public" ? "public" : "private";
  }, [app, data]);

  // Sync fixed visibility into form when it's determined
  useEffect(() => {
    if (fixedVisibility) {
      form.setValue("visibility", fixedVisibility);
    }
  }, [fixedVisibility, form]);

  // Change onSubmit to branch between create and edit
  const onSubmit = async (values: PostFormValues) => {
    try {
      const formData = new FormData();

      // ── Basic fields ──────────────────────────────────────────────────────
      formData.append("content", values.content);
      formData.append("visibility", values.visibility);
      formData.append("isAnonymous", String(values.isAnonymous));

      // ── Feeling / activity ────────────────────────────────────────────────
      if (values.feelingActivity?.type === "feeling") {
        formData.append("feeling", values.feelingActivity.label);
      } else if (values.feelingActivity?.type === "activity") {
        formData.append("activity", values.feelingActivity.label);
      }

      // ── Tagged users ──────────────────────────────────────────────────────
      values.taggedUsers.forEach((u) => formData.append("tags[]", u._id));

      // ── Media ─────────────────────────────────────────────────────────────
      const newImages = values.media.filter(
        (m) => m.type === "image" && m.file,
      );
      const newVideos = values.media.filter(
        (m) => m.type === "video" && m.file,
      );
      const keptImages = values.media.filter(
        (m) => m.type === "image" && !m.file,
      );
      const keptVideos = values.media.filter(
        (m) => m.type === "video" && !m.file,
      );

      // New image files
      newImages.forEach((m) => formData.append("images", m.file!));

      // Existing image URLs (kept)
      keptImages.forEach((m) => formData.append("images", m.url));

      // New video files
      newVideos.forEach((m) => formData.append("videos", m.file!));

      // Existing video URLs (kept)
      keptVideos.forEach((m) => formData.append("videos", m.url));

      // ── Post type ─────────────────────────────────────────────────────────
      let postType: "text" | "image" | "video" = "text";
      if (values.media.some((m) => m.type === "video")) postType = "video";
      else if (values.media.some((m) => m.type === "image")) postType = "image";
      formData.append("postType", postType);

      // ── Submit ────────────────────────────────────────────────────────────
      if (isEditMode) {
        await editPost(formData);
        toast.success("Post updated!");
      } else {
        formData.append(
          "status",
          groupPrivacy === "private" ? "draft" : "published",
        );
        await createGroupPost(formData);
        toast.success("Post created!");
      }

      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  useEffect(() => {
    if (open && initialData) {
      const existingImages: MediaFile[] = (initialData.images ?? []).map(
        (img) => ({
          id: typeof img === "string" ? img : img._id,
          url: typeof img === "string" ? img : img.url,
          type: "image",
        }),
      );

      const existingVideos: MediaFile[] = (initialData.videos ?? []).map(
        (v) => ({
          id: v.id,
          url: v.url,
          type: "video",
        }),
      );

      form.reset({
        content: initialData.content ?? "",
        visibility:
          (initialData.visibility as PostFormValues["visibility"]) ?? "public",
        isAnonymous: false,
        media: [...existingImages, ...existingVideos],
        feelingActivity: (() => {
          if (initialData.feeling) {
            const found = FEELINGS.find((f) => f.label === initialData.feeling);
            return found ?? null;
          }
          if (initialData.activity) {
            const found = ACTIVITY_CATEGORIES.flatMap((c) => c.items).find(
              (a) => a.label === initialData.activity,
            );
            return found ?? null;
          }
          return null;
        })(),
        // Map tags → GroupUser shape expected by TagPeoplePicker
        taggedUsers: (initialData.tags ?? []).map((tag) => ({
          _id: tag._id,
          firstName: tag.firstName,
          lastName: tag.lastName,
          username: tag.username,
          profileImage: tag.profileImage,
        })),
      });
    }
  }, [open, initialData, form]);

  // ── Dialog content ────────────────────────────────────────────────────────
  let dialogBody: React.ReactNode;

  if (isLoading) {
    dialogBody = (
      <div className="w-full flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  } else if (isError) {
    toast.error(error?.message ?? "Something went wrong.");
    setOpen(false);
  } else if (data?.success) {
    dialogBody = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* User + visibility row */}
          <div className="flex items-center gap-x-3">
            {USER.avatarUrl ? (
              <Image
                src={USER.avatarUrl}
                width={44}
                height={44}
                alt={USER.name}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-linear-to-br from-fb-blue to-[#6a3cb5] shrink-0" />
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="text-sm font-semibold leading-tight">
                  {USER.name}
                </p>
                {feelingActivity && (
                  <>
                    <span className="text-[13px] text-fb-text-secondary font-normal">
                      is
                    </span>
                    <span className="text-base leading-none">
                      {feelingActivity.emoji}
                    </span>
                    <span className="text-[12px] font-normal text-fb-text capitalize">
                      {feelingActivity.type === "feeling"
                        ? `feeling ${feelingActivity.label}`
                        : `${ACTIVITY_CATEGORIES_LABEL[feelingActivity.category!]} ${feelingActivity.label}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => form.setValue("feelingActivity", null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                      title="Click for remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              {/* Visibility selector */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    {app === "profile" ? (
                      // Profile: user can freely select visibility
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-5! min-h-0! text-[11px] px-2 py-0! rounded-full border-gray-300 bg-gray-100 w-fit gap-1 font-medium leading-none shadow-none [&>svg]:w-3 [&>svg]:h-3">
                            <div className="flex items-center gap-1">
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="min-w-0">
                          <SelectItem
                            value="public"
                            className="text-[11px] py-1 px-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3 h-3" /> Public
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="members"
                            className="text-[11px] py-1 px-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" /> Members only
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="private"
                            className="text-[11px] py-1 px-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3" /> Only me
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      // Group/Page: visibility is fixed, just show a badge
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 w-fit text-[11px] font-medium text-fb-text-secondary">
                        {
                          visibilityIcons[
                            field.value as keyof typeof visibilityIcons
                          ]
                        }
                        <span className="capitalize">{field.value}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Rich text editor field */}
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

          <FormField
            control={form.control}
            name="feelingActivity"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    {/* Picker panel */}
                    {feelingOpen && (
                      <div className="border border-fb-divider rounded-xl overflow-hidden shadow-sm">
                        <FeelingActivityPicker
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            setFeelingOpen(false);
                          }}
                          onClose={() => setFeelingOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taggedUsers"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    {field.value.length > 0 && !tagOpen && (
                      <div className="flex items-center gap-1 flex-wrap text-[13px]">
                        <span className="text-fb-text-secondary">— with</span>
                        {field.value.slice(0, 2).map((u, i) => (
                          <span
                            key={u._id}
                            className="font-semibold text-fb-text"
                          >
                            {u.firstName} {u.lastName}
                            {i < Math.min(field.value.length, 2) - 1 ? "," : ""}
                          </span>
                        ))}
                        {field.value.length > 2 && (
                          <span className="text-fb-text-secondary">
                            and{" "}
                            <span className="font-semibold text-fb-text">
                              {field.value.length - 2}+ others
                            </span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Picker panel */}
                    {tagOpen && (
                      <div className="border border-fb-divider rounded-xl overflow-hidden shadow-sm">
                        <TagPeoplePicker
                          accessToken={accessToken}
                          groupUsername={username}
                          value={field.value}
                          onChange={field.onChange}
                          onClose={() => setTagOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Attachments row */}
          <div className="border border-fb-divider rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-fb-text">
              Add to your post
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Add photo/video"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setPhotoToolOpen(true)}
              >
                <ImageIcon className="w-5 h-5 text-[#45bd62]" />
              </button>
              <button
                type="button"
                title="Tag people"
                onClick={() => setTagOpen((p) => !p)}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  taggedUsers.length > 0 ? "bg-blue-100" : "hover:bg-gray-100",
                )}
              >
                <UserPlus
                  className={cn(
                    "w-5 h-5",
                    taggedUsers.length > 0 ? "text-primary" : "text-[#1877f2]",
                  )}
                />
              </button>
              <button
                type="button"
                title="Feeling/activity"
                onClick={() => setFeelingOpen((p) => !p)}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  feelingActivity ? "bg-yellow-100" : "hover:bg-gray-100",
                )}
              >
                <Smile
                  className={cn(
                    "w-5 h-5",
                    feelingActivity ? "text-yellow-500" : "text-[#f7b928]",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Anonymous toggle */}
          <FormField
            control={form.control}
            name="isAnonymous"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors duration-200",
                      field.value ? "bg-primary" : "bg-gray-300",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                        field.value ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      Post anonymously
                    </p>
                    <p className="text-[11px] text-fb-text-secondary">
                      Your name won&apos;t be shown to other members
                    </p>
                  </div>
                </label>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Saving..." : "Posting..."}
              </>
            ) : isEditMode ? (
              "Save changes"
            ) : (
              "Post"
            )}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild className="w-full flex-1">
          {isEditMode ? null : (
            <GroupTrigger
              accessToken={accessToken}
              onOpen={() => setOpen(true)}
              onAnonymousCall={() => {
                setOpen(true);
                form.setValue("isAnonymous", true);
              }}
              onFeelingTrigger={() => {
                setOpen(true);
                setFeelingOpen(true);
              }}
            />
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="border-b border-fb-divider pb-3">
            <DialogTitle className="text-center text-[17px]">
              {isEditMode ? "Edit Post" : "Create Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-1">{dialogBody}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostModalContainer;
