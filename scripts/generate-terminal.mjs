// Generates assets/terminal.svg, an animated "typing" terminal. Edit LINES and rerun.
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("assets", { recursive: true });

// [kind, text]: "cmd" lines type out char by char, "out" lines appear at once.
const LINES = [
  ["cmd", "whoami"],
  ["out", "hrach galstyan · full stack software engineer · yerevan, armenia"],
  ["cmd", "cat stack.txt"],
  ["out", "backend   →  node.js · nestjs · express · graphql · rest"],
  ["out", "frontend  →  react · typescript · material ui"],
  ["out", "data      →  postgresql · mongodb · redis · elasticsearch"],
  ["out", "infra     →  aws · docker · kafka · rabbitmq · github actions"],
  ["out", "ai        →  openai · langchain · pinecone"],
  ["cmd", "./current_focus.sh"],
  ["out", "▶ real-time, event-driven backends & AI-powered products"],
  ["cmd", "echo $STATUS"],
  ["out", "✔ open to collaborations, scroll down to play tic-tac-toe 🎮"],
];

const W = 860, LH = 22, TOP = 58, CW = 8.45, FS = 14;
const H = TOP + LINES.length * LH + 40;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let t = 0.6, defs = "", body = "";

LINES.forEach(([kind, text], i) => {
  const y = TOP + i * LH;
  if (kind === "cmd") {
    const x0 = 28 + 2 * CW, n = text.length, dur = Math.max(0.35, n * 0.06);
    const vals = Array.from({ length: n + 1 }, (_, k) => (k * CW).toFixed(1)).join(";");
    defs += `<clipPath id="c${i}"><rect x="${x0}" y="${y - 16}" height="22" width="0"><animate attributeName="width" values="${vals}" dur="${dur}s" begin="${t}s" fill="freeze" calcMode="discrete"/></rect></clipPath>`;
    body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${t}s" fill="freeze"/><text x="28" y="${y}" class="p">$</text></g>`;
    body += `<text x="${x0}" y="${y}" class="c" clip-path="url(#c${i})">${esc(text)}</text>`;
    t += dur + 0.35;
  } else {
    body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${t}s" fill="freeze"/><text x="28" y="${y}" class="o">${esc(text)}</text></g>`;
    t += 0.18;
  }
});
const cy = TOP + LINES.length * LH;
body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${t}s" fill="freeze"/><text x="28" y="${cy}" class="p">$</text><rect x="${28 + 2 * CW}" y="${cy - 13}" width="9" height="16" fill="#c0caf5"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal intro: whoami, stack, focus">
<style>
  text{font-family:'Fira Code','JetBrains Mono',Consolas,'Courier New',monospace;font-size:${FS}px;white-space:pre}
  .p{fill:#9ece6a;font-weight:700} .c{fill:#c0caf5} .o{fill:#7aa2f7} .ttl{fill:#565f89;font-size:12px}
</style>
<defs>${defs}</defs>
<rect width="${W}" height="${H}" rx="12" fill="#1a1b27" stroke="#2f334d"/>
<rect width="${W}" height="34" rx="12" fill="#24283b"/><rect y="22" width="${W}" height="12" fill="#24283b"/>
<circle cx="22" cy="17" r="6" fill="#f7768e"/><circle cx="42" cy="17" r="6" fill="#e0af68"/><circle cx="62" cy="17" r="6" fill="#9ece6a"/>
<text x="${W / 2}" y="21" text-anchor="middle" class="ttl">hrach@github: ~</text>
${body}
</svg>
`;
writeFileSync("assets/terminal.svg", svg);
console.log("assets/terminal.svg written, animation length " + t.toFixed(1) + "s");
