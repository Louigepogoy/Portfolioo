import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import data from "../../shared/portfolio.json";

export const alt = "Louie, Full-Stack Web Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview shown when the site is shared on Facebook, Messenger, Discord, etc.
export default async function OpengraphImage() {
  const { profile, projects } = data;
  const photo = await readFile(path.join(process.cwd(), "public", profile.photo));
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  // Deterministic dust dots for the background.
  const dots = Array.from({ length: 140 }, (_, i) => {
    const a = i * 2.39996;
    const r = 120 + ((i * 37) % 260);
    return { x: 860 + Math.cos(a) * r * 1.3, y: 315 + Math.sin(a) * r * 0.7, s: 2 + (i % 3), o: 0.25 + (i % 5) * 0.12 };
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0a14", color: "#ece9f7", position: "relative" }}>
        {dots.map((d, i) => (
          <div
            key={i}
            style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: 9, background: `rgba(236,233,247,${d.o})` }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 680 }}>
          <div style={{ fontSize: 30, color: "#a78bfa", fontWeight: 600 }}>Portfolio</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>{`Hi, I'm ${profile.name}`}</div>
          <div style={{ fontSize: 44, fontWeight: 700, marginTop: 10, color: "#c4b5fd" }}>{profile.role}</div>
          <div style={{ fontSize: 26, color: "#a39fbd", marginTop: 28 }}>{projects.map((p) => p.title).join("  ·  ")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div style={{ display: "flex", padding: 8, borderRadius: 32, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            <img src={photoSrc} width={300} height={400} style={{ borderRadius: 26, objectFit: "cover" }} />
          </div>
        </div>
      </div>
    ),
    size
  );
}
