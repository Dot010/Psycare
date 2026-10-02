import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export function RegisterView() {
  return (
    <AuthLayout
      title="Junte-se ao PsyCare"
      subtitle="Criar sua conta é rápido e seguro"
      imageSrc="/assets/login/psy.jpg"
      imageAlt="Cadastro PsyCare"
    >
      <RegisterForm />
    </AuthLayout>
  );
}