"use client";

interface Props {
  title: string;
  subtitle: string;
  onOpen: () => void;
  opened: boolean;
}

/** A capa do diário em 3D, feita só com CSS. Toque nela para abrir ou fechar o diário. */
export function BookCover({ title, subtitle, onOpen, opened }: Props) {
  return (
    // A altura é reservada aqui (o livro 3D é todo absoluto), senão ele passaria por cima das abas.
    <div
      className="book-scene flex items-start justify-center transition-[height] duration-300 motion-reduce:transition-none"
      style={{ height: opened ? 128 : 268 }}
    >
      <div
        style={{
          transform: `scale(${opened ? 0.5 : 1})`,
          transformOrigin: "center top",
          transformStyle: "preserve-3d",
          transition: "transform 300ms ease-out",
          paddingTop: opened ? 8 : 24,
        }}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-expanded={opened}
          aria-label={opened ? "Fechar o diário" : "Abrir o diário"}
          className="book relative block h-[220px] w-[160px] cursor-pointer rounded-md focus-visible:outline-none"
        >
          <span
            className="book-face flex h-[220px] w-[160px] flex-col justify-between rounded-r-md rounded-l-sm p-4 text-left shadow-lg"
            style={{
              transform: "translateZ(18px)",
              background: "linear-gradient(145deg, #5e7638, #36461f)",
              color: "#f1ede4",
            }}
          >
            <span className="text-[10px] tracking-widest uppercase opacity-80">PsyCare</span>
            <span>
              <span className="block text-xl leading-tight font-semibold">{title}</span>
              <span className="mt-1 block text-xs opacity-80">{subtitle}</span>
            </span>
            <span aria-hidden className="h-0.5 w-10 rounded bg-[#c9a227]" />
          </span>
          <span
            aria-hidden
            className="book-face"
            style={{
              width: 36,
              height: 220,
              left: 0,
              transform: "translateZ(-18px) rotateY(-90deg)",
              transformOrigin: "left center",
              background: "#2c3a19",
            }}
          />
          <span
            aria-hidden
            className="book-face"
            style={{
              width: 36,
              height: 214,
              top: 3,
              left: 158,
              transform: "translateZ(17px) rotateY(90deg)",
              transformOrigin: "left center",
              background: "repeating-linear-gradient(0deg, #f7f4ec, #f7f4ec 2px, #e6e0d3 3px)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
