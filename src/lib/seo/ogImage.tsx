import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/*
 * Share card (Facebook, WhatsApp, Messenger, X previews) in the homepage
 * hero's style: grey board, faint circuit traces, uppercase headline with the
 * crimson full stop. Used by the opengraph-image routes.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#ececec";
const TRACE = "#d0d0d0";
const NODE = "#bdbdbd";
const ACCENT = "#a4133c";

// The site's own type: Montserrat Bold for the headline, Inter for the rest.
// Bundled .woff files (OFL licensed) so cards render without a network fetch.
let assets: Promise<{ logo: string; montserrat: Buffer; inter: Buffer }> | null = null;
function loadAssets() {
  assets ??= (async () => {
    const root = process.cwd();
    const [logo, montserrat, inter] = await Promise.all([
      readFile(path.join(root, "public/logos/logoSecondaryBlack.png")),
      readFile(path.join(root, "src/assets/fonts/montserrat-latin-700-normal.woff")),
      readFile(path.join(root, "src/assets/fonts/inter-latin-400-normal.woff")),
    ]);
    return { logo: `data:image/png;base64,${logo.toString("base64")}`, montserrat, inter };
  })();
  return assets;
}

function Trace({ top, left, width }: { top: number; left: number; width: number }) {
  return (
    <div style={{ position: "absolute", top, left, display: "flex", alignItems: "center" }}>
      <div style={{ width, height: 2, background: TRACE }} />
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          border: `2px solid ${NODE}`,
          background: BG,
        }}
      />
    </div>
  );
}

export async function renderOgImage({
  eyebrow,
  title,
  subtitle = "Genuine tech, delivered across Nepal",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const { logo, montserrat, inter } = await loadAssets();
  const words = title.trim().split(/\s+/);
  // Long names get a smaller headline so they still fit on two or three lines.
  const size = title.length > 34 ? 60 : title.length > 20 ? 74 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "64px 80px",
          position: "relative",
          fontFamily: "Inter",
        }}
      >
        <Trace top={96} left={760} width={300} />
        <Trace top={150} left={860} width={220} />
        <Trace top={520} left={700} width={360} />
        <Trace top={570} left={820} width={240} />

        {/* 4044×1149 logo art, scaled to 260px wide */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={260} height={74} alt="" />

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 24,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "#555555",
                marginBottom: 20,
              }}
            >
              {eyebrow}
            </div>
          )}
          {/* One flex item per word so the accent full stop stays attached to
              the last word when the headline wraps. */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Montserrat",
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -2,
              textTransform: "uppercase",
              color: "#111111",
            }}
          >
            {words.map((word, i) =>
              i === words.length - 1 ? (
                <div key={i} style={{ display: "flex" }}>
                  {word}
                  <span style={{ color: ACCENT }}>.</span>
                </div>
              ) : (
                <div key={i} style={{ marginRight: size * 0.28 }}>
                  {word}
                </div>
              )
            )}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#555555" }}>
          {subtitle} · 361gadgets.com
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Montserrat", data: montserrat, weight: 700, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    }
  );
}
