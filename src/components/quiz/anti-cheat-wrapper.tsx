"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function AntiCheatWrapper({ children }: Props) {
  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  return <>{children}</>;
}
