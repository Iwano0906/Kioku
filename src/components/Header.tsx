"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-paper)]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-paper)]/80">
      <h1 className="font-heading text-xl tracking-wide text-[var(--color-accent)]">
        Kioku
      </h1>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="text-sm text-[var(--color-ink-light)] underline decoration-dotted underline-offset-4 disabled:opacity-50"
      >
        ログアウト
      </button>
    </header>
  );
}
