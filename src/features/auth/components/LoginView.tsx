import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginView() {
  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre com suas credenciais">
      <LoginForm />
    </AuthLayout>
  );
}
