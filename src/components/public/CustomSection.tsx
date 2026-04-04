
interface CustomSectionData {
  heading: string;
  subheading?: string | null;
  content?: string | null;
  image_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  bg_color?: string | null;
  layout: string;
}

export default function CustomSection({ data }: { data: CustomSectionData }) {
  const bg = data.bg_color ? { backgroundColor: data.bg_color } : undefined;

  const heading = (
    <>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{data.heading}</h2>
      {data.subheading && <p className="text-muted-foreground mt-2">{data.subheading}</p>}
    </>
  );

  const textBlock = (
    <div className={data.layout === "center" ? "text-center" : ""}>
      {heading}
      {data.content && (
        <div
          className="mt-4 text-muted-foreground leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      )}
      {data.button_text && data.button_url && (
        <a
          href={data.button_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-6"
        >
          {data.button_text}
        </a>
      )}
    </div>
  );

  const image = data.image_url ? (
    <img
      src={data.image_url}
      alt={data.heading}
      className="rounded-xl w-full h-auto object-cover max-h-[400px]"
    />
  ) : null;

  if (data.layout === "left-image") {
    return (
      <section className="py-16 bg-background" style={bg}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>{image}</div>
            <div>{textBlock}</div>
          </div>
        </div>
      </section>
    );
  }

  if (data.layout === "right-image") {
    return (
      <section className="py-16 bg-background" style={bg}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>{textBlock}</div>
            <div>{image}</div>
          </div>
        </div>
      </section>
    );
  }

  // center layout
  return (
    <section className="py-16 bg-background" style={bg}>
      <div className="container max-w-3xl mx-auto text-center">
        {image && <div className="mb-8">{image}</div>}
        {textBlock}
      </div>
    </section>
  );
}
