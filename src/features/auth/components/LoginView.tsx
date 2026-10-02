import { AuthLayout } from "@/components/ui/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginView() {
  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais"
      imageSrc="/assets/login/psy.jpg"
      imageAlt="Login PsyCare"
    >
      <LoginForm />
    </AuthLayout>
  );
}