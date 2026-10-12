# Segurança

## Estado atual

O PsyCare ainda **não tem backend**: login, registro e dados são simulados e ficam no navegador. Não use dados reais de saúde enquanto isso for verdade.

## Como reportar uma vulnerabilidade

Não abra uma issue pública. Use a aba **Security → Report a vulnerability** deste repositório no GitHub (relato privado).

## O que já existe

- Cookie de sessão `httpOnly`, `sameSite=lax` e `secure` em produção, com token assinado (`jose`).
- Rotas de `/dashboard` protegidas por `src/proxy.ts`, com checagem de perfil.
- Content-Security-Policy com nonce por requisição e cabeçalhos de segurança (`next.config.ts`).
- Login simulado só liga com `DEMO_MODE=true`.
- CI com `npm audit` (alta e crítica) e Dependabot semanal.

## Antes de usar dados reais

Backend com banco e criptografia, consentimento e política de privacidade (LGPD), limite de tentativas de login, logs de acesso a dados de saúde e desligar `DEMO_MODE`.
