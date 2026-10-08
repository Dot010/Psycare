import { beforeEach, describe, expect, it, vi } from "vitest";
import { readStored, removeStored, subscribeStored, writeStored } from "./storage";

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
});
