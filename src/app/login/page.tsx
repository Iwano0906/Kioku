import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--color-paper)] px-4">
      <LoginForm />
    </div>
  );
}
