import Image from "next/image";

export default function BottomIllustration() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 lg:pl-4">
      <Image
        src="/auth/bottom_illustration.png"
        alt=""
        width={320}
        height={240}
        className="h-auto w-56 object-contain opacity-90 md:w-72"
      />
    </div>
  );
}
