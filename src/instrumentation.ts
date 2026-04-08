// This file is called when the Next.js server starts
// Used to initialize background services like the BullMQ worker

import { startWorker, stopWorker } from "./lib/queue/worker";
import { baileysManager } from "./lib/whatsapp/baileys";

// Track if we've already registered (prevents double-registration in dev)
let isRegistered = false;

export function register() {
  // Only run in Node.js runtime (not edge)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (isRegistered) return;
  isRegistered = true;

  console.log("[Instrumentation] Starting background services...");

  // Start the BullMQ worker
  startWorker();

  // Reconnect existing WhatsApp sessions on restart
  reconnectExistingSessions();
}

async function reconnectExistingSessions() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const SESSION_DIR = path.join(
      process.cwd(),
      process.env.WA_SESSION_DIR || "./wa_sessions"
    );

    if (!fs.existsSync(SESSION_DIR)) return;

    const sessions = fs.readdirSync(SESSION_DIR);
    for (const sessionName of sessions) {
      if (sessionName.startsWith(".") || !sessionName) continue;
      console.log(`[Instrumentation] Reconnecting session: ${sessionName}`);
      await baileysManager.createSession(sessionName);
    }

    console.log(
      `[Instrumentation] Reconnected ${sessions.length} WhatsApp sessions`
    );
  } catch (error) {
    console.error("[Instrumentation] Failed to reconnect sessions:", error);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Instrumentation] Shutting down background services...");
  await stopWorker();
  await baileysManager.shutdown();
  process.exit(0);
});
