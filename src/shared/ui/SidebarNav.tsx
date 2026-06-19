"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calculator,
  ShieldCheck,
  Palette,
  CreditCard,
} from "lucide-react";

const ITEMS = [
  { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/factures", label: "Factures", icon: FileText },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/compta", label: "Comptabilité", icon: Calculator },
  { href: "/app/compta/declarations", label: "Déclarations", icon: ShieldCheck },
  { href: "/app/parametres", label: "Branding & infos", icon: Palette },
  { href: "/app/abonnement", label: "Abonnement", icon: CreditCard },
];

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-white/10 text-gold"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
