
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookMarked, Users, BarChart2, Send, LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";

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
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">
        <nav className="flex flex-col gap-2 flex-grow">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-primary text-primary-foreground hover:text-primary-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
        {user && (
            <div className="mt-auto md:hidden">
                <Button variant="ghost" onClick={signOut} className="w-full justify-start">
                   <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
            </div>
        )}
    </div>
  );
}
