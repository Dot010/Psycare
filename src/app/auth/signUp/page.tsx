"use client";

import React from "react";
import Link from "next/link";
import SocialButtons from "@/components/SocialButtons";
import PageTransition from "@/components/PageTransition";

export default function SignUpPage() {
  return (
    <PageTransition>
    <section className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white flex rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden min-h-[550px]">
        
        {/* Lado Esquerdo: Formulário de Cadastro */}
        <div className="md:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="font-bold text-3xl text-emerald-800">Junte-se ao Psy Care</h2>
                  
                  <p className="text-sm mt-2 text-center text-slate-500 leading-relaxes">
                      Crie sua conta em poucos segundos e tenha acesso a um suporte profissional para sua saúde mental.
                  </p>
          <SocialButtons />
          
          <form className="flex flex-col gap-4 mt-8">
            <input className="p-3 rounded-xl border focus:outline-emerald-500" type="text" placeholder="Nome Completo" required />
            <input className="p-3 rounded-xl border focus:outline-emerald-500" type="email" placeholder="E-mail" required />
            <input className="p-3 rounded-xl border focus:outline-emerald-500" type="password" placeholder="Criar Senha" required />
            <button className="bg-emerald-700 rounded-xl text-white py-3 font-semibold hover:bg-emerald-800 transition-all shadow-md">
              Cadastrar
            </button>
          </form>

          <div className="mt-8 text-sm text-slate-600 text-center">
            Já possui uma conta?{" "}
            <Link href="/auth/login" className="text-emerald-700 font-bold hover:underline">
              Fazer Login
            </Link>
          </div>
        </div>

        {/* Lado Direito: Mesma Imagem para consistência */}
        <div className="hidden md:block md:w-1/2 p-5 bg-emerald-50 flex items-center justify-center">
          <img className="rounded-2xl h-full w-full object-cover" src="/assets/login/psy.jpg" alt="Cadastro" />
        </div>
      </div>
      </section>
    </PageTransition>
  );
}