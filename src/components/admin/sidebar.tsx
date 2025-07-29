
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookMarked, Users, BarChart2, Send, LogOut, Trophy } from "lucide-react";
import Image from "next/image";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/questions", label: "Questions", icon: BookMarked },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/quiz-control", label: "Quiz Control", icon: BarChart2 },
    { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/admin/send-emails", label: "Send Emails", icon: Send },
]

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/logos/IEEE-CS_LogoTM-orange.png" alt="IEEE CS Logo" width={32} height={32} className="dark:[filter:invert(1)_hue-rotate(189deg)_brightness(2)]" />
              <span className="">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-2 p-4 flex-grow">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    </div>
  );
}
