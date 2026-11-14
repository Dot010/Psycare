"use client";

import { Brain, ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { CrisisButton } from "@/components/feedback/CrisisButton";
import { ThemeToggle } from "@/components/feedback/ThemeToggle";
import { navItemsFor, type NavVariant } from "@/components/layout/nav-items";
import { logoutAction } from "@/features/auth/actions";
import { useProfile } from "@/features/profile/useProfile";
import { clearUserData } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/dashboard/pro" && pathname.startsWith(`${href}/`));
}

const link =
  "flex min-h-11 items-center border-b-2 text-[0.95rem] transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

const menuPanel = "z-50 min-w-56 rounded-2xl border border-border bg-card p-2 text-foreground shadow-lg";
const menuItem =
  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm outline-none data-[highlighted]:bg-sunken";

/**
 * Menu do computador: uma barra leve no topo. Os itens principais (os mesmos da barra do celular)
 * ficam à mostra; o resto fica em "Mais". No celular quem aparece é a NavMobile.
 */
export default function TopNav({ variant = "patient" }: { variant?: NavVariant }) {
  const items = navItemsFor(variant);
  const main = items.filter((item) => item.inMobileBar);
  const more = items.filter((item) => !item.inMobileBar);
  const pathname = usePathname();
  const moreActive = more.some((item) => isActivePath(pathname, item.href));
  const [profile] = useProfile();
  const name = profile.name.trim();
  const settingsHref = variant === "patient" ? "/dashboard/settings" : "/dashboard/pro/settings";

  return (
    <header className="hidden bg-sunken md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-8 pt-5 pb-1">
        <Link
          href={items[0].href}
          className="flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Brain className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold text-ink">PsyCare</span>
        </Link>

        <nav aria-label="Principal" className="min-w-0 flex-1">
          <ul className="flex flex-wrap items-center gap-x-6">
            {main.map(({ title, href }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      link,
                      active
                        ? "border-ink font-semibold text-ink"
                        : "border-transparent text-muted-foreground hover:text-ink",
                    )}
                  >
                    {title}
                  </Link>
                </li>
              );
            })}
            {more.length > 0 && (
              <li>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    className={cn(
                      link,
                      "gap-1",
                      moreActive
                        ? "border-ink font-semibold text-ink"
                        : "border-transparent text-muted-foreground hover:text-ink",
                    )}
                  >
                    Mais
                    <ChevronDown className="size-4" aria-hidden />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="start" sideOffset={6} className={menuPanel}>
                      {more.map(({ title, href, icon: Icon, startsGroup }, index) => (
                        <div key={href}>
                          {startsGroup && index > 0 && (
                            <DropdownMenu.Separator className="my-1 h-px bg-border" />
                          )}
                          <DropdownMenu.Item asChild>
                            <Link
                              href={href}
                              aria-current={isActivePath(pathname, href) ? "page" : undefined}
                              className={cn(menuItem, "aria-[current=page]:font-semibold")}
                            >
                              <Icon className="size-4 text-brand-accent" aria-hidden />
                              {title}
                            </Link>
                          </DropdownMenu.Item>
                        </div>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {variant === "patient" && <CrisisButton placement="header" />}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label="Sua conta"
              className="flex size-11 items-center justify-center rounded-full border border-border bg-brand-100 text-sm font-semibold text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
            >
              {name ? name.charAt(0).toUpperCase() : <Settings className="size-4" aria-hidden />}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={6} className={menuPanel}>
                {name && (
                  <DropdownMenu.Label className="px-3 py-2 text-sm font-semibold">{name}</DropdownMenu.Label>
                )}
                <div className="flex min-h-11 items-center justify-between gap-3 px-3 text-sm">
                  Modo escuro
                  <ThemeToggle />
                </div>
                <DropdownMenu.Item asChild>
                  <Link href={settingsHref} className={menuItem}>
                    <Settings className="size-4 text-brand-accent" aria-hidden />
                    Configurações
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <form action={logoutAction} onSubmit={clearUserData}>
                  <DropdownMenu.Item asChild>
                    <button type="submit" className={cn(menuItem, "w-full text-danger-600")}>
                      <LogOut className="size-4" aria-hidden />
                      Sair
                    </button>
                  </DropdownMenu.Item>
                </form>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
