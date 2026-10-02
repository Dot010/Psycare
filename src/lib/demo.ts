/**
 * Enquanto não existe backend, o login/registro são simulados (loginMock).
 * Esse modo só liga se DEMO_MODE=true for definido explicitamente no ambiente,
 * para que um deploy sem configuração nunca aceite credenciais falsas.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}
