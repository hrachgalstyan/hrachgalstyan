// Tic-Tac-Toe played through GitHub Issues.
//   ISSUE_TITLE="ttt|move|5" ISSUE_USER=octocat node scripts/ttt.mjs
//   node scripts/ttt.mjs --render      (re-render README only)
// Writes the reply for the issue comment to game/last-message.md
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const REPO = "hrachgalstyan/hrachgalstyan";
const STATE = "game/state.json";
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const fresh = () => ({ board: Array(9).fill(""), status: "playing", moves: [], players: [] });
let state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { game: fresh(), stats: { humans: 0, bot: 0, draws: 0, gamesPlayed: 0 }, recent: [] };

const winner = (b) => { for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? "draw" : null; };

function minimax(b, player) {
  const w = winner(b);
  if (w === "O") return { score: 1 }; if (w === "X") return { score: -1 }; if (w === "draw") return { score: 0 };
  let best = { score: player === "O" ? -2 : 2 };
  b.forEach((v, i) => {
    if (v) return;
    b[i] = player; const r = minimax(b, player === "O" ? "X" : "O"); b[i] = "";
    if (player === "O" ? r.score > best.score : r.score < best.score) best = { score: r.score, move: i };
  });
  return best;
}
// Strong but beatable: plays perfectly 80% of the time, randomly otherwise.
function botMove(b) {
  const empty = b.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (Math.random() < 0.2) return empty[Math.floor(Math.random() * empty.length)];
  return minimax([...b], "O").move;
}

let message = "";
const finish = (result) => {
  const g = state.game; g.status = result; state.stats.gamesPlayed++;
  if (result === "X") state.stats.humans++; else if (result === "O") state.stats.bot++; else state.stats.draws++;
};

if (!process.argv.includes("--render")) {
  const title = (process.env.ISSUE_TITLE || "").trim();
  const user = (process.env.ISSUE_USER || "someone").replace(/[^A-Za-z0-9-]/g, "");
  const m = title.match(/^ttt\|(move\|([1-9])|new)$/);
  if (!m) {
    message = "🤔 I couldn't read that move. Use the board links in the README to play.";
  } else {
    if (m[1] === "new" || state.game.status !== "playing") state.game = fresh();
    const g = state.game;
    if (m[1] === "new") {
      message = `🆕 New game started by @${user}. You're ❌, make the first move in the README!`;
    } else {
      const cell = Number(m[2]) - 1;
      if (g.board[cell]) {
        message = `⛔ Square ${cell + 1} is already taken. Pick another one in the README.`;
      } else {
        g.board[cell] = "X"; g.moves.push({ user, cell: cell + 1, mark: "X" });
        if (!g.players.includes(user)) g.players.push(user);
        let w = winner(g.board);
        if (!w) {
          const b = botMove(g.board); g.board[b] = "O"; g.moves.push({ user: "bot", cell: b + 1, mark: "O" });
          w = winner(g.board);
          message = `✅ @${user} played **${cell + 1}**, I answered with **${b + 1}**.`;
        } else message = `✅ @${user} played **${cell + 1}**.`;
        if (w) {
          finish(w);
          message += w === "X" ? "\n\n🏆 **You beat the bot!** Legendary. A new game starts with the next move."
                   : w === "O" ? "\n\n🤖 **The bot wins this one.** Revenge? Start a new game in the README."
                   : "\n\n🤝 **It's a draw!** A new game starts with the next move.";
        }
        state.recent.unshift({ user, cell: cell + 1, at: new Date().toISOString().slice(0, 10) });
        state.recent = state.recent.slice(0, 5);
      }
    }
  }
  message += `\n\n👉 [Back to the board](https://github.com/${REPO}#-play-tic-tac-toe-with-me)`;
  writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");
  writeFileSync("game/last-message.md", message + "\n");
}

// ---------- render ----------
const g = state.game;
const issue = (title) => `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent("Just click **Create** below 👇. Your move is played automatically in about 30 seconds, then refresh the profile.")}`;
const cellHtml = (i) => {
  const v = g.board[i];
  if (v === "X") return `<img src="assets/ttt/x.svg" width="72" alt="X"/>`;
  if (v === "O") return `<img src="assets/ttt/o.svg" width="72" alt="O"/>`;
  if (g.status !== "playing") return `<img src="assets/ttt/empty.svg" width="72" alt=" "/>`;
  return `<a href="${issue(`ttt|move|${i + 1}`)}"><img src="assets/ttt/empty.svg" width="72" alt="Play ${i + 1}"/></a>`;
};
const rows = [0, 1, 2].map((r) => `    <tr>${[0, 1, 2].map((c) => `<td>${cellHtml(r * 3 + c)}</td>`).join("")}</tr>`).join("\n");
const statusLine = g.status === "playing"
  ? (g.moves.length ? `**Game in progress**: it's ❌'s turn. Click an empty square!` : `**New board**: you're ❌, click any square to start!`)
  : g.status === "X" ? `🏆 **A human won the last game!** Click [new game](${issue("ttt|new")}) to play again.`
  : g.status === "O" ? `🤖 **The bot won the last game.** Click [new game](${issue("ttt|new")}) for a rematch.`
  : `🤝 **The last game was a draw.** Click [new game](${issue("ttt|new")}) to play again.`;
const s = state.stats;
const recent = state.recent.length ? state.recent.map((r) => `[@${r.user}](https://github.com/${r.user}) → ${r.cell}`).join(" · ") : "_no moves yet, be the first!_";

const block = `<!--TTT_START-->
<div align="center">

${statusLine}

<table align="center">
${rows}
</table>

🧑 Humans **${s.humans}** &nbsp;·&nbsp; 🤖 Bot **${s.bot}** &nbsp;·&nbsp; 🤝 Draws **${s.draws}** &nbsp;·&nbsp; 🎮 Games **${s.gamesPlayed}**

<sub>Recent moves: ${recent} &nbsp;|&nbsp; <a href="${issue("ttt|new")}">🔄 Reset board</a></sub>

</div>
<!--TTT_END-->`;

const readme = readFileSync("README.md", "utf8");
writeFileSync("README.md", readme.replace(/<!--TTT_START-->[\s\S]*?<!--TTT_END-->/, block));
console.log(message || "rendered");
