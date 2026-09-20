# 🧠 PsyCare

> Plataforma inteligente e humanizada para acompanhamento psicológico, gestão de hábitos, diário emocional e consultas.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://psycare-seven.vercel.app)

🌐 **Aceda à aplicação em produção:** [psycare-seven.vercel.app](https://psycare-seven.vercel.app)

---

## 🚀 Sobre o Projeto

O **PsyCare** é uma aplicação web desenvolvida para proporcionar uma experiência fluida, acolhedora e personalizada tanto para pacientes quanto para profissionais da saúde mental. 

A plataforma oferece um painel completo para acompanhamento de rotinas, registro de hábitos, diário de sentimentos, gestão de pagamentos, consultas agendadas e central de mensagens.

---

## ✨ Funcionalidades Atuais (MVP)

- **👤 Personalização Dinâmica em Tempo Real:** Sincronização do perfil do utilizador via `UserContext` e `localStorage`, com saudações contextuais e edições inline.
- **📊 Dashboard Multimodular:** 
  - **Home:** Visão geral da rotina, próximos compromissos e resumo diário.
  - **Diário Emocional:** Registro e acompanhamento de humor e reflexões.
  - **Hábitos:** Monitoramento e criação de metas diárias.
  - **Saúde & Métricas:** Acompanhamento de evolução e bem-estar.
  - **Consultas & Mensagens:** Gestão de agendamentos e histórico de conversas.
  - **Pagamentos:** Controle financeiro e faturas.
  - **Configurações:** Gestão de perfil, preferências e segurança.
- **🧩 Componentes Modais Interativos:** Modais dedicados para Onboarding, Novo Registro de Diário, Novo Hábito e Novo Pagamento.
- **🎨 Design Acessível e Responsivo:** Layout focado no conforto visual, construído com componentes Shadcn/UI e estilizado via Tailwind CSS.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes de UI:** [Shadcn/UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Gerenciamento de Estado:** React Context API + LocalStorage
- **Deploy & Hospedagem:** [Vercel](https://vercel.com/)

---

## 🗺️ Roadmap de Desenvolvimento

- [x] Estruturação da arquitetura modular com Next.js App Router (15+ rotas).
- [x] Criação do sistema de personalização dinâmica de perfil (`UserContext`).
- [x] Integração de componentes interativos e modais de cadastro.
- [x] Testes de build e publicação automatizada na Vercel.
- [ ] Conexão com banco de dados remoto ([Supabase](https://supabase.com/) / [Prisma ORM](https://www.prisma.io/)).
- [ ] Sistema de Autenticação completo (Clerk / NextAuth.js).
- [ ] Integração de chamadas de vídeo para sessões online.

---

## 💻 Como Executar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/Dot010/Psycare.git](https://github.com/Dot010/Psycare.git)
   cd Psycare
