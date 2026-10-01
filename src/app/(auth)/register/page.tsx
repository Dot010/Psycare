import { AuthLayout } from "@/components/ui/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
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
