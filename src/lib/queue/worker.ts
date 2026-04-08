import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "./index";
import { baileysManager } from "@/lib/whatsapp/baileys";
import { getDb, messageLogs, campaigns, dailyUsage, eq, sql } from "@/lib/db";
import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  name: "blast-worker",
});

// Free plan daily limit
const FREE_DAILY_LIMIT = 50;

/**
 * Render message template by replacing variables
 * Supports: {{name}}, {{phone}}, and custom JSON variables
 */
function renderTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value || "");
  }
  // Clean up any remaining {{...}} patterns
  result = result.replace(/\{\{[^}]*\}\}/g, "");
  return result;
}

async function processBlastJob(job: Job): Promise<void> {
  const {
    sessionName,
    contactId,
    phone,
    name,
    variables,
    messageTemplate,
    campaignId,
    userId,
    delayMs,
  } = job.data;

  const db = getDb();
  const logId = `log_${contactId}_${Date.now()}`;

  logger.info(
    { jobId: job.id, campaignId, phone, sessionName },
    "Processing blast job"
  );

  try {
    // Check daily limit for free users
    const today = new Date().toISOString().split("T")[0];
    const usageResult = await db
      .select({ sentCount: dailyUsage.sentCount })
      .from(dailyUsage)
      .where(eq(dailyUsage.userId, userId))
      .limit(1);

    if (usageResult.length > 0 && usageResult[0].sentCount >= FREE_DAILY_LIMIT) {
      logger.warn(
        { userId, sentCount: usageResult[0].sentCount },
        "Daily limit reached, skipping"
      );
      await db
        .insert(messageLogs)
        .values({
          id: logId,
          campaignId,
          contactPhone: phone,
          status: "failed",
          error: "Daily limit reached",
          sentAt: new Date(),
        });
      return;
    }

    // Check if session is connected
    if (!baileysManager.isConnected(sessionName)) {
      throw new Error(`WhatsApp session ${sessionName} is not connected`);
    }

    // Render message template
    const allVars = {
      name: name || "",
      phone: phone || "",
      ...(variables || {}),
    } as Record<string, string>;

    const message = renderTemplate(messageTemplate, allVars);

    // Add small delay between messages
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // Send message via Baileys
    const success = await baileysManager.sendMessage(sessionName, phone, message);

    if (success) {
      // Update message log
      await db
        .insert(messageLogs)
        .values({
          id: logId,
          campaignId,
          contactPhone: phone,
          status: "sent",
          sentAt: new Date(),
        });

      // Update campaign sent count
      await db
        .update(campaigns)
        .set({
          sentCount: sql`${campaigns.sentCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId));

      // Update daily usage
      await db
        .insert(dailyUsage)
        .values({
          id: `usage_${userId}_${today}`,
          userId,
          date: today,
          sentCount: 1,
        })
        .onConflictDoUpdate({
          target: [dailyUsage.userId, dailyUsage.date],
          set: {
            sentCount: sql`${dailyUsage.sentCount} + 1`,
          },
        });

      logger.info(
        { jobId: job.id, campaignId, phone },
        "Message sent successfully"
      );
    } else {
      throw new Error("Baileys sendMessage returned false");
    }
  } catch (error: any) {
    logger.error(
      { jobId: job.id, campaignId, phone, error: error.message },
      "Failed to send message"
    );

    // Update message log as failed
    await db
      .insert(messageLogs)
      .values({
        id: logId,
        campaignId,
        contactPhone: phone,
        status: "failed",
        error: error.message?.substring(0, 500),
        sentAt: new Date(),
      });

    // Update campaign failed count
    await db
      .update(campaigns)
      .set({
        failedCount: sql`${campaigns.failedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));
  }
}

// ==================== WORKER INSTANCE ====================

let worker: Worker | null = null;

export function startWorker(): Worker | null {
  if (worker) {
    logger.info("Worker already running");
    return worker;
  }

  logger.info("Starting Blast Worker...");

  worker = new Worker(
    "blast",
    processBlastJob,
    {
      connection: getRedisConnection(),
      concurrency: 1, // One message at a time to avoid spam
      removeOnComplete: {
        age: 3600,
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job?.id }, "Job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Job failed");
  });

  worker.on("error", (err) => {
    logger.error({ error: err.message }, "Worker error");
  });

  worker.on("ready", () => {
    logger.info("Blast Worker ready and listening");
  });

  return worker;
}

export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info("Worker stopped");
  }
}

export { worker };
