import {
  BookText,
  CalendarCheck,
  CircleHelp,
  ClipboardList,
  CreditCard,
  House,
  LayoutDashboard,
  MessageCircle,
  Pill,
  Settings,
  SquareCheckBig,
  Users,
  Wallet,
  Wind,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  /** Rótulo curto para a barra inferior do celular. */
  shortTitle?: string;
  href: string;
  icon: LucideIcon;
  /** Aparece direto na barra inferior do celular (os demais ficam em "Mais"). */
  inMobileBar?: boolean;
  /** Espaço extra antes do item no menu lateral, para separar grupos. */
  startsGroup?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Início", href: "/dashboard/home", icon: House, inMobileBar: true },
  { title: "Meu Diário", shortTitle: "Diário", href: "/dashboard/diary", icon: BookText, inMobileBar: true },
  {
    title: "Meus Hábitos",
    shortTitle: "Hábitos",
    href: "/dashboard/habits",
    icon: SquareCheckBig,
    inMobileBar: true,
  },
  { title: "Respirar", href: "/dashboard/breathing", icon: Wind },
  {
    title: "Agendar Consulta",
    shortTitle: "Agenda",
    href: "/dashboard/appointments",
    icon: CalendarCheck,
    inMobileBar: true,
    startsGroup: true,
  },
  { title: "Gestão de Saúde", shortTitle: "Saúde", href: "/dashboard/health", icon: Pill },
  { title: "Mensagens", shortTitle: "Chat", href: "/dashboard/messages", icon: MessageCircle },
  {
    title: "Meus Pagamentos",
    shortTitle: "Pagamentos",
    href: "/dashboard/payments",
    icon: CreditCard,
    startsGroup: true,
  },
  { title: "Ajuda", href: "/dashboard/help", icon: CircleHelp },
  { title: "Configurações", shortTitle: "Ajustes", href: "/dashboard/settings", icon: Settings },
];

/** Qual menu mostrar: o do paciente ou o de cada especialidade. */
export type NavVariant = "patient" | "psychologist" | "psychiatrist";

const PRO_COMMON: NavItem[] = [
  {
    title: "Painel do dia",
    shortTitle: "Painel",
    href: "/dashboard/pro",
    icon: LayoutDashboard,
    inMobileBar: true,
  },
  { title: "Pacientes", href: "/dashboard/pro/patients", icon: Users, inMobileBar: true },
  { title: "Agenda", href: "/dashboard/pro/agenda", icon: CalendarCheck, inMobileBar: true },
  { title: "Atividades", href: "/dashboard/pro/activities", icon: ClipboardList },
];

const PRO_TAIL: NavItem[] = [
  {
    title: "Mensagens",
    shortTitle: "Chat",
    href: "/dashboard/pro/messages",
    icon: MessageCircle,
    startsGroup: true,
  },
  { title: "Financeiro", href: "/dashboard/pro/finance", icon: Wallet },
  { title: "Configurações", shortTitle: "Ajustes", href: "/dashboard/pro/settings", icon: Settings },
];

const PSYCHIATRIST_ONLY: NavItem = {
  title: "Medicação",
  href: "/dashboard/pro/medication",
  icon: Pill,
  inMobileBar: true,
};

export function navItemsFor(variant: NavVariant): NavItem[] {
  if (variant === "patient") return NAV_ITEMS;
  if (variant === "psychiatrist") return [...PRO_COMMON, PSYCHIATRIST_ONLY, ...PRO_TAIL];
  return [...PRO_COMMON, ...PRO_TAIL];
}
