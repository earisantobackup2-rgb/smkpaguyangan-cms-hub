import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import arinaAvatar from "@/assets/arina-chatbot.png";

type Msg = { role: "user" | "assistant"; content: string };

const DAILY_LIMIT = 10;

function getTodayKey() {
  const d = new Date();
  return `chatbot_quota_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getTodayCount() {
  try {
    return parseInt(localStorage.getItem(getTodayKey()) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementTodayCount() {
  try {
    const key = getTodayKey();
    const next = getTodayCount() + 1;
    localStorage.setItem(key, String(next));
    // Cleanup older quota keys
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("chatbot_quota_") && k !== key) {
        localStorage.removeItem(k);
      }
    }
    return next;
  } catch {
    return 0;
  }
}

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
  const [usedCount, setUsedCount] = useState(0);
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
    if (open) setUsedCount(getTodayCount());
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!settings || !settings.is_enabled) return null;

  const color = settings.primary_color || "#10b981";
  const outlineColor = (settings as any).outline_color || color;
  const avatarSize = (settings as any).avatar_size || 64;
  const pingEnabled = (settings as any).ping_enabled ?? true;
  const pingDuration = (settings as any).ping_duration_s ?? 2.5;
  const bounceEnabled = (settings as any).bounce_enabled ?? true;
  const bounceDuration = (settings as any).bounce_duration_s ?? 2.5;
  const positionClass = POSITION_CLASSES[settings.position] || POSITION_CLASSES["bottom-right"];
  const isTop = settings.position?.startsWith("top");
  const isLeft = settings.position?.endsWith("left");

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const currentCount = getTodayCount();
    if (currentCount >= DAILY_LIMIT) {
      setMessages((m) => [
        ...m,
        { role: "user", content: text },
        {
          role: "assistant",
          content: `Maaf, Anda telah mencapai batas ${DAILY_LIMIT} pertanyaan per hari. Silakan kembali besok ya! 😊`,
        },
      ]);
      setInput("");
      return;
    }
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
      setUsedCount(incrementTodayCount());
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
          <div
            className="pointer-events-auto relative"
            style={
              bounceEnabled
                ? { animation: `arina-bounce ${bounceDuration}s ease-in-out infinite` }
                : undefined
            }
          >
            <button
              onClick={() => setOpen(true)}
              aria-label={`Buka chatbot ${settings.bot_name}`}
              className="relative flex items-center justify-center rounded-full bg-white overflow-hidden transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                border: `3px solid ${outlineColor}`,
                boxShadow: `0 10px 15px -3px ${outlineColor}55, 0 4px 6px -4px ${outlineColor}44`,
              }}
            >
              {/* Pulsing outline ring */}
              {pingEnabled && (
                <span
                  className="absolute -inset-1 rounded-full pointer-events-none"
                  style={{
                    border: `2px solid ${outlineColor}`,
                    opacity: 0.6,
                    animation: `ping ${pingDuration}s cubic-bezier(0,0,0.2,1) infinite`,
                  }}
                />
              )}
              <img
                src={(settings as any).avatar_url || arinaAvatar}
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
            {/* Ground shadow */}
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none"
              style={{
                bottom: `-${Math.round(avatarSize * 0.18)}px`,
                width: `${Math.round(avatarSize * 0.7)}px`,
                height: `${Math.round(avatarSize * 0.12)}px`,
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 70%)',
                animation: bounceEnabled
                  ? `arina-shadow ${bounceDuration}s ease-in-out infinite`
                  : undefined,
                filter: 'blur(2px)',
              }}
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
                  <img src={(settings as any).avatar_url || arinaAvatar} alt={settings.bot_name} className="h-full w-full object-cover object-top scale-110" />
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
