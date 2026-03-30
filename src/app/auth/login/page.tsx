"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Importante para navegar
import SocialButtons from "@/components/SocialButtons";
import PageTransition from "@/components/PageTransition";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard/home");
  };

  return (
    <PageTransition>
    <section className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white flex rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden min-h-[550px]">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="md:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center">
          <h2 className="font-bold text-3xl text-emerald-800 tracking-tight">
            Que bom ter voce aqui
          </h2>
          <p className="text-sm mt-2 text-slate-500 text-center leading-relaxed">
           Acesse sua conta para continuar sua jornada de cuidado e evolução.
          </p>
          <SocialButtons />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
            <input 
              className="p-3 rounded-xl border focus:outline-emerald-500 transition-all" 
              type="email" placeholder="E-mail" required 
            />
            <input 
              className="p-3 rounded-xl border focus:outline-emerald-500 transition-all" 
              type="password" placeholder="Senha" required 
            />
            {/* Esqueci minha senha */}
            <div className="flex justify-center">
              <button
                type="button"
                className="text-sm text-emerald-700 hover:underline focus:outline-none"
              >
                Esqueci minha senha
              </button>
            </div>

            <button type="submit" className="bg-emerald-600 rounded-xl text-white py-3 font-semibold hover:bg-emerald-700 transition-all shadow-md">
              Entrar
            </button>
          </form>

          <div className="mt-8 text-sm text-slate-600 text-center">
            Não tem uma conta?{" "}
            <Link href="/auth/signUp" className="text-emerald-700 font-bold hover:underline">
              Cadastre-se agora!
            </Link>
          </div>
        </div>

        {/* Lado Direito: Imagem */}
        <div className="hidden md:block md:w-1/2 p-5 bg-emerald-50 flex items-center justify-center">
          <img className="rounded-2xl h-full w-full object-cover shadow-inner" src="/assets/login/psy.jpg" alt="Login" />
        </div>
      </div>
      </section>
      </PageTransition>
  );
}