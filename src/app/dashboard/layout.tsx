import Nav from "@/components/Nav";
import NavMobile from "@/components/NavMobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Nav /> 
      <NavMobile /> 

      <main className="flex-1 bg-slate-50 overflow-y-auto pb-28 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;