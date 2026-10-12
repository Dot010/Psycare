# Roteiro para o backend

Hoje o PsyCare não tem servidor: o login é simulado e os dados ficam no `localStorage` do navegador. Este arquivo lista o que o backend precisa entregar e onde o front já está preparado.

## 1. O que sai de cena

| Hoje                                     | Vira                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `src/features/auth/mock-login.ts`        | login real (e-mail e senha, com hash)          |
| `DEMO_MODE=true`                         | desligado em produção                          |
| chaves `psycare:*` no `localStorage`     | tabelas no banco, lidas por API                |
| `src/mocks/*` e dados de exemplo         | dados reais, por paciente e por profissional   |
| `useLocalStorage` nos hooks de cada área | chamadas à API (os hooks já isolam essa troca) |

Os hooks em `src/features/*/hooks` e `usePlanner`, `useHabits` etc. são o ponto de troca: a tela não sabe de onde o dado vem.

## 2. Validação: os schemas já existem

Use os mesmos schemas Zod no servidor. Nunca confie só na validação do formulário.

| Área               | Arquivo                              |
| ------------------ | ------------------------------------ |
| Login/registro     | `src/features/auth/schema.ts`        |
| Saúde              | `src/features/health/schema.ts`      |
| Planner            | `src/features/planner/schema.ts`     |
| Consultas          | `src/features/appointments/types.ts` |
| Mensagens          | `src/features/messages/types.ts`     |
| Plano de segurança | `src/features/safety/schema.ts`      |
| Datas e horas      | `src/lib/validation.ts`              |

Ainda sem schema próprio, a definir com o formato da API: atividades (`activities/logic.ts`, `validateAnswers`), diário, hábitos e humor.

## 3. Autenticação e sessão

- Senha com hash forte (argon2id ou bcrypt), nunca em texto. Política mínima de senha e troca por e-mail.
- Sessão: o cookie já é `httpOnly`, `sameSite=lax` e `secure` em produção, com token assinado (`jose`, `src/lib/session.ts`). Manter. Guardar a sessão no servidor para poder encerrá-la (logout em todos os aparelhos).
- Perfis e permissões: `src/lib/roles.ts` e `src/proxy.ts` só barram a navegação. **O servidor precisa checar o perfil e o vínculo paciente-profissional em toda requisição.**
- Limite de tentativas: `src/lib/security/rate-limit.ts` é em memória e vale para uma instância. Em produção, trocar o armazenamento por um serviço compartilhado (Redis, Upstash), mantendo a interface.
- Login com dois fatores para profissionais.

## 4. Dados de saúde (LGPD)

Saúde e saúde mental são **dados pessoais sensíveis** (LGPD, art. 11).

- Base legal e consentimento registrados. Política de privacidade e termos escritos por quem entende de LGPD.
- Criptografia em trânsito (HTTPS, já com HSTS) e em repouso. Considerar criptografia do diário por campo.
- Compartilhamento com o profissional só pelo que a pessoa autorizou (`features/settings`, painel de compartilhamento). O servidor aplica essa regra.
- Exportar e excluir os dados da pessoa (direitos do titular).
- Registro de quem acessou o quê (auditoria), sem guardar o conteúdo nos logs.
- Backups criptografados e plano de resposta a incidentes.

## 5. Pagamentos

O app guarda só os 4 últimos dígitos do cartão. Com backend, **o número completo vai direto ao provedor** (Stripe, Mercado Pago etc.), por campo hospedado por ele. O PsyCare nunca recebe nem guarda o número.

## 6. Configuração e segredos

- `SESSION_SECRET` (32+ caracteres) e as demais chaves só em variáveis de ambiente do servidor. `next.config.ts` já barra `NEXT_PUBLIC_*` sensíveis.
- `DEMO_MODE` ausente ou `false` em produção. Quando o login real existir, apagar `loginMock` e `demoLoginAction`.
- Segredos fora do git: o GitHub já tem Secret scanning e Push protection.

## 7. Mudanças no front quando o backend chegar

1. Trocar o armazenamento dos hooks por chamadas à API, uma área por vez.
2. Mostrar estados de carregamento e de erro de rede (os `loading.tsx` e `error.tsx` já existem).
3. Remover `DemoNotice` e os dados de `src/mocks`.
4. Manter `clearUserData()` no logout (`src/lib/storage.ts`) até não sobrar dado pessoal no navegador.
5. Escrever testes de ponta a ponta (Playwright) do fluxo de login até uma tela.
6. Revisar o CSP em `src/lib/security/csp.ts` para liberar o domínio da API em `connect-src`.

## 8. Antes de publicar com dados reais

- [ ] Proteção da `main` e CI obrigatória
- [ ] `npm audit` sem alta ou crítica
- [ ] `DEMO_MODE` desligado e `mock-login` removido
- [ ] Limite de tentativas compartilhado entre servidores
- [ ] Política de privacidade, termos e consentimento
- [ ] Backup, monitoramento (Sentry) e plano de incidentes
- [ ] Revisão de segurança por alguém de fora do projeto
