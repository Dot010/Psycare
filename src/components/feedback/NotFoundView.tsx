import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { buttonVariants } from "@/components/ui/button";

interface NotFoundViewProps {
  /** Para onde "voltar" leva: o painel de quem está logado, ou o login. */
  homeHref?: string;
  signedIn: boolean;
}

/** Página 404. Sem culpa: diz o que aconteceu e oferece um caminho de volta. */
export function NotFoundView({ homeHref = "/dashboard", signedIn }: NotFoundViewProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <BrandMark className="mx-auto size-14" />
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-brand-accent uppercase">Erro 404</p>
          <h1 className="text-3xl leading-tight font-semibold text-brand-ink">Não achamos essa página.</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            O endereço pode ter mudado ou ter um erro de digitação. Não foi nada que você fez.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={signedIn ? homeHref : "/login"} className={buttonVariants()}>
            {signedIn ? "Voltar para o início" : "Ir para o login"}
          </Link>
        </div>
      </div>
    </main>
  );
}
