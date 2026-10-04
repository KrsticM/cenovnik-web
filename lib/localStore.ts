
export interface LocalStore<T> {
  read(key: string): T;
  write(key: string, value: T | null): void;
  subscribe(onChange: () => void): () => void;
}

interface LocalStoreOptions<T> {
  parse: (value: unknown) => T | null;
  empty: T;
}

export function createLocalStore<T>({ parse, empty }: LocalStoreOptions<T>): LocalStore<T> {
  const memory = new Map<string, string>();
  const cache = new Map<string, { raw: string | null; value: T }>();
  const listeners = new Set<() => void>();

  function readRaw(key: string): string | null {
    if (memory.has(key)) return memory.get(key)!;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function read(key: string): T {
    const raw = readRaw(key);
    const hit = cache.get(key);
    if (hit && hit.raw === raw) return hit.value;

    let value = empty;
    try {
      value = (raw ? parse(JSON.parse(raw)) : null) ?? empty;
    } catch {
    }
    cache.set(key, { raw, value });
    return value;
  }

  function write(key: string, value: T | null) {
    const raw = value === null ? null : JSON.stringify(value);
    try {
      if (raw) window.localStorage.setItem(key, raw);
      else window.localStorage.removeItem(key);
      memory.delete(key);
    } catch {
      if (raw) memory.set(key, raw);
      else memory.delete(key);
    }
    listeners.forEach((notify) => notify());
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    window.addEventListener("storage", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  }

  return { read, write, subscribe };
}
