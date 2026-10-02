"use client";

import Image from "next/image";
import { useState } from "react";
import { useMessages } from "@/features/messages/hooks/useMessages";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard } from "@/components/ui/TiltCard";

export function MessagesView() {
  const { chats, activeChat, activeChatId, setActiveChatId, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState<string>("");
  const [error, setError] = useState("");

  const handleSendMessage = (chatId: string) => {
    if (!newMessage.trim()) return;

    const result = sendMessage({
      chatId,
      content: newMessage,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setError("");
    setNewMessage("");
  };

  const handleQuickAction = (text: string) => {
    setNewMessage(text);
  };

  return (
    // Fundo transparente para permitir a visibilidade do BackgroundCharacter
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-transparent min-h-full">
      <div>
        <AnimatedText as="h1" text="Minhas Mensagens" className="text-2xl font-semibold text-[#2f3a32]" />
        <p className="text-slate-600 text-sm mt-1">Converse em tempo real com a sua equipa médica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Painel Lateral de Conversas */}
        <TiltCard className="md:col-span-4 bg-[#fdfcf9]/85 backdrop-blur-sm p-4 rounded-xl border border-black/5 shadow-sm space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Conversas</h2>

          {chats.length === 0 ? (
            <div className="rounded-lg border border-neutral-200/60 p-4 bg-white/80">
              <p className="text-sm font-medium text-[#2f3a32]">Nenhuma conversa ativa</p>
              <p className="text-xs text-slate-600 mt-1">Assim que você iniciar um atendimento, ele aparecerá aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const isSelected = chat.id === activeChatId;
                return (
                  <MagneticButton
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${
                      isSelected
                        ? "bg-emerald-50/90 border border-emerald-200 shadow-sm"
                        : "hover:bg-slate-50/80 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={chat.avatarUrl || "/avatar-placeholder.png"}
                        alt={chat.doctorName}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        unoptimized={!chat.avatarUrl?.startsWith("/")} // Evita erros de otimização em links externos
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-700 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#2f3a32] text-sm truncate">{chat.doctorName}</h3>
                      <p className="text-xs text-emerald-800 font-medium">{chat.specialty}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{chat.lastMessage}</p>
                    </div>
                  </MagneticButton>
                );
              })}
            </div>
          )}
        </TiltCard>

        {/* Área de Chat Ativo */}
        {activeChat ? (
          <TiltCard className="md:col-span-8 bg-[#fdfcf9]/85 backdrop-blur-sm p-6 rounded-xl border border-black/5 shadow-sm flex flex-col h-[600px]">
            {/* Cabeçalho do Chat */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <Image
                    src={activeChat.avatarUrl || "/avatar-placeholder.png"}
                    alt={activeChat.doctorName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border"
                    unoptimized={!activeChat.avatarUrl?.startsWith("/")}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-700 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#2f3a32]">{activeChat.doctorName}</h2>
                  <p className="text-xs text-emerald-800 font-medium">Online • {activeChat.specialty}</p>
                </div>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 my-2">
              {activeChat.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center px-8">
                  <div>
                    <p className="text-base font-medium text-[#2f3a32]">Conversa iniciada</p>
                    <p className="text-sm text-slate-600 mt-1">Envie uma mensagem para começar este acompanhamento.</p>
                  </div>
                </div>
              ) : (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-xl max-w-[75%] text-sm ${
                      message.sender === "user"
                        ? "bg-emerald-800 text-white ml-auto"
                        : "bg-slate-100 text-slate-800 mr-auto"
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-[10px] block mt-1 text-right opacity-75">{message.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="flex gap-2 overflow-x-auto pt-2 pb-1 text-xs no-scrollbar">
              <MagneticButton
                type="button"
                onClick={() => handleQuickAction("Tenho uma dúvida sobre a medicação: ")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 rounded-full transition border border-slate-200 whitespace-nowrap"
              >
                Dúvida remédio
              </MagneticButton>
              <MagneticButton
                type="button"
                onClick={() => handleQuickAction("Gostaria de enviar o resultado de um exame: ")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 rounded-full transition border border-slate-200 whitespace-nowrap"
              >
                Enviar exame
              </MagneticButton>
              <MagneticButton
                type="button"
                onClick={() => handleQuickAction("Estou a sentir o seguinte sintoma novo: ")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 rounded-full transition border border-slate-200 whitespace-nowrap"
              >
                Sintoma novo
              </MagneticButton>
            </div>

            {/* Formulário de Envio */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(activeChat.id);
              }}
              className="flex items-center gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva a sua mensagem..."
                className="flex-1 border border-neutral-200/70 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800/20 bg-white/90"
              />

              <MagneticButton type="submit" className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm">
                Enviar
              </MagneticButton>
            </form>

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </TiltCard>
        ) : (
          <TiltCard className="md:col-span-8 bg-[#fdfcf9]/85 backdrop-blur-sm p-8 rounded-xl border border-black/5 text-center text-slate-500 shadow-sm">
            <p className="font-medium text-[#2f3a32]">Nenhuma conversa selecionada.</p>
            <p className="text-sm mt-1">Selecione uma conversa no painel lateral para continuar.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}