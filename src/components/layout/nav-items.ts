import {
  CalendarCheck,
  CircleHelp,
  CreditCard,
  House,
  MessageCircle,
  Pill,
  Settings,
  SquareCheckBig,
  BookText,
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
  { title: "Meus Hábitos", shortTitle: "Hábitos", href: "/dashboard/habits", icon: SquareCheckBig, inMobileBar: true },
  { title: "Respirar", href: "/dashboard/breathing", icon: Wind },
  { title: "Agendar Consulta", shortTitle: "Agenda", href: "/dashboard/appointments", icon: CalendarCheck, inMobileBar: true, startsGroup: true },
  { title: "Gestão de Saúde", shortTitle: "Saúde", href: "/dashboard/health", icon: Pill },
  { title: "Mensagens", shortTitle: "Chat", href: "/dashboard/messages", icon: MessageCircle },
  { title: "Meus Pagamentos", shortTitle: "Pagamentos", href: "/dashboard/payments", icon: CreditCard, startsGroup: true },
  { title: "Ajuda", href: "/dashboard/help", icon: CircleHelp },
  { title: "Configurações", shortTitle: "Ajustes", href: "/dashboard/settings", icon: Settings },
];
