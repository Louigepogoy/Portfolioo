// Runs before `npm run dev`: if an old copy of this API is still holding the port, stop it.
// Only processes that answer like this API's /api/health are stopped — never other apps.
import { execSync } from "node:child_process";

const PORT = Number(process.env.PORT) || 4000;

async function isOurApi() {
  try {
    const res = await fetch(`http://localhost:${PORT}/api/health`, { signal: AbortSignal.timeout(1500) });
    const data = await res.json();
    return data.status === "ok" && "uptime" in data;
  } catch {
    return false;
  }
}

function pidsOnPort() {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano -p tcp`, { encoding: "utf8" });
      return [
        ...new Set(
          out
            .split("\n")
            .filter((l) => l.includes("LISTENING") && new RegExp(`:${PORT}\\s`).test(l))
            .map((l) => l.trim().split(/\s+/).pop())
        ),
      ];
    }
    return execSync(`lsof -ti tcp:${PORT} -sTCP:LISTEN`, { encoding: "utf8" }).split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

if (await isOurApi()) {
  for (const pid of pidsOnPort()) {
    if (Number(pid) === process.pid) continue;
    try {
      process.kill(Number(pid));
      console.log(`Stopped old portfolio API (PID ${pid}) that was using port ${PORT}.`);
    } catch {}
  }
  await new Promise((r) => setTimeout(r, 500));
}
