import { Button } from "@/components/ui/button";
import Link from "next/link";
import LoginForm from "./_components/login-form";

const Page = () => {
  return (
    <>
      {/* Top bar with Log In button */}
      <header className="flex items-center justify-between px-6 py-4 lg:justify-end">
        {/* Mobile brand name */}
        <span className="text-xl font-bold text-primary lg:hidden">postin</span>

        <Button
          asChild
          className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/registration">Sign Up</Link>
        </Button>
      </header>

      {/* Form centered */}
      <div className="flex flex-1 items-center justify-center px-6 py-8 pb-40 md:pb-48">
        <LoginForm />
      </div>
    </>
  );
};

export default Page;
