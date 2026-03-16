import type { Database } from "@/integrations/supabase/types";
import { Handshake } from "lucide-react";

type Partnership = Database["public"]["Tables"]["partnerships"]["Row"];

interface Props {
  partnerships: Partnership[];
}

export default function PartnershipsSection({ partnerships }: Props) {
  if (!partnerships.length) return null;

  const doubled = [...partnerships, ...partnerships];

  return (
    <section className="py-16">
      <div className="container text-center mb-10">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Handshake className="inline h-3 w-3 mr-1" />
          Kerjasama
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Mitra Industri</h2>
        <p className="text-muted-foreground mt-2">Kerjasama dengan berbagai perusahaan nasional</p>
      </div>

      <div className="overflow-hidden">
        <div className="flex animate-scroll-left gap-12 w-max">
          {doubled.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card shadow-card shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.company_name} className="h-10 w-10 object-contain" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {p.company_name.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{p.company_name}</p>
                {p.partnership_type && (
                  <p className="text-xs text-muted-foreground capitalize">{p.partnership_type}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
