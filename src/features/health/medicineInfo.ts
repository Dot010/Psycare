/**
 * Fichas curtas de remédios para a demonstração. São textos de exemplo, escritos em linguagem simples,
 * e precisam de revisão de um profissional antes de qualquer uso real. Preços: lista CMED (preço máximo
 * ao consumidor), aqui só como exemplo. A bula completa está no bulário da ANVISA.
 */
export interface MedicineInfo {
  uso: string;
  efeitos: string;
  procurarMedico: string;
  /** Preço máximo de exemplo, com a data da lista. */
  preco: string;
  precoData: string;
  forma: "comprimido" | "capsula";
  embalagem: string;
  /** Quantas unidades vêm numa caixa (exemplo; a fonte oficial é a lista CMED/ANVISA). */
  caixa: number;
  tarja: "vermelha" | "preta";
}

const INFO: Record<string, MedicineInfo> = {
  lyberdia: {
    uso: "Usado no tratamento de TDAH, para ajudar na atenção e no controle dos impulsos.",
    efeitos: "Menos apetite, boca seca, insônia, coração mais acelerado.",
    procurarMedico: "Se tiver dor no peito, palpitação forte, muita agitação ou mudança grande no humor.",
    preco: "R$ 389,90",
    precoData: "09/2026",
    forma: "capsula",
    embalagem: "30 cápsulas",
    caixa: 30,
    tarja: "preta",
  },
  topiramato: {
    uso: "Usado para prevenir crises de enxaqueca e em alguns tipos de epilepsia.",
    efeitos: "Formigamento nas mãos e nos pés, sonolência, menos apetite, pensamento mais lento.",
    procurarMedico: "Se tiver dor ou visão embaçada nos olhos, dor forte nas costas ou mudança de humor.",
    preco: "R$ 46,50",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
    caixa: 30,
    tarja: "vermelha",
  },
  sertralina: {
    uso: "Ajuda no tratamento de depressão e de ansiedade.",
    efeitos: "Náusea leve, sono alterado, boca seca. Costumam melhorar nas primeiras semanas.",
    procurarMedico: "Se o humor piorar muito, se tiver pensamentos de se machucar ou sinais de alergia.",
    preco: "R$ 38,40",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
    caixa: 30,
    tarja: "vermelha",
  },
  escitalopram: {
    uso: "Usado no tratamento de depressão e de vários tipos de ansiedade.",
    efeitos: "Enjoo, dor de cabeça, sonolência ou insônia no começo.",
    procurarMedico: "Se o humor piorar, se tiver agitação forte ou pensamentos de se machucar.",
    preco: "R$ 52,10",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
    caixa: 30,
    tarja: "vermelha",
  },
  clonazepam: {
    uso: "Usado em alguns quadros de ansiedade e de sono, por tempo curto e com acompanhamento.",
    efeitos: "Sonolência, tontura, lentidão. Evite álcool.",
    procurarMedico: "Se sentir sonolência forte, confusão ou perceber que está dependendo do remédio.",
    preco: "R$ 21,90",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
    caixa: 30,
    tarja: "preta",
  },
  metilfenidato: {
    uso: "Usado no tratamento de TDAH, para ajudar na atenção e no controle dos impulsos.",
    efeitos: "Menos apetite, insônia, coração mais acelerado, irritação no fim do efeito.",
    procurarMedico: "Se tiver dor no peito, palpitação forte, tontura ou mudança grande no humor.",
    preco: "R$ 64,70",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
    caixa: 30,
    tarja: "preta",
  },
  amitriptilina: {
    uso: "Usada em depressão, em dor crônica e em alguns problemas de sono.",
    efeitos: "Boca seca, sonolência, prisão de ventre, tontura ao levantar.",
    procurarMedico: "Se tiver batimento irregular, confusão ou muita sonolência.",
    preco: "R$ 18,30",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
    caixa: 30,
    tarja: "vermelha",
  },
};

export function medicineInfoFor(nome: string): MedicineInfo | undefined {
  return INFO[nome.trim().toLowerCase()];
}

/** "cápsula" ou "comprimido", no singular ou no plural. */
export function unitName(forma: MedicineInfo["forma"] | undefined, count: number): string {
  const one = forma === "capsula" ? "cápsula" : "comprimido";
  return count === 1 ? one : `${one}s`;
}

export const MEDICINE_DISCLAIMER = "Informação geral. Não substitui a orientação do seu médico.";
