"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "一覧", icon: "🖼️" },
  { href: "/upload", label: "追加", icon: "📷" },
  { href: "/tags", label: "タグ", icon: "🏷️" },
  { href: "/map", label: "地図", icon: "🗺️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-[var(--color-border)] bg-[var(--color-frame)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-frame)]/80">
      <ul className="mx-auto flex max-w-xl justify-around">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-body transition-colors ${
                  active
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-ink-light)]"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
