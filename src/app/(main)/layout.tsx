import { requireAuthPage } from "@/lib/auth";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await requireAuthPage();

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
