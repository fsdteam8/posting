import Image from "next/image";
import type { SponsoredAd } from "../mock-data";

export function SponsoredCard({ ads }: { ads: SponsoredAd[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[17px] font-semibold text-foreground">Sponsored</h3>
      {ads.map((ad) => (
        <button
          key={ad.id}
          className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-card"
        >
          <div className="relative size-27.5 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold text-foreground">
              {ad.title}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {ad.subtitle}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
