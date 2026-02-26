import { Redis } from "ioredis";

export interface RedisClientOptions {
  url: string;
}

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<number>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export function createRedisClient(options: RedisClientOptions): RedisClient {
  const { url } = options;
  let client: Redis | null = null;

  return {
    async connect() {
      if (client) return;
      client = new Redis(url);
    },

    async get(key: string): Promise<string | null> {
      if (!client) await this.connect();
      return client!.get(key);
    },

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
      if (!client) await this.connect();
      if (ttlSeconds) {
        await client!.setex(key, ttlSeconds, value);
      } else {
        await client!.set(key, value);
      }
    },

    async del(key: string): Promise<number> {
      if (!client) await this.connect();
      return client!.del(key);
    },

    async disconnect(): Promise<void> {
      if (client) {
        client.disconnect();
        client = null;
      }
    },
  };
}
