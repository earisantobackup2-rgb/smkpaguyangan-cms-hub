type Block =
  | { id: string; type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; url: string; alt?: string; position?: "left" | "right" | "center" | "full"; width?: number; caption?: string }
  | { id: string; type: "divider" }
  | { id: string; type: "button"; label: string; url: string };

export type PageBlock = Block;

export default function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose prose-neutral max-w-none">
      {blocks.map((b) => {
        switch (b.type) {
          case "heading": {
            const cls = "font-heading font-bold mt-6 mb-3 text-foreground";
            if (b.level === 1) return <h1 key={b.id} className={`text-3xl md:text-4xl ${cls}`}>{b.text}</h1>;
            if (b.level === 3) return <h3 key={b.id} className={`text-lg md:text-xl ${cls}`}>{b.text}</h3>;
            return <h2 key={b.id} className={`text-2xl md:text-3xl ${cls}`}>{b.text}</h2>;
          }
          case "paragraph":
            return <p key={b.id} className="text-base leading-relaxed text-foreground/90 whitespace-pre-line my-3">{b.text}</p>;
          case "image": {
            const pos = b.position || "center";
            const w = b.width ? `${b.width}%` : undefined;
            if (pos === "left" || pos === "right") {
              return (
                <figure key={b.id} className={`my-4 ${pos === "left" ? "float-left mr-4" : "float-right ml-4"}`} style={{ width: w || "40%" }}>
                  <img src={b.url} alt={b.alt || ""} className="w-full h-auto rounded-lg shadow-card" loading="lazy" />
                  {b.caption && <figcaption className="text-xs text-muted-foreground mt-1 text-center">{b.caption}</figcaption>}
                </figure>
              );
            }
            return (
              <figure key={b.id} className="my-6 clear-both" style={{ width: pos === "full" ? "100%" : (w || "100%"), marginLeft: pos === "center" ? "auto" : undefined, marginRight: pos === "center" ? "auto" : undefined }}>
                <img src={b.url} alt={b.alt || ""} className="w-full h-auto rounded-lg shadow-card" loading="lazy" />
                {b.caption && <figcaption className="text-xs text-muted-foreground mt-2 text-center">{b.caption}</figcaption>}
              </figure>
            );
          }
          case "divider":
            return <hr key={b.id} className="my-8 border-border clear-both" />;
          case "button":
            return (
              <div key={b.id} className="my-4 clear-both">
                <a href={b.url} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  {b.label}
                </a>
              </div>
            );
          default:
            return null;
        }
      })}
      <div className="clear-both" />
    </div>
  );
}