const DB_NAME = "warna_fit_media_db";
const STORE_NAME = "media_payloads";
const REF_PREFIX = "idb://media/";
const LARGE_STRING_THRESHOLD = 24 * 1024;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });

  return dbPromise;
};

const withStore = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
};

export const isPersistentMediaRef = (value: string | null | undefined): value is string => {
  return typeof value === "string" && value.startsWith(REF_PREFIX);
};

export const shouldPersistOutsideLocalStorage = (value: string | null | undefined): value is string => {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  return value.startsWith("data:") || value.length >= LARGE_STRING_THRESHOLD;
};

export const buildPersistentMediaRef = (entityType: string, entityId: string, fieldName: string): string => {
  return `${REF_PREFIX}${entityType}:${entityId}:${fieldName}`;
};

const refToKey = (ref: string): string => ref.slice(REF_PREFIX.length);

export const writePersistentMedia = async (ref: string, value: string | null): Promise<void> => {
  if (!value) {
    await withStore("readwrite", (store) => store.delete(refToKey(ref)));
    return;
  }

  await withStore("readwrite", (store) => store.put(value, refToKey(ref)));
};

export const readPersistentMedia = async (ref: string | null | undefined): Promise<string | null> => {
  if (!ref || !isPersistentMediaRef(ref)) {
    return ref || null;
  }

  const result = await withStore<string | undefined>("readonly", (store) => store.get(refToKey(ref)));
  return result || null;
};

export const deletePersistentMedia = async (ref: string | null | undefined): Promise<void> => {
  if (!ref || !isPersistentMediaRef(ref)) {
    return;
  }

  await withStore("readwrite", (store) => store.delete(refToKey(ref)));
};

export const sanitizeEntityMedia = async <T extends Record<string, any>>(
  entity: T,
  entityType: string,
  entityId: string,
  mediaFields: string[]
): Promise<T> => {
  const sanitized: Record<string, any> = { ...entity };

  await Promise.all(
    mediaFields.map(async (fieldName) => {
      const rawValue = sanitized[fieldName];

      if (typeof rawValue !== "string" || rawValue.length === 0) {
        return;
      }

      if (isPersistentMediaRef(rawValue)) {
        return;
      }

      if (!shouldPersistOutsideLocalStorage(rawValue)) {
        return;
      }

      const ref = buildPersistentMediaRef(entityType, entityId, fieldName);
      await writePersistentMedia(ref, rawValue);
      sanitized[fieldName] = ref;
    })
  );

  return sanitized as T;
};

export const hydrateEntityMedia = async <T extends Record<string, any>>(
  entity: T,
  mediaFields: string[]
): Promise<T> => {
  const hydrated: Record<string, any> = { ...entity };

  await Promise.all(
    mediaFields.map(async (fieldName) => {
      const rawValue = hydrated[fieldName];
      if (!isPersistentMediaRef(rawValue)) {
        return;
      }

      hydrated[fieldName] = await readPersistentMedia(rawValue);
    })
  );

  return hydrated as T;
};
