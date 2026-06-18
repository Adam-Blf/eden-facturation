import Link from "next/link";
import InvoiceEditor from "@/components/InvoiceEditor";

export default function FacturationPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-[57px] shrink-0 items-center justify-between bg-forest px-5 text-white">
        <Link href="/" className="font-display text-xl font-bold tracking-wide">
          EDEN
        </Link>
        <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
          <span className="text-gold">Facturation</span>
          <span className="text-white/40">Clients</span>
          <span className="text-white/40">Compta</span>
        </nav>
      </header>
      <InvoiceEditor />
    </div>
  );
}
