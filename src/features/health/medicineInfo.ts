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
  tarja: "vermelha" | "preta";
}

const INFO: Record<string, MedicineInfo> = {
  sertralina: {
    uso: "Ajuda no tratamento de depressão e de ansiedade.",
    efeitos: "Náusea leve, sono alterado, boca seca. Costumam melhorar nas primeiras semanas.",
    procurarMedico: "Se o humor piorar muito, se tiver pensamentos de se machucar ou sinais de alergia.",
    preco: "R$ 38,40",
    precoData: "09/2026",
    forma: "comprimido",
    embalagem: "30 comprimidos",
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
    tarja: "vermelha",
  },
};

export function medicineInfoFor(nome: string): MedicineInfo | undefined {
  return INFO[nome.trim().toLowerCase()];
}

export const MEDICINE_DISCLAIMER = "Informação geral. Não substitui a orientação do seu médico.";
