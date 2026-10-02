"use client";

import { Brain, ChevronLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const itemClass =
  "flex w-full items-center gap-x-4 rounded-xl p-3 text-primary-foreground/90 transition-colors hover:bg-white/15 hover:text-primary-foreground";

export default function Nav() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 hidden h-screen md:flex">
      <div
        className={cn(
          "relative h-screen bg-primary p-5 pt-8 text-primary-foreground shadow-xl transition-all duration-300",
          open ? "w-72" : "w-20",
        )}
      >
        <button
          type="button"
          aria-label={open ? "Recolher menu" : "Expandir menu"}
          onClick={() => setOpen(!open)}
          className={cn(
            "absolute -right-3 top-9 flex items-center justify-center rounded-full border-2 border-primary bg-card p-0.5 text-primary transition-transform duration-500 hover:scale-105",
            !open && "rotate-180",
          )}
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className={cn("flex items-center", open ? "ml-1" : "justify-center")}>
          <div className="rounded-xl bg-card p-2 shadow-md">
            <Brain className="size-7 text-primary" />
          </div>
          <span
            className={cn(
              "ml-4 origin-left text-2xl font-bold transition-all duration-300",
              !open && "w-0 scale-0 overflow-hidden",
            )}
          >
            Psy Care
          </span>
        </div>

        <nav aria-label="Principal" className="pt-10">
          <ul>
            {NAV_ITEMS.map(({ title, href, icon: Icon, startsGroup }) => {
              const isActive = pathname === href;
              return (
                <li key={href} className={startsGroup ? "mt-8" : "mt-2"}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    title={open ? undefined : title}
                    className={cn(itemClass, isActive && "bg-white/20 text-primary-foreground")}
                  >
                    <Icon className={cn("size-6 shrink-0", !open && "mx-auto")} />
                    <span className={cn("flex-1 text-base font-medium", !open && "hidden")}>{title}</span>
                  </Link>
                </li>
              );
            })}

            <li className="mt-8">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className={cn(itemClass, "text-red-200 hover:bg-destructive/20 hover:text-white")}
                >
                  <LogOut className={cn("size-6 shrink-0", !open && "mx-auto")} />
                  <span className={cn("flex-1 text-left text-base font-medium", !open && "hidden")}>Sair</span>
                </button>
              </form>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
