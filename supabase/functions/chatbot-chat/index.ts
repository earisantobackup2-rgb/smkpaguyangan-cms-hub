import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, sessionId, history = [] } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch active knowledge base
    const { data: knowledge } = await supabase
      .from("chatbot_knowledge")
      .select("title, content, category, source_url")
      .eq("is_active", true)
      .limit(200);

    const kbText = (knowledge || [])
      .map(
        (k, i) =>
          `[${i + 1}] ${k.title}${k.category ? ` (${k.category})` : ""}\n${k.content}${k.source_url ? `\nSumber: ${k.source_url}` : ""}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `Anda adalah asisten virtual resmi SMK Muhammadiyah 1 Paguyangan. Jawablah dalam Bahasa Indonesia yang sopan, ramah, dan singkat.

ATURAN:
- Gunakan HANYA informasi dari KNOWLEDGE BASE di bawah ini sebagai sumber utama.
- Jika informasi tidak tersedia di knowledge base, jawab dengan jujur: "Maaf, saya belum memiliki informasi mengenai hal tersebut. Silakan hubungi pihak sekolah secara langsung."
- Jangan mengarang fakta tentang sekolah, jurusan, atau program.
- Format jawaban dengan rapi (gunakan list bila perlu).

=== KNOWLEDGE BASE ===
${kbText || "(Belum ada knowledge base yang diisi.)"}
=== AKHIR KNOWLEDGE BASE ===`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI error", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Coba lagi sebentar." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit AI habis. Hubungi admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const reply = aiData.choices?.[0]?.message?.content ?? "Maaf, saya tidak dapat menjawab saat ini.";

    // Log conversation
    if (sessionId) {
      await supabase.from("chatbot_conversations").insert({
        session_id: sessionId,
        user_message: message,
        bot_response: reply,
      });
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot-chat error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
