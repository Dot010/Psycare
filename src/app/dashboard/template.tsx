/** Cada troca de página entra com fade e 8 px de deslocamento (220 ms). Sem movimento, só troca. */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
