import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "@/components/app/SidebarNav";
import { BrandMark } from "@/components/BrandMark";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-void">
      {/* Sidebar minimaliste high-end */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-paper/10 bg-void p-6 text-ink md:flex">
        <div>
          <Link href="/app" className="block mb-10">
            <BrandMark className="text-brass h-8 w-auto" />
            <p className="code-badge mt-2 text-[10px] opacity-60">system.v1.0</p>
          </Link>
          
          <nav className="space-y-1">
            <SidebarNav />
          </nav>
        </div>

        <div className="border-t border-paper/10 pt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brass/20 flex items-center justify-center text-[10px] font-bold text-brass">
              {user.email?.[0].toUpperCase()}
            </div>
            <p className="truncate text-xs font-medium text-ink opacity-60">{user.email}</p>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-brass transition-all hover:bg-brass/10"
            >
              <LogOut size={14} /> Quitter la session
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col bg-void">
        <header className="flex items-center justify-between border-b border-paper/10 bg-void px-5 py-4 md:hidden">
          <Link href="/app">
            <BrandMark className="text-brass h-6 w-auto" />
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-brass">
              <LogOut size={18} />
            </button>
          </form>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
