"use client";

import { useState } from "react";
import { mockUser, Chat, MessageItem } from "@/data/mockData";

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>(mockUser.chats || []);
  const [activeChatId, setActiveChatId] = useState<string>(chats[0]?.id || "");
  const [newMessage, setNewMessage] = useState<string>("");

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const handleSendMessage = (chatId: string) => {
    if (newMessage.trim() === "") return;

    const newMsg: MessageItem = {
      id: crypto.randomUUID(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: newMsg.content,
            messages: [...chat.messages, newMsg],
          };
        }
        return chat;
      })
    );

    setNewMessage("");
  };

  const handleQuickAction = (text: string) => {
    setNewMessage(text);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Minhas <span className="text-emerald-600">Mensagens</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Converse em tempo real com a sua equipa médica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Painel Esquerdo: Lista de Conversas */}
        <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Conversas
          </h2>

          <div className="space-y-2">
            {chats.map((chat) => {
              const isSelected = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${
                    isSelected
                      ? "bg-emerald-50 border border-emerald-200 shadow-sm"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={chat.avatarUrl}
                      alt={chat.doctorName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">
                        {chat.doctorName}
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">
                      {chat.specialty}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel Direito: Janela de Chat Ativo */}
        {activeChat ? (
          <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
            
            {/* Cabeçalho do Chat */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeChat.avatarUrl}
                    alt={activeChat.doctorName}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{activeChat.doctorName}</h2>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Online • {activeChat.specialty}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`A iniciar chamada com ${activeChat.doctorName}...`)}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 flex items-center gap-1.5"
              >
                <span>📞</span> Ligar
              </button>
            </div>

            {/* Histórico de Mensagens */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 my-2">
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-2xl max-w-[75%] text-sm ${
                    message.sender === "user"
                      ? "bg-emerald-600 text-white ml-auto rounded-br-none"
                      : "bg-slate-100 text-slate-800 mr-auto rounded-bl-none"
                  }`}
                >
                  <p>{message.content}</p>
                  <span
                    className={`text-[10px] block mt-1 text-right ${
                      message.sender === "user"
                        ? "text-emerald-100"
                        : "text-slate-400"
                    }`}
                  >
                    {message.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Ações Rápidas (Pills) */}
            <div className="flex gap-2 overflow-x-auto pt-2 pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => handleQuickAction("Tenho uma dúvida sobre a medicação: ")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-full transition border border-slate-200 whitespace-nowrap"
              >
                💊 Dúvida remédio
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction("Gostaria de enviar o resultado de um exame: ")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-full transition border border-slate-200 whitespace-nowrap"
              >
                📋 Enviar exame
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction("Estou a sentir o seguinte sintoma novo: ")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-full transition border border-slate-200 whitespace-nowrap"
              >
                🚨 Sintoma novo
              </button>
            </div>

            {/* Form de Envio */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(activeChat.id);
              }}
              className="flex items-center gap-2 pt-2 border-t border-slate-100"
            >
              <button
                type="button"
                title="Anexar ficheiro"
                onClick={() => alert("Funcionalidade de anexo em desenvolvimento!")}
                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition text-base"
              >
                📎
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva a sua mensagem..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
              >
                Enviar
              </button>
            </form>

          </div>
        ) : (
          <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400">
            Nenhuma conversa selecionada.
          </div>
        )}

      </div>
    </div>
  );
}