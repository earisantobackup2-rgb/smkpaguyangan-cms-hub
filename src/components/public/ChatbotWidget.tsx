import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import arinaAvatar from "@/assets/arina-chatbot.png";

type Msg = { role: "user" | "assistant"; content: string };

function getSessionId() {
  let id = sessionStorage.getItem("chatbot_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chatbot_session", id);
  }
  return id;
}

const POSITION_CLASSES: Record<string, string> = {
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: settings } = useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("chatbot_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (open && settings && messages.length === 0) {
      setMessages([{ role: "assistant", content: settings.welcome_message }]);
    }
  }, [open, settings, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!settings || !settings.is_enabled) return null;

  const color = settings.primary_color || "#10b981";
  const positionClass = POSITION_CLASSES[settings.position] || POSITION_CLASSES["bottom-right"];
  const isTop = settings.position?.startsWith("top");
  const isLeft = settings.position?.endsWith("left");

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chatbot-chat", {
        body: {
          message: text,
          sessionId: getSessionId(),
          history: newMessages.slice(-8),
        },
      });
      if (error) throw error;
      const reply = data?.reply || data?.error || "Maaf, terjadi kesalahan.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Maaf, layanan sedang tidak tersedia. Coba lagi nanti." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div
        className={cn("fixed z-[60] pointer-events-none", positionClass)}
        style={{
          padding: `${settings.offset_y || 24}px ${settings.offset_x || 24}px`,
        }}
      >
        {!open && (
          <div className="pointer-events-auto relative">
            {/* Drop shadow under the circle */}
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 -bottom-3 h-3 w-14 rounded-[50%] blur-md opacity-40"
              style={{ background: "rgba(0,0,0,0.55)" }}
            />
            <button
              onClick={() => setOpen(true)}
              aria-label={`Buka chatbot ${settings.bot_name}`}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white overflow-hidden transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 animate-bounce-slow"
              style={{
                border: `3px solid ${color}`,
                boxShadow: `0 12px 24px -8px rgba(0,0,0,0.35), 0 0 0 4px ${color}22`,
              }}
            >
              {/* Pulsing outline ring */}
              <span
                className="absolute -inset-1 rounded-full animate-ping-slow pointer-events-none"
                style={{ border: `2px solid ${color}`, opacity: 0.6 }}
              />
              <img
                src={arinaAvatar}
                alt={settings.bot_name}
                className="h-full w-full object-cover object-top scale-110"
                draggable={false}
              />
            </button>
            {/* Online dot */}
            <span
              aria-hidden
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
              style={{ background: color }}
            />
          </div>
        )}

        {open && (
          <div
            className={cn(
              "pointer-events-auto flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl",
              "h-[min(560px,calc(100vh-6rem))]"
            )}
            style={{ borderColor: color }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ background: color }}
            >
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-white ring-2 ring-white/40">
                  <img src={arinaAvatar} alt={settings.bot_name} className="h-full w-full object-cover object-top scale-110" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{settings.bot_name}</p>
                  <p className="text-[11px] opacity-90 leading-tight">● Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup chatbot"
                className="rounded-md p-1 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      m.role === "user"
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-background border"
                    )}
                    style={m.role === "user" ? { background: color } : undefined}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border bg-background px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 border-t bg-background p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={settings.placeholder_text}
                className="flex-1 rounded-full border bg-muted/50 px-4 py-2 text-sm outline-none focus:ring-2"
                style={{ ['--tw-ring-color' as any]: color }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
                style={{ background: color }}
                aria-label="Kirim"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
