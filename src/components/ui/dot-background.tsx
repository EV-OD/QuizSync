import React from "react";

export function DotBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-background relative flex items-center justify-center">
      <div className="absolute top-0 left-0 h-full w-full bg-background dark:bg-black bg-dot-neutral-400/[0.2] dark:bg-dot-white/[0.2]"></div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
