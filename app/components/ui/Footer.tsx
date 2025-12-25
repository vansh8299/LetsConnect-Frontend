// app/components/Footer.tsx
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-center text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} LetsConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
