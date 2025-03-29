// deno-lint-ignore-file require-await
import type { Redis } from 'https://esm.sh/@upstash/redis@1.25.1';

export default class RedisMock implements Pick<Redis, 'exists' | 'hset'> {
  private store: Record<
    string,
    {
      [field: string]: unknown;
    }
  > = {};

  async exists(key: string) {
    return this.store[key] ? 1 : 0;
  }

  async hset(
    key: string,
    kv: {
      [field: string]: unknown;
    },
  ) {
    this.store[key] = this.store[key] || {};

    const newFields = Object.entries(kv).filter(([field]) => !(field in this.store[key]));

    newFields.forEach(([field, value]) => {
      this.store[key][field] = value;
    });

    return newFields.length;
  }
}
