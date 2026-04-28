import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHOOL_CONTEXT = "SMK Muhammadiyah 1 Paguyangan, Kabupaten Brebes, Jawa Tengah (NPSN 20338410)";

async function callAI(lovableKey: string, model: string, messages: any[], extra: Record<string, unknown> = {}) {
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, ...extra }),
  });
}

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
- Jika informasi tidak tersedia di knowledge base, JANGAN mengarang. Balas PERSIS dengan token: [[FALLBACK_SEARCH]]
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
    let reply: string = aiData.choices?.[0]?.message?.content ?? "Maaf, saya tidak dapat menjawab saat ini.";
    let usedFallback = false;
    let highlights: Array<{ title: string; snippet: string; source?: string }> = [];

    // Fallback: Google-style AI search via Gemini with web grounding
    if (reply.includes("[[FALLBACK_SEARCH]]")) {
      usedFallback = true;
      try {
        // 1) Pilih kategori paling relevan dari knowledge base untuk membatasi topik pencarian
        const categories = Array.from(
          new Set((knowledge || []).map((k) => k.category).filter(Boolean))
        ) as string[];

        let topic = "umum";
        let relevantCategory = "general";
        if (categories.length > 0) {
          const catRes = await callAI(
            lovableKey,
            "google/gemini-2.5-flash-lite",
            [
              {
                role: "system",
                content: `Pilih SATU kategori paling relevan dari daftar untuk pertanyaan user. Balas HANYA JSON: {"category":"<nama>","topic":"<frasa singkat topik pencarian dalam Bahasa Indonesia>"}.\nKategori tersedia: ${categories.join(", ")}.\nKonteks: ${SCHOOL_CONTEXT}.`,
              },
              { role: "user", content: message },
            ],
            { response_format: { type: "json_object" } }
          );
          if (catRes.ok) {
            try {
              const cd = await catRes.json();
              const parsed = JSON.parse(cd.choices?.[0]?.message?.content || "{}");
              if (parsed.category && categories.includes(parsed.category)) relevantCategory = parsed.category;
              if (parsed.topic) topic = parsed.topic;
            } catch { /* ignore */ }
          }
        }

        // 2) Pencarian terstruktur dibatasi topik & konteks sekolah
        const searchSystem = `Anda adalah asisten pencarian web yang HANYA mencari informasi seputar topik "${topic}" dalam konteks ${SCHOOL_CONTEXT}, kategori "${relevantCategory}".
ATURAN:
- Tolak pertanyaan di luar topik tersebut. Jika pertanyaan tidak relevan dengan topik/sekolah, balas highlights kosong dan answer berisi penolakan sopan.
- Gunakan Bahasa Indonesia.
- Output WAJIB JSON valid dengan skema:
{
  "topic": string,
  "answer": string (ringkas 2-4 kalimat),
  "highlights": [ { "title": string, "snippet": string (1-2 kalimat poin penting), "source": string (URL jika ada, opsional) } ] (1-4 item)
}`;
        const searchRes = await callAI(
          lovableKey,
          "google/gemini-2.5-flash",
          [
            { role: "system", content: searchSystem },
            { role: "user", content: `Pertanyaan: ${message}\nTopik wajib: ${topic}` },
          ],
          { response_format: { type: "json_object" } }
        );

        if (searchRes.ok) {
          const sd = await searchRes.json();
          const raw = sd.choices?.[0]?.message?.content || "{}";
          try {
            const parsed = JSON.parse(raw);
            const ans = String(parsed.answer || "").trim();
            const hs = Array.isArray(parsed.highlights) ? parsed.highlights : [];
            highlights = hs
              .filter((h: any) => h && (h.title || h.snippet))
              .slice(0, 4)
              .map((h: any) => ({
                title: String(h.title || "").slice(0, 160),
                snippet: String(h.snippet || "").slice(0, 400),
                source: h.source ? String(h.source).slice(0, 300) : undefined,
              }));

            if (ans || highlights.length) {
              const hlMd = highlights
                .map((h, i) => `${i + 1}. **${h.title}** — ${h.snippet}${h.source ? `  \n   🔗 ${h.source}` : ""}`)
                .join("\n");
              reply = `🔎 **Hasil pencarian web** _(topik: ${topic})_\n\n${ans}${hlMd ? `\n\n**Highlight jawaban:**\n${hlMd}` : ""}`;
            } else {
              reply = `Maaf, saya tidak menemukan informasi relevan tentang "${topic}" untuk ${SCHOOL_CONTEXT}. Silakan hubungi pihak sekolah.`;
            }
          } catch {
            reply = raw || "Maaf, hasil pencarian tidak dapat diproses.";
          }
        } else {
          reply = "Maaf, saya belum memiliki informasi tersebut di knowledge base sekolah. Silakan hubungi pihak sekolah secara langsung.";
        }
      } catch (_e) {
        reply =
          "Maaf, saya belum memiliki informasi tersebut di knowledge base sekolah. Silakan hubungi pihak sekolah secara langsung.";
      }
    }

    // Log conversation
    if (sessionId) {
      await supabase.from("chatbot_conversations").insert({
        session_id: sessionId,
        user_message: message,
        bot_response: reply,
      });
    }

    return new Response(JSON.stringify({ reply, fallback: usedFallback, highlights }), {
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
