"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthInput } from "@/components/ui/AuthInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { registerAction } from "@/lib/auth-utils/actions";
import { registerSchema } from "@/lib/auth-utils/schema";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const response = await registerAction({
      name,
      email,
      password,
      confirmPassword,
    });

    if (response.success) {
      router.push("/dashboard/home");
    } else {
      setError(response.error || "Erro ao criar conta");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 w-full">
      <AuthInput
        type="text"
        placeholder="Seu nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        label="Nome"
        disabled={isLoading}
      />

      <AuthInput
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        label="Email"
        disabled={isLoading}
      />

      <AuthInput
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        label="Senha"
        disabled={isLoading}
      />

      <AuthInput
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        label="Confirmar Senha"
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-brand-800 hover:bg-brand-900 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition-all duration-200"
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </button>

      <ErrorMessage message={error} />

      <p className="text-center text-sm text-slate-600 mt-4">
        Já tem conta?{" "}
        <Link href="/login" className="text-brand-800 hover:text-brand-900 font-medium transition-colors">
          Faça login
        </Link>
      </p>
    </form>
  );
}
