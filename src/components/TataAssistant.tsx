import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Send, Loader2 } from "lucide-react";

const TATA_AVATAR = "https://ui-avatars.com/api/?name=Tata&background=22c55e&color=fff&rounded=true&size=64";

function getStorageKey(userId: string) {
  return `tata-chat-history-${userId}`;
}

export default function TataAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "tata"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(getStorageKey(user.id));
      if (saved) setMessages(JSON.parse(saved));
    }
  }, [user?.id]);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  // Scroll automático
  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tata-chat", {
        body: {
          messages: [...messages, userMsg],
          userId: user?.id,
        },
      });
      let tataReply =
        data?.reply ||
        (error?.message ? `Desculpe, houve um erro: ${error.message}` : "Desculpe, não consegui responder agora.");
      setMessages((msgs) => [...msgs, { role: "tata", content: tataReply }]);
    } catch (e: any) {
      setMessages((msgs) => [
        ...msgs,
        { role: "tata", content: "Desculpe, não consegui responder agora." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-50 bottom-6 right-6 bg-primary text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-2 hover:bg-primary/90 transition-all"
        >
          <img src={TATA_AVATAR} alt="Tata" className="w-8 h-8 rounded-full border-2 border-white" />
          <span className="font-bold">Tata</span>
        </button>
      )}
      {/* Chat Drawer */}
      {open && (
        <div className="fixed z-50 bottom-6 right-6 w-[370px] max-w-[95vw] bg-white border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-green-400/80 via-green-500/80 to-lime-400/80">
            <img src={TATA_AVATAR} alt="Tata" className="w-10 h-10 rounded-full border-2 border-white shadow" />
            <div className="flex-1">
              <div className="font-bold text-lg text-white drop-shadow">Tata</div>
              <div className="text-xs text-white/80">Especialista Agro</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full text-2xl font-bold"
              title="Fechar"
            >
              ×
            </button>
          </div>
          {/* Chat Body */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30" style={{ minHeight: 240, maxHeight: 400 }}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-8">Como posso ajudar você hoje?</div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm whitespace-pre-line shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-green-50 border border-green-200 text-green-900 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 bg-green-50 border border-green-200 text-green-900 flex items-center gap-2 shadow-sm">
                  <Loader2 className="animate-spin w-4 h-4" /> Tata está digitando...
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2 items-end">
            <textarea
              className="flex-1 resize-none border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-muted/10 text-black"
              rows={1}
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              style={{ minHeight: 36, maxHeight: 80 }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-primary text-white rounded-lg p-2 flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 shadow"
              title="Enviar"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
} 