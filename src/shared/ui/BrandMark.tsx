import Image from "next/image";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image 
        src="/logo.svg" 
        alt="404 Monkey" 
        width={40} 
        height={40} 
        className="h-10 w-auto object-contain"
        priority
      />
      <span className="font-display text-2xl font-black leading-none tracking-tighter text-brass">
        404 MONKEY
      </span>
    </div>
  );
}
