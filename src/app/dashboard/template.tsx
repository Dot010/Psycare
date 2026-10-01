import PageTransition from "@/components/PageTransition";

interface DashboardTemplateProps {
  children: React.ReactNode;
}

export default function DashboardTemplate({ children }: DashboardTemplateProps) {
  return <PageTransition>{children}</PageTransition>;
}
