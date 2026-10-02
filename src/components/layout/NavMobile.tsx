"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/feedback/ThemeToggle";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const barItems = NAV_ITEMS.filter((item) => item.inMobileBar);
const moreItems = NAV_ITEMS.filter((item) => !item.inMobileBar);

export default function NavMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-50 flex h-20 items-center justify-around border-t border-border bg-card px-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]"
      >
        {barItems.map(({ title, shortTitle, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              pathname === href ? "text-brand-accent" : "text-muted-foreground active:text-brand-accent",
            )}
          >
            <Icon className="size-5" />
            <span className="text-xs font-bold uppercase tracking-tight">{shortTitle ?? title}</span>
          </Link>
        ))}

        <button
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            menuOpen ? "text-brand-accent" : "text-muted-foreground",
          )}
        >
          <LayoutGrid className="size-5" />
          <span className="text-xs font-bold uppercase tracking-tight">Mais</span>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-strong/60"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-card p-8 pb-28 shadow-2xl"
            >
              <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-border" />

              <div className="mb-8 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Modo escuro</span>
                <ThemeToggle />
              </div>

              <div className="grid grid-cols-4 gap-y-8">
                {moreItems.map(({ title, shortTitle, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-sunken text-muted-foreground transition-colors active:bg-brand-600 active:text-white">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{shortTitle ?? title}</span>
                  </Link>
                ))}

                {/* Encerra a sessão no servidor; um simples router.push("/login") deixava o cookie ativo. */}
                <form action={logoutAction} className="contents">
                  <button type="submit" className="flex flex-col items-center gap-2">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
                      <LogOut className="size-6" />
                    </span>
                    <span className="text-xs font-bold text-danger-300">Sair</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
