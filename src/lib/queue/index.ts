import { Queue, type QueueOptions } from "bullmq";
import IORedis from "ioredis";

// ==================== SINGLETON REDIS CONNECTION ====================

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null, // Required for BullMQ
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redisConnection.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    redisConnection.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });

    process.on("SIGTERM", async () => {
      await redisConnection?.quit();
      redisConnection = null;
    });
  }
  return redisConnection;
}

// ==================== SINGLETON QUEUE ====================

let blastQueue: Queue | null = null;

export function getBlastQueue(): Queue {
  if (!blastQueue) {
    blastQueue = new Queue("blast", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep for 1 hour
        },
        removeOnFail: {
          age: 24 * 3600, // Keep failures for 24 hours
        },
      },
    });
  }
  return blastQueue;
}

export { blastQueue };
