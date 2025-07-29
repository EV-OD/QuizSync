import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 px-4 lg:px-6 h-16 md:h-20 flex items-center justify-between text-foreground md:bg-background/80 md:backdrop-blur-sm md:border-b md:border-border/20">
      <Link href="/" className="flex items-center justify-center gap-2">
        <Image src="/logos/IEEE-CS_LogoTM-orange.png" alt="IEEE Computer Society Logo" width={128} height={128} className="h-10 w-auto dark:[filter:invert(1)_hue-rotate(189deg)_brightness(2)]" />
      </Link>
      <div className="text-right hidden md:block">
        <span className="text-lg md:text-xl font-bold font-headline">Scholars in the Making</span>
        <p className="text-xs text-muted-foreground/80">Organized by IEEE Computer Society Pulchowk Student Branch Chapter</p>
      </div>
    </header>
  );
}
