/** Nome do cookie que guarda o tema. O servidor lê para já renderizar o tema certo, sem piscar. */
export const THEME_COOKIE = "psycare_theme";
export type Theme = "light" | "dark";

export function parseTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}
