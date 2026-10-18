const STORAGE_KEY = 'accessToken';

type Listener = () => void;
const listeners = new Set<Listener>();

// localStorage бросает в приватных режимах и при заблокированном storage — тогда сессии просто нет.
function read(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(token: string | null) {
  try {
    if (token === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore: см. read()
  }
  listeners.forEach((listener) => listener());
}

/** Хранилище accessToken. Живёт в shared, потому что apiFetch подставляет его в каждый запрос. */
export const tokenStorage = {
  get: read,
  set: (token: string) => write(token),
  clear: () => write(null),
  /** Подписка для useSyncExternalStore; ловит и изменения из других вкладок. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
};
