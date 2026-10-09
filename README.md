# PsyCare

Aplicativo web de acompanhamento em saúde mental: humor, diário e atividades terapêuticas, hábitos, respiração guiada, plano de segurança, saúde e remédios, consultas, mensagens e pagamentos. Tem uma área para o profissional (psicólogo ou psiquiatra) que vê apenas o que o paciente escolhe compartilhar.

Ainda **não há backend**. Login, registro e todos os dados do painel são simulados (veja [Dados de demonstração](#dados-de-demonstração)).

Produção: [psycare-seven.vercel.app](https://psycare-seven.vercel.app)

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · lucide-react · Zod · jose · GSAP, three.js e Framer Motion para animação · Vitest · Sentry (opcional).

## Rodando localmente

```bash
npm install
cp .env.example .env.local
```

No `.env.local`, defina `DEMO_MODE=true` e gere o segredo de sessão:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole o resultado em `SESSION_SECRET` e rode `npm run dev`. Qualquer e-mail e senha entram, desde que `DEMO_MODE=true`. Na tela de login, com `DEMO_MODE=true`, há também **Entrar como paciente, psicólogo ou psiquiatra**, sem e-mail nem senha.

Requer Node 22.12 ou superior.

## Comandos

| Comando                       | O que faz                                         |
| ----------------------------- | ------------------------------------------------- |
| `npm run dev`                 | servidor de desenvolvimento                       |
| `npm run build` / `npm start` | build e execução de produção                      |
| `npm run typecheck`           | `tsc --noEmit`                                    |
| `npm run lint`                | ESLint                                            |
| `npm test`                    | Vitest                                            |
| `npm run check`               | typecheck + lint + testes (o mesmo que o CI roda) |
| `npm run format`              | formata o projeto com Prettier                    |

## Estrutura do projeto

```
src/
├── app/                 Rotas do Next. Só roteamento: cada page.tsx importa uma View de features/.
│   ├── (auth)/          /login e /register
│   └── dashboard/       Área logada (layout com menu, loading e error próprios)
├── features/            Uma pasta por área do produto. Tudo de uma área mora junto.
│   └── <área>/
│       ├── components/  Telas (XxxView.tsx) e modais da área
│       ├── hooks/       Estado e lógica da área (quando existe)
│       └── types.ts     Tipos (e schemas Zod) da área
├── components/          Código compartilhado entre áreas
│   ├── ui/              Primitivos (Button, Input, Field, Dialog, Skeleton)
│   ├── layout/          Page, ActionSheet (gaveta com 3 posições), Nav, NavMobile, lista de itens do menu
│   ├── feedback/        ItemMenu (editar/excluir), UndoProvider, ConfirmDialog, EmptyState, CrisisButton, ErrorState, skeletons
│   ├── motion/          Animações (AnimatedText, MagneticButton, CountUp, Stagger, AnimatedCheck)
│   ├── three/           Canvas 3D
│   └── providers/       Contextos globais
├── lib/                 Utilitários sem UI: sessão, datas, listas, armazenamento local, formatação, CSP, observabilidade
├── mocks/               Dados fictícios usados enquanto não há backend
├── proxy.ts             Proteção das rotas e CSP por requisição
└── instrumentation.ts   Sentry no servidor
```

Áreas em `features/`: `activities`, `appointments`, `auth`, `breathing`, `diary`, `garden`, `habits`, `health`, `help`, `home`, `messages`, `missions`, `mood`, `onboarding`, `payments`, `pro` (área do profissional), `safety`, `settings`.

### Funcionalidades

- **Humor** (`features/mood`): check-in com cinco rostos e tags do que influenciou o dia; a página Meu Humor mostra a média da semana, a curva, o canteiro do mês e o que mais pesou. Conta o que foi registrado, sem diagnosticar.
- **Diário** (`features/diary`): registros com humor, convite do dia e busca. **Atividades** (`features/activities`): roda da vida com comparação entre datas, registro de pensamentos, termômetro emocional, diário do sono, lista de valores e plano de ação. Ficam guardadas para rever e refazer (a roda sugere refazer depois de 30 dias). Os campos de cada atividade estão em `catalog.ts`; para criar uma nova, acrescente ali.
- **Plano de segurança** (`features/safety`): contatos de emergência (188 e 192) sempre primeiro, passos escritos pela pessoa e pessoas de confiança. O botão de crise do app abre este plano.
- **Saúde** (`features/health`): tela Hoje com as doses numa linha do tempo, adesão da semana sem cobrança, sintomas com intensidade de 1 a 5, exames com arquivo guardado só no navegador e um resumo de 30 dias para levar à consulta. O app nunca sugere nem altera doses.
- **Agenda** (`features/appointments`): bloqueia datas passadas e horários em conflito, aceita observações, mostra a contagem para a próxima sessão e exporta `.ics`.
- **Jardim**: além das gotas por cuidado, há três **missões** por dia (`features/missions`) e um onboarding de três telas (`features/onboarding`).
- **Configurações** (`features/settings`): lembrete diário (só guardado, não há notificações), **Privacidade** (o que o profissional vê), baixar uma cópia dos dados em JSON, apagar tudo e carregar ou limpar dados de exemplo.
- **Mensagens, pagamentos e ajuda** têm faixa de **Demonstração**: as respostas do profissional são simuladas e nenhuma cobrança é real (`components/feedback/DemoNotice.tsx`).

### Área do profissional

`features/pro`, rotas em `/dashboard/pro/*`. Contas de demonstração: psicóloga (Dra. Helena Prado) e psiquiatra (Dr. Rafael Nunes); o menu muda conforme a especialidade e **Medicação** é só do psiquiatra. O papel vem da sessão (`lib/session.ts`) e o `proxy.ts` separa as duas áreas (`lib/roles.ts`).

- **Painel do dia**, **Pacientes**, **Agenda**, **Atividades** (pedir uma atividade a um paciente), **Mensagens**, **Financeiro** e **Configurações**.
- O profissional só vê o que o paciente liberou em Configurações > Privacidade (`snapshot.ts`): do diário chegam só os títulos do que foi marcado para a consulta. As notas de sessão são privadas.
- Como não há backend, o paciente de demonstração e o profissional compartilham o `localStorage` do mesmo navegador; os outros pacientes são fictícios (`data.ts`). Em produção, `usePro` é o ponto a trocar por chamadas à API.

### Convenções

- **Nova tela:** crie `features/<área>/components/<Área>View.tsx` usando `<Page title="…">` e uma `app/dashboard/<rota>/page.tsx` que só renderiza a View. Adicione o item em `components/layout/nav-items.ts`.
- **Formulários:** use `Field` / `SelectField` (`components/ui/field.tsx`), que já ligam rótulo, erro e `aria-*`. Botões: sempre `Button`.
- **Ícones:** lucide-react. Sem emojis na interface.
- **Editar e excluir:** cada item de lista usa `ItemMenu` (três pontos). Excluir mostra "Desfazer" por 6 s (`useUndo`); cancelar consulta e remover pagamento usam `ConfirmDialog`. Modais de formulário aceitam o item a editar (`entry`, `habit`, `item`) e viram o modo de edição.
- **Listas vazias:** use `EmptyState` com um próximo passo.
- **Persistência:** estado que deve sobreviver ao recarregar usa `useLocalStorage(chave, valorInicialConstante)`.
- **Datas e valores:** `formatDateBR` e `formatCurrencyBRL` em `lib/format.ts`.
- **Nomes de arquivo:** nunca crie dois arquivos na mesma pasta que difiram só por maiúsculas ou pela extensão (`Terrain.tsx` e `terrain.ts`): no Windows e no macOS o `import` pega o errado.
- **Textos:** português do Brasil.
- **Animação:** `MagneticButton` só na ação principal. `CountUp`, `Stagger` e `AnimatedCheck` (GSAP) para números, entrada de blocos e o "feito" dos hábitos; todos respeitam `prefers-reduced-motion`.
- **Jardim:** `features/garden`. Ações reais (hábito concluído, entrada no diário, check-in, sessão de respiração) chamam `grantWater(origem, ref?)` e enchem o **regador** com uma gota por ação por dia (`water.ts`, evento `psycare:water-earned`, aviso em `WaterToast`). O botão **Regar** (`pourWater`) despeja as gotas uma a uma: a gota cai na cena (`psycare:water`) e só então a planta cresce. Ganhas (`psycare:garden-water:v1`) e despejadas (`psycare:garden-poured:v1`) ficam separadas; sem a chave de despejadas, tudo o que já foi ganho conta como despejado. O jardim só cresce, nunca murcha. A cena (`components/GardenCanvas.tsx` e `scene/`) é 3D por código: relevo (`heightmap.ts`), grama com vento na GPU, sombras, céu pela hora do dia e noite no tema escuro (`lighting.ts`), borboleta, pétalas, vaga-lumes e a gota que cai ao regar. É carregada sob demanda, com qualidade menor no celular e SVG de reserva sem WebGL. Para usar um modelo `.glb` numa planta, ponha o arquivo em `public/models/` e registre o caminho em `PLANT_MODELS` (`Plants.tsx`). O som (gota e riacho) é gerado no navegador (`lib/sound.ts`), começa desligado e o botão da Home lembra a escolha.
- **Cores:** tokens em `src/app/globals.css`. Paleta: verde oliva `brand-*` (ações), amarelo `sun-*` (destaque, sempre com texto `ink`), marrom `ink` (texto), bege `taupe` (bordas), cinza `muted-foreground` e vermelho `danger-*` (só excluir e erros). Não use cores do Tailwind (`slate-*`, `red-*`…) direto nas telas.
- **Modo escuro:** tema claro é o padrão. `ThemeToggle` (sol/lua com estrelas, GSAP) grava a escolha no cookie `psycare_theme`; o `layout.tsx` lê o cookie e já coloca a classe `dark` no `<html>`, então não há flash nem script inline (compatível com o CSP). Cores que mudam no escuro são variáveis em `globals.css` (`:root` e `.dark`). Para texto verde use `text-brand-accent` ou `text-brand-ink`, e `bg-strong` para fundos escuros fixos com texto branco; não use `text-brand-700` nem `bg-ink`. Contrastes do escuro conferidos: texto 14:1, cinza secundário 7:1, verde 7:1. A troca abre em círculo (View Transitions) e vira instantânea com "reduzir movimento".
- **Fonte:** Poppins (`next/font`), 400 a 700. Texto em 12, 14, 16 e 18 px; títulos maiores.
- **Botões:** pílula (`Button`). Estados: padrão, foco (verde escuro), desabilitado (cinza). Campos: `Field` tem erro (`error`) e sucesso (`valid`).

### Trocando os mocks por API

Cada View lê dados de `mocks/user.ts` (direto ou via hook, como `useMessages` e `useAppointments`). Para ligar um backend, troque essa leitura por uma chamada (Server Action ou fetch) dentro da própria feature; as telas não precisam mudar de lugar.

## Commits

O hook de pré-commit (Husky) formata os arquivos alterados com Prettier (`.prettierrc.json`) e roda o typecheck. O hook é instalado por `npm install`.

## Dados de demonstração

- `mocks/user.ts` guarda o perfil, hábitos, diário, consultas, faturas etc. As alterações feitas na interface (hábitos, diário, saúde, consultas, mensagens, pagamentos) ficam no `localStorage` do navegador, em chaves `psycare:<área>:v1`, via `useLocalStorage` (`lib/useLocalStorage.ts`). Para voltar aos dados iniciais, limpe o armazenamento do site. Os dados não são criptografados e não saem do navegador.
- `features/auth/mock-login.ts` simula o login e só responde com `DEMO_MODE=true`.
- Na primeira entrada pela demonstração, o navegador recebe humor, diário e atividades de exemplo. Em Configurações > Meus dados dá para carregar, limpar ou apagar tudo.
- Botões sem função real (baixar recibo, redefinir senha, 2FA, sala de vídeo) aparecem desabilitados.
- Não informe dados pessoais, de saúde ou de pagamento reais.

## Como contribuir

1. Crie uma branch a partir da `main` (`feat/nome-curto` ou `fix/nome-curto`).
2. Faça um commit por mudança com sentido próprio. Mensagens no formato `tipo(área): o que mudou` (`feat`, `fix`, `refactor`, `chore`, `test`, `docs`).
3. Rode `npm run check` antes de abrir o PR: o CI roda o mesmo.
4. Lógica nova vai em um arquivo puro (`logic.ts`) com teste ao lado; telas com comportamento ganham um teste com Testing Library (`*.test.tsx`).
5. Texto da interface em português do Brasil, sem culpa nem cobrança, e sem afirmar diagnósticos. O que for demonstração precisa dizer que é demonstração.

## Segurança

- **Sessão:** cookie `httpOnly` com JWT assinado (HS256, `jose`), 24h de validade, verificado no `proxy.ts`. Exige `SESSION_SECRET` com pelo menos 32 caracteres (`lib/session.ts`).
- **CSP com nonce por requisição:** montada em `lib/security/csp.ts` e aplicada no `proxy.ts`. Por isso as páginas são renderizadas a cada requisição. Sem `unsafe-eval` em produção; `style-src` mantém `unsafe-inline` por causa das bibliotecas de UI.
- **Headers** (HSTS, X-Frame-Options etc.) em `next.config.ts`.
- **Pagamentos:** o modal coleta só os 4 últimos dígitos do cartão. Pagamento real deve usar checkout hospedado do gateway.
- **Monitoramento:** só Sentry, opcional (`NEXT_PUBLIC_SENTRY_DSN`). Inicializado no navegador (`lib/observability/client.ts`) e no servidor (`instrumentation.ts`), sem session replay.
- **Dependências:** Dependabot semanal e `npm audit` no CI.

Antes de aceitar dados reais são necessários backend, autenticação gerenciada, política de privacidade e base legal conforme a LGPD (dados de saúde são sensíveis).

## Acessibilidade e movimento

`prefers-reduced-motion` é respeitado no CSS, no Framer Motion, no GSAP e no 3D (vira fundo estático). Efeitos de hover só ligam em dispositivos com mouse. O three.js só é baixado quando o canvas vai aparecer. A gaveta da Home também se opera por teclado (↑ ↓ na alça).

## Próximos passos

- Backend e banco de dados (Supabase ou Prisma).
- Autenticação real.
- Chamada de vídeo nas consultas online.
