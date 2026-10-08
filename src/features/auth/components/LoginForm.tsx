"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorMessage } from "@/features/auth/components/ErrorMessage";
import { loginAction } from "@/features/auth/actions";
import { loginSchema } from "@/features/auth/schema";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
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
    const response = await loginAction({ email, password });

    if (response.success) {
      router.push("/dashboard/home");
    } else {
      setError(response.error || "Erro ao fazer login");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 w-full">
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
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        label="Senha"
        disabled={isLoading}
      />

      <Button type="submit" loading={isLoading} className="mt-6 w-full">
        {isLoading ? "Entrando…" : "Entrar"}
      </Button>

      <ErrorMessage message={error} />

      <p className="text-center text-sm text-muted-foreground mt-4">
        Não tem conta?{" "}
        <Link href="/register" className="text-brand-ink hover:text-brand-ink font-medium transition-colors">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
