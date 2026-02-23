import Image from "next/image";

export default function AuthSidebar() {
  return (
    <aside className="hidden w-[42%] flex-col bg-[#3B9AE8] lg:flex">
      {/* Header text */}
      <div className="px-8 pt-8">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Welcome to Postin</h1>
        <p className="mt-1 text-sm text-[#FFFFFF]/80">
          Connect, share, and discover with your community
        </p>
      </div>

      {/* Hero illustration */}
      <div className="flex flex-1 items-center justify-center px-6">
        <Image
          src="/auth/sidebar.png"
          alt="People connecting through social media"
          width={500}
          height={500}
          className="max-h-[70vh] w-full object-contain"
          priority
        />
      </div>

      {/* Brand logo */}
      <div className="px-8 pb-8">
        <span className="text-3xl font-bold tracking-tight text-[#FFFFFF]">
          postin
        </span>
      </div>
    </aside>
  );
}
