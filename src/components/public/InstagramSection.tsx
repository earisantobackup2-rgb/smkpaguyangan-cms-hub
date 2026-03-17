import { Instagram } from "lucide-react";

interface Props {
  instagramUrl?: string;
}

export default function InstagramSection({ instagramUrl }: Props) {
  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Instagram className="inline h-3 w-3 mr-1" />
            Instagram
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Ikuti Kami di Instagram</h2>
          <p className="text-muted-foreground mt-2">Dapatkan update terbaru melalui media sosial kami</p>
        </div>

        <div className="flex justify-center">
          <a
            href={instagramUrl || "https://www.instagram.com/smk.mutu.pgy?igsh=MTNmNXgwY3Jqb29ocg=="}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-card shadow-card px-6 py-4 hover:shadow-elevated transition-shadow"
          >
            <Instagram className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-foreground">@smk.mutu.pgy</p>
              <p className="text-sm text-muted-foreground">Follow untuk info terbaru</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
