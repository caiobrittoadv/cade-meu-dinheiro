import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import Redis from "ioredis";

export type ServiceStatus = "up" | "down";

export interface HealthReport {
  status: "ok" | "degraded";
  checks: {
    api: ServiceStatus;
    postgres: ServiceStatus;
    redis: ServiceStatus;
    storage: ServiceStatus;
  };
}

const CHECK_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  constructor(private readonly config: ConfigService) {}

  async check(): Promise<HealthReport> {
    const [postgres, redis, storage] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkStorage(),
    ]);

    const allUp = postgres === "up" && redis === "up" && storage === "up";

    return {
      status: allUp ? "ok" : "degraded",
      checks: { api: "up", postgres, redis, storage },
    };
  }

  private async checkPostgres(): Promise<ServiceStatus> {
    const connectionString = this.config.get<string>("DATABASE_URL");
    if (!connectionString) return "down";

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: CHECK_TIMEOUT_MS,
      max: 1,
    });

    try {
      await pool.query("SELECT 1");
      return "up";
    } catch {
      return "down";
    } finally {
      await pool.end().catch(() => undefined);
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    const url = this.config.get<string>("REDIS_URL");
    if (!url) return "down";

    const client = new Redis(url, {
      lazyConnect: true,
      connectTimeout: CHECK_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
    });

    try {
      await client.connect();
      const pong = await client.ping();
      return pong === "PONG" ? "up" : "down";
    } catch {
      return "down";
    } finally {
      client.disconnect();
    }
  }

  private async checkStorage(): Promise<ServiceStatus> {
    const endpoint = this.config.get<string>("STORAGE_ENDPOINT");
    if (!endpoint) return "down";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
      const response = await fetch(`${endpoint}/minio/health/live`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok ? "up" : "down";
    } catch {
      return "down";
    }
  }
}
