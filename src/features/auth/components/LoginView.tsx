import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { DemoEntry } from "@/features/auth/components/DemoEntry";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { isDemoMode } from "@/lib/demo";

export function LoginView() {
  const demo = isDemoMode();

  return (
    <AuthLayout
      title={demo ? "Bem-vindo ao PsyCare" : "Bem-vindo de volta"}
      subtitle={demo ? "Escolha como quer explorar" : "Entre com suas credenciais"}
    >
      {demo && <DemoEntry />}
      {demo && (
        <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          ou entre com e-mail
        </p>
      )}
      <LoginForm />
    </AuthLayout>
  );
}
