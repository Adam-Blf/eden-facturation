import Image from "next/image";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src="/logo.png" 
        alt="404 Monkey" 
        width={120} 
        height={120} 
        className="h-12 w-auto object-contain"
        priority
      />
      <div className="flex flex-col">
        <span className="font-display text-xl font-black leading-none tracking-tighter text-brass">
          404 MONKEY
        </span>
        <span className="code-badge text-[8px] opacity-60">
          billing_engine_v1
        </span>
      </div>
    </div>
  );
}
