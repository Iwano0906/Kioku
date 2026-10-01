"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "ログインに失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="polaroid flex w-full max-w-xs flex-col gap-4 rotate-[-1deg]">
      <div className="flex flex-col items-center gap-1 pt-2">
        <span className="text-3xl">📷</span>
        <h1 className="font-heading text-2xl text-[var(--color-accent)]">Kioku</h1>
        <p className="font-body text-xs text-[var(--color-ink-light)]">
          旅の記憶をここに
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-[var(--color-ink)]">
        パスワード
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="rounded-md border border-[var(--color-border)] bg-white/70 px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--color-accent)] py-2 font-body font-medium text-[var(--color-frame)] transition-opacity disabled:opacity-60"
      >
        {submitting ? "確認中..." : "ログイン"}
      </button>
    </form>
  );
}
