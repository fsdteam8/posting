import Link from "next/link";

export default function AuthFooter() {
  return (
    <footer className="flex justify-end fixed bottom-2 right-5 bg-background px-6 py-3">
      <nav className="flex gap-4">
        <Link
          href="#"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Terms
        </Link>
        <Link
          href="#"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
