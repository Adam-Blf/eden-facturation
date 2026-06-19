import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ArrowLeft } from "lucide-react";
import { createClient } from "@/shared/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "adambeloucif@gmail.com") {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 flex-col justify-between bg-void p-5 text-white flex">
        <div>
          <div className="font-display font-bold text-xl mb-8">Admin Panel</div>
          <nav className="flex flex-col gap-2">
            <Link href="/admin/analytics" className="text-sm text-bone hover:text-brass transition">Analytics</Link>
            <Link href="/app" className="text-sm text-mist hover:text-bone transition inline-flex items-center gap-2 mt-4">
              <ArrowLeft size={16} /> Retour à l'app
            </Link>
          </nav>
        </div>
        <div>
          <p className="mb-2 truncate text-xs text-white/50">{user.email}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col bg-bone">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}