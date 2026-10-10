import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "eCenovnik: uporedi cene u svojim marketima";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori cannot read CSS variables, so the palette tokens from globals.css are repeated here.
const C = {
  ink: "#1a1a1a",
  inkWarm: "#6b6355",
  sageDark: "#4f5c42",
  sage: "#70845F",
  cream: "#FFEDD0",
  creamBorder: "#efe0c4",
  terracotta: "#DA864D",
  stone: "#c4bfb4",
  rust: "#A85B2A",
  line: "#e0e0e0",
  muted: "#666",
  sand: "#f1eee8",
};

const svg = (body: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${body}</svg>`)}`;

const MILK = svg(
  `<path d="M42 22h36v14l12 16v54a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V52l12-16z" fill="#fff" stroke="${C.stone}" stroke-width="3"/>` +
    `<path d="M30 60h60v26H30z" fill="${C.sage}"/><path d="M42 22h36v8H42z" fill="${C.stone}"/>`,
);
const BREAD = svg(
  `<path d="M18 62c0-18 18-28 42-28s42 10 42 28c0 6-4 9-8 9v23a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V71c-4 0-8-3-8-9z" fill="#e8b98a" stroke="${C.rust}" stroke-width="3"/>` +
    `<path d="M44 52l6 12M60 50v14M76 52l-6 12" stroke="${C.rust}" stroke-width="3" stroke-linecap="round"/>`,
);

function ProductCard({ image, name, price, regular, discount, shift }: { image: string; name: string; price: string; regular?: string; discount?: string; shift: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 260, transform: `translateY(${shift}px)`, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 18px 40px rgba(26,26,26,0.10)" }}>
      <div style={{ display: "flex", position: "relative", alignItems: "center", justifyContent: "center", height: 200, background: C.sand }}>
        <img src={image} width={130} height={130} alt="" />
        {discount && (
          <span style={{ position: "absolute", left: 14, top: 14, padding: "6px 12px", borderRadius: 9, background: C.rust, color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "0.04em" }}>AKCIJA</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "18px 20px 22px" }}>
        <span style={{ fontSize: 22, color: C.ink }}>{name}</span>
        <span style={{ marginTop: 10, fontSize: 32, fontWeight: 600, color: C.rust, letterSpacing: "-0.02em" }}>{price}</span>
        {regular && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 18, color: C.muted, textDecoration: "line-through" }}>{regular}</span>
            <span style={{ padding: "3px 8px", borderRadius: 7, background: C.rust, color: "#fff", fontSize: 15, fontWeight: 600 }}>{discount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function OpengraphImage() {
  const [regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", padding: "64px 72px", background: C.cream, fontFamily: "Geist" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 52 }}>
              <span style={{ width: 18, height: 52, borderRadius: 8, background: C.terracotta }} />
              <span style={{ width: 18, height: 36, borderRadius: 8, background: C.stone }} />
              <span style={{ width: 18, height: 21, borderRadius: 8, background: C.sage }} />
            </div>
            <span style={{ display: "flex", fontSize: 44, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1 }}>
              <span style={{ color: C.terracotta }}>e</span>
              <span style={{ color: C.ink }}>Cenovnik</span>
            </span>
          </div>
          <span style={{ marginTop: 64, fontSize: 60, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.035em", color: C.ink, textWrap: "balance" }}>Uporedi cene u svojim marketima.</span>
          <span style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: C.inkWarm }}>Pronađi najnižu cenu i sastavi listu za kupovinu.</span>
          <span style={{ marginTop: "auto", fontSize: 24, fontWeight: 600, color: C.sageDark }}>web.ecenovnik.app</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginLeft: 48 }}>
          <ProductCard image={MILK} name="Mleko 2,8% 1 l" price="129,99 RSD" shift={-30} />
          <ProductCard image={BREAD} name="Hleb beli 500 g" price="74,99 RSD" regular="89,99 RSD" discount="−17%" shift={30} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
