import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function stripHtml(html: string): { text: string; title: string; links: string[] } {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract internal links before stripping
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const links: string[] = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    links.push(m[1]);
  }

  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return { text, title, links };
}

async function checkAdmin(req: Request, supabase: any): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) return false;
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  return (roles || []).some((r: any) => r.role === "administrator" || r.role === "admin");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const isAdmin = await checkAdmin(req, supabase);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { url, maxPages = 5, category = "crawled" } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = new URL(url);
    const origin = baseUrl.origin;
    const visited = new Set<string>();
    const queue: string[] = [url];
    const results: Array<{ url: string; title: string; content: string }> = [];

    while (queue.length > 0 && results.length < maxPages) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      try {
        const res = await fetch(current, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; SchoolBot/1.0)" },
        });
        if (!res.ok) continue;
        const html = await res.text();
        const { text, title, links } = stripHtml(html);

        if (text.length > 100) {
          results.push({
            url: current,
            title: title || current,
            content: text.slice(0, 8000),
          });
        }

        // Enqueue same-origin links
        for (const link of links) {
          try {
            const abs = new URL(link, current).toString().split("#")[0];
            const u = new URL(abs);
            if (u.origin === origin && !visited.has(abs) && !queue.includes(abs)) {
              if (!/\.(jpg|jpeg|png|gif|svg|pdf|zip|css|js|ico|webp)(\?|$)/i.test(abs)) {
                queue.push(abs);
              }
            }
          } catch { /* ignore */ }
        }
      } catch (e) {
        console.error("crawl page error", current, e);
      }
    }

    // Insert into knowledge base
    let inserted = 0;
    for (const r of results) {
      const { error } = await supabase.from("chatbot_knowledge").insert({
        title: r.title.slice(0, 200),
        content: r.content,
        source_url: r.url,
        category,
        is_active: true,
      });
      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({ success: true, pagesCrawled: results.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chatbot-crawl error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
