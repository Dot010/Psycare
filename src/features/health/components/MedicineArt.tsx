import type { MedicineInfo } from "../medicineInfo";

interface Props {
  nome: string;
  dosagem: string;
  info: Pick<MedicineInfo, "embalagem" | "tarja">;
  /** Cor da faixa de cima da caixa. */
  band: string;
}

/**
 * Caixa e comprimido em 3D, feitos só com CSS. É um desenho nosso, inspirado em embalagens de remédio:
 * não usa imagens, marcas nem caixas reais.
 */
export function MedicineArt({ nome, dosagem, info, band }: Props) {
  const tarja = info.tarja === "preta" ? "#1a1a1a" : "#c0392b";
  const tarjaText = info.tarja === "preta" ? "Venda sob prescrição · uso controlado" : "Venda sob prescrição";
  const face = "border border-[#cfc7b8] bg-white";
  return (
    <figure className="m-0 flex flex-col items-center gap-2">
      <div
        className="med-scene flex h-48 w-full items-center justify-center gap-6"
        role="img"
        aria-label={`Ilustração da forma do remédio ${nome} ${dosagem}`}
      >
        <div className="med-spin relative h-[104px] w-[150px]">
          <div
            className={`med-face ${face}`}
            style={{ width: 150, height: 104, transform: "translateZ(22px)" }}
          >
            <div
              className="flex h-[22px] items-center px-2 text-[8px] tracking-wider text-white"
              style={{ background: band }}
            >
              PSYCARE · DEMO
            </div>
            <div className="px-2 pt-1.5 text-[15px] leading-tight font-semibold text-[#36461f]">{nome}</div>
            <div className="px-2 text-[9px] text-[#6b5b57]">
              {dosagem.split(",")[0]} · {info.embalagem}
            </div>
            <div
              className="absolute inset-x-0 bottom-0 flex h-[14px] items-center px-2 text-[7px] text-white"
              style={{ background: tarja }}
            >
              {tarjaText}
            </div>
          </div>
          <div
            className={`med-face ${face} bg-[#f1ede4]`}
            style={{ width: 150, height: 104, transform: "rotateY(180deg) translateZ(22px)" }}
          />
          <div
            className={`med-face ${face} bg-[#ece6da]`}
            style={{ width: 44, height: 104, left: 53, transform: "rotateY(90deg) translateZ(75px)" }}
          />
          <div
            className={`med-face ${face} bg-[#ece6da]`}
            style={{ width: 44, height: 104, left: 53, transform: "rotateY(-90deg) translateZ(75px)" }}
          />
          <div
            className={`med-face ${face} bg-[#f7f4ec]`}
            style={{ width: 150, height: 44, top: 30, transform: "rotateX(90deg) translateZ(52px)" }}
          />
          <div
            className={`med-face ${face} bg-[#e6e0d3]`}
            style={{ width: 150, height: 44, top: 30, transform: "rotateX(-90deg) translateZ(52px)" }}
          />
        </div>
        <div className="med-spin relative h-[70px] w-[70px]" aria-hidden>
          {[-3, 0].map((z) => (
            <div
              key={z}
              className="med-face rounded-full bg-[#d9d2c8]"
              style={{ left: 5, top: 5, width: 60, height: 60, transform: `translateZ(${z}px)` }}
            />
          ))}
          <div
            className="med-face rounded-full border border-[#d9d2c8]"
            style={{
              left: 5,
              top: 5,
              width: 60,
              height: 60,
              transform: "translateZ(3px)",
              background: "radial-gradient(circle at 35% 30%, #fff, #e8e2d6)",
            }}
          />
          <div
            className="med-face bg-[#cfc7b8]"
            style={{ left: 5, top: 34, width: 60, height: 2, transform: "translateZ(3.5px)" }}
          />
        </div>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Ilustração inspirada em embalagens. Não é a caixa real de nenhuma marca.
      </figcaption>
    </figure>
  );
}
