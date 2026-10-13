// Generates animated SVG cards for private projects + the README "Projects" section.
// Edit projects.json, then run: node scripts/generate-cards.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const projects = JSON.parse(readFileSync("projects.json", "utf8"));
mkdirSync("assets/projects", { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";

function wrap(text, max) {
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function card(p) {
  const W = 840, H = 156, a = p.accent || "#70a5fd";
  const tag = wrap(p.tagline, 108).slice(0, 1);
  let x = 24; const chips = [];
  for (const s of p.stack) {
    const w = Math.round(s.length * 6.6 + 18);
    if (x + w > W - 24) break;
    chips.push(`<g transform="translate(${x},104)"><rect width="${w}" height="22" rx="11" fill="${a}" fill-opacity="0.14" stroke="${a}" stroke-opacity="0.5"/><text x="${w / 2}" y="15" text-anchor="middle" class="chip">${esc(s)}</text></g>`);
    x += w + 6;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.title)}">
<title>${esc(p.title)}</title>
<style>
  .t{font:700 19px ${FONT};fill:#c0caf5}
  .d{font:600 12px ${FONT};fill:${a};letter-spacing:.3px}
  .g{font:400 13px ${FONT};fill:#a9b1d6}
  .chip{font:600 11px ${FONT};fill:#c0caf5}
  .b{font:700 10px ${FONT};fill:#1a1b27;letter-spacing:1px}
  .h{font:500 11px ${FONT};fill:#565f89}
  .in{opacity:0;animation:in .7s ease-out forwards}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .glow{animation:dash 6s linear infinite}
  @keyframes dash{to{stroke-dashoffset:-1960}}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
</style>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1b27"/><stop offset="1" stop-color="#24283b"/></linearGradient>
  <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}" stop-opacity="0"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></linearGradient>
</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="url(#bg)" stroke="#2f334d"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="none" stroke="url(#ac)" stroke-width="2" stroke-dasharray="300 1660" class="glow"/>
<g class="in" style="animation-delay:.05s">
  <rect x="${W - 104}" y="18" width="80" height="20" rx="10" fill="${a}"/>
  <g transform="translate(${W - 96},22)" fill="#1a1b27"><rect x="0" y="5" width="9" height="7" rx="1.5"/><path d="M2 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#1a1b27" stroke-width="1.6" fill="none"/></g>
  <text x="${W - 56}" y="32" text-anchor="middle" class="b">PRIVATE</text>
  <text x="24" y="34" class="d">${esc(p.domain.toUpperCase())}</text>
</g>
<g class="in" style="animation-delay:.2s"><text x="24" y="66" class="t">${esc(p.title)}</text></g>
<g class="in" style="animation-delay:.35s">${tag.map((l, i) => `<text x="24" y="${92 + i * 19}" class="g">${esc(l)}</text>`).join("")}</g>
<g class="in" style="animation-delay:.5s">${chips.join("")}</g>
<text x="${W - 24}" y="${H - 10}" text-anchor="end" class="h pulse">▸ click to expand case study</text>
</svg>
`;
}

for (const p of projects) writeFileSync(`assets/projects/${p.id}.svg`, card(p));

const section = projects.map((p) => `<details>
<summary><img src="assets/projects/${p.id}.svg" width="100%" alt="${esc(p.title)}"/></summary>
<br/>

> **Role:** ${p.role} &nbsp;·&nbsp; 🔒 Code is private under NDA, [ask me for a walkthrough](mailto:hrachgalstyann@gmail.com?subject=${encodeURIComponent("Walkthrough: " + p.title)})

**🧩 The problem**<br/>
${p.problem}

**🛠️ What I built**
${p.built.map((b) => `- ${b}`).join("\n")}

**🏗️ Architecture** <sub>(drag / zoom the diagram)</sub>

\`\`\`mermaid
${p.diagram}
\`\`\`

**📈 Impact**
${p.impact.map((b) => `- ${b}`).join("\n")}

**Stack:** ${p.stack.map((s) => `\`${s}\``).join(" ")}

</details>
`).join("\n");

const readme = readFileSync("README.md", "utf8");
const out = readme.replace(/<!--PROJECTS_START-->[\s\S]*?<!--PROJECTS_END-->/, `<!--PROJECTS_START-->\n${section}\n<!--PROJECTS_END-->`);
writeFileSync("README.md", out);
console.log(`Generated ${projects.length} project cards`);
