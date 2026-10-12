import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearUserData, readStored, removeStored, subscribeStored, writeStored } from "./storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    removeStored("k");
  });

  it("devolve o valor inicial quando não há nada salvo", () => {
    const initial = [1, 2];
    expect(readStored("k", initial)).toBe(initial);
  });

  it("salva e lê de volta", () => {
    writeStored("k", { a: 1 });
    expect(readStored("k", null)).toEqual({ a: 1 });
  });

  it("mantém a mesma referência enquanto nada muda", () => {
    writeStored("k", [1]);
    expect(readStored("k", [])).toBe(readStored("k", []));
  });

  it("volta ao valor inicial se o texto salvo estiver corrompido", () => {
    window.localStorage.setItem("k", "{quebrado");
    expect(readStored("k", "padrão")).toBe("padrão");
  });

  it("avisa quem assinou a chave quando ela muda", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeStored("k", listener);
    writeStored("k", 1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    writeStored("k", 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("clearUserData apaga os dados pessoais, avisa quem assinou e guarda só preferências de tela", () => {
    writeStored("psycare:diary:v1", [{ texto: "segredo" }]);
    writeStored("psycare:remedios:v1", [1]);
    writeStored("psycare:sound:v1", true);
    window.localStorage.setItem("outro-app", "fica");
    const listener = vi.fn();
    subscribeStored("psycare:diary:v1", listener);

    clearUserData();

    expect(window.localStorage.getItem("psycare:diary:v1")).toBeNull();
    expect(window.localStorage.getItem("psycare:remedios:v1")).toBeNull();
    expect(readStored("psycare:diary:v1", "vazio")).toBe("vazio");
    expect(listener).toHaveBeenCalled();
    expect(window.localStorage.getItem("psycare:sound:v1")).toBe("true");
    expect(window.localStorage.getItem("outro-app")).toBe("fica");
  });
});
