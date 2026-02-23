import { Gift } from "lucide-react";

export function BirthdaysCard() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[17px] font-semibold text-foreground">
        Celebrations Today
      </h3>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
          <Gift className="size-5" />
        </span>
        <p className="text-[14px] leading-relaxed text-foreground">
          <span className="font-semibold">Arronfox</span>,{" "}
          <span className="font-semibold">Dylar</span>,{" "}
          <span className="font-semibold">Jassica</span> and{" "}
          <span className="font-semibold text-primary">3 others</span>{" "}
          <span className="text-muted-foreground">have Birthday Today</span>
        </p>
      </div>
    </div>
  );
}
