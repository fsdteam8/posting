import { Clock } from "lucide-react";

const Page = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Clock className="size-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Memories</h1>

        <p className="max-w-md text-sm text-muted-foreground">
          This is the Memories page. Your past posts and highlights will appear
          here.
        </p>
      </div>
    </div>
  );
};

export default Page;
