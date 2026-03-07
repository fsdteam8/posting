import { Eye, Globe } from "lucide-react";

const DiscussionAbout = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 max-w-md">
      <h2 className="text-sm font-semibold text-foreground mb-2">About</h2>

      <div className="space-y-1.5 text-[13px] text-muted-foreground leading-snug">
        <p>
          গ্রুপের নিয়ম-কানুন মেনে পোস্ট করুন, অবশ্যই আপনার পোস্ট এপ্রুভ করা
          হবে।
        </p>
        <p>আপনাদের ভালোবাসা নিয়ে অনেকদূর এগিয়ে যেতে চাই।</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-foreground">Public</p>
            <p className="text-[12px] text-muted-foreground leading-snug">
              Anyone can see who&apos;s in the group and what they post.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-foreground">Visible</p>
            <p className="text-[12px] text-muted-foreground leading-snug">
              Anyone can find this group.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionAbout;
