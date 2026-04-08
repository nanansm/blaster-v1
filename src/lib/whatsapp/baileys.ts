import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  type WASocket,
  type ConnectionState,
  type BaileysEventMap,
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import { EventEmitter } from "events";

// Session directory
const SESSION_DIR = path.join(
  process.cwd(),
  process.env.WA_SESSION_DIR || "./wa_sessions"
);

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// ==================== TYPES ====================

interface SessionData {
  socket: WASocket;
  qr: string | null;
  status: "disconnected" | "qr_code" | "connected";
  phoneNumber: string | null;
  lastSeen: number;
}

type SessionEvent = "qr_updated" | "status_changed" | "message_sent" | "message_failed";

interface SessionEvents {
  on(event: SessionEvent, listener: (...args: any[]) => void): this;
  emit(event: SessionEvent, ...args: any[]): boolean;
}

// ==================== SINGLETON MANAGER ====================

class BaileysManager extends EventEmitter {
  private static instance: BaileysManager | null = null;
  private sessions: Map<string, SessionData> = new Map();
  private logger: ReturnType<typeof pino>;
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  private constructor() {
    super();
    this.logger = pino({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    });
  }

  static getInstance(): BaileysManager {
    if (!BaileysManager.instance) {
      BaileysManager.instance = new BaileysManager();
    }
    return BaileysManager.instance;
  }

  // ==================== SESSION MANAGEMENT ====================

  async createSession(sessionName: string): Promise<{ status: string; qr?: string }> {
    // Check if session already exists
    if (this.sessions.has(sessionName)) {
      const existing = this.sessions.get(sessionName)!;
      return {
        status: existing.status,
        qr: existing.qr || undefined,
      };
    }

    this.logger.info({ sessionName }, "Creating new WhatsApp session");

    const sessionPath = path.join(SESSION_DIR, sessionName);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      logger: this.logger.child({ module: "baileys" }),
      auth: state,
      printQRInTerminal: false,
      // Optimize for low memory
      syncFullHistory: false,
      markOnlineOnConnect: false,
    });

    const sessionData: SessionData = {
      socket,
      qr: null,
      status: "disconnected",
      phoneNumber: null,
      lastSeen: Date.now(),
    };

    this.sessions.set(sessionName, sessionData);
    this.reconnectAttempts.set(sessionName, 0);

    // Event handlers
    socket.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
      await this.handleConnectionUpdate(sessionName, update as ConnectionState);
    });

    socket.ev.on("creds.update", saveCreds);

    socket.ev.on("messages.upsert", (m: BaileysEventMap["messages.upsert"]) => {
      this.logger.debug({ sessionName, messageCount: m.messages.length }, "Messages received");
    });

    return { status: sessionData.status };
  }

  private async handleConnectionUpdate(
    sessionName: string,
    update: ConnectionState
  ): Promise<void> {
    const session = this.sessions.get(sessionName);
    if (!session) return;

    const { connection, lastDisconnect, qr } = update;

    session.lastSeen = Date.now();

    if (qr) {
      session.qr = qr;
      session.status = "qr_code";
      this.emit("qr_updated", sessionName, qr);
      this.emit("status_changed", sessionName, "qr_code");
      this.logger.info({ sessionName }, "QR code generated");
    }

    if (connection === "open") {
      session.status = "connected";
      session.qr = null;
      this.reconnectAttempts.set(sessionName, 0);

      // Get phone number from connection
      try {
        const phoneNumber = session.socket.user?.id?.split(":")[0] || null;
        session.phoneNumber = phoneNumber;
      } catch {
        // Ignore if can't get phone number
      }

      this.emit("status_changed", sessionName, "connected");
      this.logger.info({ sessionName, phoneNumber: session.phoneNumber }, "Session connected");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error as Error | undefined;
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;

      this.logger.warn(
        { sessionName, reason: reason?.message, statusCode },
        "Connection closed"
      );

      // Check if we should reconnect
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        const attempts = this.reconnectAttempts.get(sessionName) || 0;
        if (attempts < this.maxReconnectAttempts) {
          this.reconnectAttempts.set(sessionName, attempts + 1);
          const delayMs = Math.min(1000 * Math.pow(2, attempts), 30000);
          this.logger.info(
            { sessionName, attempt: attempts + 1, delayMs },
            "Scheduling reconnect"
          );
          setTimeout(() => this.recreateSocket(sessionName), delayMs);
        } else {
          session.status = "disconnected";
          this.emit("status_changed", sessionName, "disconnected");
          this.logger.error(
            { sessionName },
            "Max reconnect attempts reached"
          );
        }
      } else {
        // Logged out - clean up
        session.status = "disconnected";
        this.sessions.delete(sessionName);
        this.emit("status_changed", sessionName, "disconnected");
        this.logger.warn({ sessionName }, "Session logged out, removed");
      }
    }
  }

  private async recreateSocket(sessionName: string): Promise<void> {
    try {
      // Remove old session but keep auth state
      this.sessions.delete(sessionName);
      await this.createSession(sessionName);
    } catch (error) {
      this.logger.error({ sessionName, error }, "Failed to recreate socket");
    }
  }

  // ==================== MESSAGE OPERATIONS ====================

  async sendMessage(
    sessionName: string,
    phone: string,
    text: string
  ): Promise<boolean> {
    const session = this.sessions.get(sessionName);
    if (!session || session.status !== "connected") {
      throw new Error(
        `Session ${sessionName} is not connected (status: ${session?.status || "not found"})`
      );
    }

    try {
      // Format phone number with @s.us
      const jid = phone.includes("@") ? phone : `${phone}@s.whatsapp.net`;

      await session.socket.sendMessage(jid, {
        text,
      });

      this.emit("message_sent", sessionName, phone);
      this.logger.info({ sessionName, phone }, "Message sent successfully");
      return true;
    } catch (error: any) {
      this.logger.error(
        { sessionName, phone, error: error.message },
        "Failed to send message"
      );
      this.emit("message_failed", sessionName, phone, error);
      return false;
    }
  }

  // ==================== SESSION QUERIES ====================

  getSessionStatus(sessionName: string): {
    status: string;
    qr: string | null;
    phoneNumber: string | null;
  } {
    const session = this.sessions.get(sessionName);
    if (!session) {
      return { status: "not_found", qr: null, phoneNumber: null };
    }
    return {
      status: session.status,
      qr: session.qr,
      phoneNumber: session.phoneNumber,
    };
  }

  getAllSessions(): Array<{
    sessionName: string;
    status: string;
    phoneNumber: string | null;
  }> {
    const result: Array<{
      sessionName: string;
      status: string;
      phoneNumber: string | null;
    }> = [];

    for (const [name, data] of this.sessions.entries()) {
      result.push({
        sessionName: name,
        status: data.status,
        phoneNumber: data.phoneNumber,
      });
    }

    return result;
  }

  isConnected(sessionName: string): boolean {
    const session = this.sessions.get(sessionName);
    return session?.status === "connected";
  }

  // ==================== CLEANUP ====================

  async logoutSession(sessionName: string): Promise<void> {
    const session = this.sessions.get(sessionName);
    if (!session) return;

    try {
      // Try to logout gracefully
      await session.socket.logout();
    } catch {
      // Ignore logout errors
    }

    session.socket.end(undefined);
    this.sessions.delete(sessionName);
    this.reconnectAttempts.delete(sessionName);

    // Remove auth files
    const sessionPath = path.join(SESSION_DIR, sessionName);
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    } catch {
      // Ignore file removal errors
    }

    this.emit("status_changed", sessionName, "disconnected");
    this.logger.info({ sessionName }, "Session logged out and cleaned up");
  }

  async disconnectSession(sessionName: string): Promise<void> {
    const session = this.sessions.get(sessionName);
    if (!session) return;

    session.socket.end(undefined);
    this.sessions.delete(sessionName);
    this.reconnectAttempts.delete(sessionName);

    this.logger.info({ sessionName }, "Session disconnected");
  }

  // Graceful shutdown for all sessions
  async shutdown(): Promise<void> {
    this.logger.info("Shutting down all WhatsApp sessions");
    const sessionNames = Array.from(this.sessions.keys());
    await Promise.allSettled(
      sessionNames.map((name) => this.disconnectSession(name))
    );
    this.sessions.clear();
    this.reconnectAttempts.clear();
  }
}

// Singleton export
export const baileysManager = BaileysManager.getInstance();

// Export types for use in other modules
export type { SessionData, SessionEvent };
