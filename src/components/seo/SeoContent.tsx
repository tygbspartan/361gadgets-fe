/*
 * Long-form SEO copy for a category, written in the admin as plain text:
 *   - a blank line starts a new paragraph
 *   - a line starting "## " is a subheading (h2), "### " a smaller one (h3)
 *   - lines starting "- " form a bullet list
 * Rendered as React text (never as HTML), so nothing typed can inject markup.
 */
type Block =
  | { kind: "h2" | "h3" | "p"; text: string }
  | { kind: "ul"; items: string[] };

function parse(content: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of content.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let para: string[] = [];
    const flush = () => {
      if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    };
    for (const line of lines) {
      if (line.startsWith("### ")) {
        flush();
        blocks.push({ kind: "h3", text: line.slice(4).trim() });
      } else if (line.startsWith("## ")) {
        flush();
        blocks.push({ kind: "h2", text: line.slice(3).trim() });
      } else if (/^[-*] /.test(line)) {
        flush();
        const last = blocks[blocks.length - 1];
        if (last?.kind === "ul") last.items.push(line.slice(2).trim());
        else blocks.push({ kind: "ul", items: [line.slice(2).trim()] });
      } else {
        para.push(line);
      }
    }
    flush();
  }
  return blocks;
}

export default function SeoContent({ content }: { content: string | null | undefined }) {
  const blocks = content?.trim() ? parse(content) : [];
  if (!blocks.length) return null;

  return (
    // Set apart from the product grid in a light grey panel, text spanning its
    // full width.
    <section className="rounded-2xl bg-[#F5F5F5] px-5 py-7 lg:px-10 lg:py-10">
      <div className="space-y-4 font-inter text-[14px] lg:text-[15px] leading-7 text-[#4B4B4B]">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h2":
            return (
              <h2 key={i} className="pt-2 font-montserrat text-[18px] lg:text-[22px] font-semibold leading-tight text-[#111111] first:pt-0">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-1 font-montserrat text-[15px] lg:text-[17px] font-semibold text-[#111111]">
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{b.text}</p>;
        }
      })}
      </div>
    </section>
  );
}
