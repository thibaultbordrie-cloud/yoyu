// Local storage of everything the person writes. IndexedDB in the browser, never a server.
// A memory implementation with the same interface is used by the tests.

export interface CheckIn {
  date: string; // YYYY-MM-DD, local day
  energy: number; // 0 to 10
  sensory: number;
  social: number;
  anxiety: number;
  drains: string[];
  rechargers: string[];
  note: string;
  updatedAt: string;
}

export interface Worry {
  id: string;
  text: string;
  createdAt: string;
  status: "waiting" | "actionable" | "letgo";
  step?: string;
  reviewedAt?: string;
  outcome?: "happened" | "partly" | "not";
  outcomeAt?: string;
}

export interface Card {
  id: string;
  template?: string;
  title: string;
  when?: string; // YYYY-MM-DD or YYYY-MM-DDTHH:MM
  steps: string[];
  phrases: string[];
  bring: string[];
  planB: string[];
  recovery: string;
  checked: number[]; // indices of "bring" items ticked
  createdAt: string;
  updatedAt: string;
}

export interface Tables {
  checkins: CheckIn;
  worries: Worry;
  cards: Card;
}
export type TableName = keyof Tables;
export const TABLES: { name: TableName; key: string }[] = [
  { name: "checkins", key: "date" },
  { name: "worries", key: "id" },
  { name: "cards", key: "id" },
];

export interface Store {
  all<T extends TableName>(table: T): Promise<Tables[T][]>;
  put<T extends TableName>(table: T, value: Tables[T]): Promise<void>;
  remove(table: TableName, key: string): Promise<void>;
  clear(): Promise<void>;
}

export function newId(): string {
  return crypto.randomUUID();
}

/** A store that lives in memory only (tests, or a browser where IndexedDB is unavailable). */
export class MemoryStore implements Store {
  private data = new Map<TableName, Map<string, unknown>>(TABLES.map((t) => [t.name, new Map()]));

  async all<T extends TableName>(table: T): Promise<Tables[T][]> {
    return [...this.data.get(table)!.values()].map((v) => structuredClone(v)) as Tables[T][];
  }
  async put<T extends TableName>(table: T, value: Tables[T]): Promise<void> {
    const key = TABLES.find((t) => t.name === table)!.key;
    this.data.get(table)!.set(String((value as unknown as Record<string, unknown>)[key]), structuredClone(value));
  }
  async remove(table: TableName, key: string): Promise<void> {
    this.data.get(table)!.delete(key);
  }
  async clear(): Promise<void> {
    for (const m of this.data.values()) m.clear();
  }
}

const DB_NAME = "yoyu";
const DB_VERSION = 1;

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export class IdbStore implements Store {
  private readonly db: IDBDatabase;
  private constructor(db: IDBDatabase) {
    this.db = db;
  }

  static async open(): Promise<IdbStore> {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      for (const t of TABLES) if (!req.result.objectStoreNames.contains(t.name)) req.result.createObjectStore(t.name, { keyPath: t.key });
    };
    const db = await request(req);
    // Ask the browser not to evict the notes when space runs low (it may still say no).
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* not supported: the data still works, with the browser's usual eviction rules */
    }
    return new IdbStore(db);
  }

  async all<T extends TableName>(table: T): Promise<Tables[T][]> {
    return request(this.db.transaction(table).objectStore(table).getAll()) as Promise<Tables[T][]>;
  }
  async put<T extends TableName>(table: T, value: Tables[T]): Promise<void> {
    const tx = this.db.transaction(table, "readwrite");
    tx.objectStore(table).put(value);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async remove(table: TableName, key: string): Promise<void> {
    await request(this.db.transaction(table, "readwrite").objectStore(table).delete(key));
  }
  async clear(): Promise<void> {
    const names = TABLES.map((t) => t.name);
    const tx = this.db.transaction(names, "readwrite");
    for (const n of names) tx.objectStore(n).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

/** Opens IndexedDB, or falls back to memory (private windows of some browsers). */
export async function openStore(): Promise<{ store: Store; persistent: boolean }> {
  try {
    return { store: await IdbStore.open(), persistent: true };
  } catch {
    return { store: new MemoryStore(), persistent: false };
  }
}
