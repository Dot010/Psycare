import Nav from "@/components/Nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex">
      <Nav /> 
      <main className="flex-1 bg-slate-50 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;