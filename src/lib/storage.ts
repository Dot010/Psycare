/**
 * Armazenamento local com suporte a vários componentes lendo a mesma chave.
 * Os dados ficam só neste navegador (sem criptografia): serve para a demonstração.
 */

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function storageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Lê a chave. Devolve sempre a mesma referência enquanto o texto salvo não mudar. */
export function readStored<T>(key: string, fallback: T): T {
  if (!storageAvailable()) return fallback;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }

  if (raw === null) return fallback;

  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  try {
    const value = JSON.parse(raw) as T;
    cache.set(key, { raw, value });
    return value;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): void {
  if (storageAvailable()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Armazenamento cheio ou bloqueado: o estado segue só em memória nesta sessão.
    }
  }
  cache.delete(key);
  listeners.get(key)?.forEach((listener) => listener());
}

export function removeStored(key: string): void {
  if (storageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignora
    }
  }
  cache.delete(key);
  listeners.get(key)?.forEach((listener) => listener());
}

export function subscribeStored(key: string, listener: Listener): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);

  // Mudanças feitas em outra aba.
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      cache.delete(key);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Preferências de tela, sem dado pessoal: ficam quando a pessoa sai. */
const KEEP_ON_LOGOUT = new Set(["psycare:sound:v1", "psycare:home-sheet:v1", "psycare:garden-intro:v1"]);

/**
 * Apaga do navegador os dados pessoais do app (diário, saúde, consultas, mensagens...).
 * Chamado ao sair, para que a próxima pessoa que usar este aparelho não veja nada.
 */
export function clearUserData(): void {
  if (!storageAvailable()) return;

  const removed: string[] = [];
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("psycare:") && !KEEP_ON_LOGOUT.has(key)) {
        window.localStorage.removeItem(key);
        removed.push(key);
      }
    }
  } catch {
    // Armazenamento bloqueado: não há o que apagar.
  }

  for (const key of removed) {
    cache.delete(key);
    listeners.get(key)?.forEach((listener) => listener());
  }
}
