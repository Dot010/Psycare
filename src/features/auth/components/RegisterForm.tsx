"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorMessage } from "@/features/auth/components/ErrorMessage";
import { registerAction } from "@/features/auth/actions";
import { registerSchema } from "@/features/auth/schema";

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
      <Field
        type="text"
        autoComplete="name"
        placeholder="Seu nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        label="Nome"
        disabled={isLoading}
      />

      <Field
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        label="Email"
        disabled={isLoading}
      />

      <Field
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        label="Senha"
        disabled={isLoading}
      />

      <Field
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        label="Confirmar Senha"
        disabled={isLoading}
      />

      <Button type="submit" disabled={isLoading} className="mt-6 w-full">
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>

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
