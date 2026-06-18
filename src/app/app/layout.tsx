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
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-forest p-5 text-white md:flex">
        <div>
          <Link href="/app" className="text-white">
            <BrandMark className="text-white" />
          </Link>
          <p className="code-badge mb-8 mt-1 text-[10px] text-brass">// facturation</p>
          <SidebarNav />
        </div>
        <form action="/auth/signout" method="post">
          <p className="mb-2 truncate text-xs text-white/50">{user.email}</p>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col bg-bone">
        <header className="flex items-center justify-between border-b border-hair bg-paper px-5 py-3 md:hidden">
          <Link href="/app" className="text-ink">
            <BrandMark className="text-ink" />
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-mist">
              <LogOut size={18} />
            </button>
          </form>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
