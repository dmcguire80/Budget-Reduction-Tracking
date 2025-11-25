/**
 * Local Storage Utilities
 *
 * Type-safe helpers for localStorage operations
 */

/**
 * Get an item from localStorage
 * @param key - The storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns The stored value or default value
 */
export const getItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue !== undefined ? defaultValue : null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue !== undefined ? defaultValue : null;
  }
};

/**
 * Set an item in localStorage
 * @param key - The storage key
 * @param value - The value to store
 * @returns True if successful, false otherwise
 */
export const setItem = <T>(key: string, value: T): boolean => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Remove an item from localStorage
 * @param key - The storage key to remove
 * @returns True if successful, false otherwise
 */
export const removeItem = (key: string): boolean => {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 * @returns True if successful, false otherwise
 */
export const clear = (): boolean => {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Check if a key exists in localStorage
 * @param key - The storage key to check
 * @returns True if the key exists, false otherwise
 */
export const hasItem = (key: string): boolean => {
  return window.localStorage.getItem(key) !== null;
};

/**
 * Get all keys from localStorage
 * @returns Array of all keys
 */
export const getAllKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
};

/**
 * Get the number of items in localStorage
 * @returns Number of items
 */
export const getItemCount = (): number => {
  return window.localStorage.length;
};

/**
 * Storage event listener for cross-tab synchronization
 * @param key - The key to listen for changes
 * @param callback - Callback function to execute on change
 * @returns Cleanup function to remove the listener
 */
export const onStorageChange = (
  key: string,
  callback: (newValue: string | null, oldValue: string | null) => void
): (() => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key) {
      callback(event.newValue, event.oldValue);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Create a namespaced storage instance
 * @param namespace - The namespace prefix
 * @returns Object with namespaced storage methods
 */
export const createNamespacedStorage = (namespace: string) => {
  const getKey = (key: string) => `${namespace}:${key}`;

  return {
    getItem: <T>(key: string, defaultValue?: T) =>
      getItem<T>(getKey(key), defaultValue),
    setItem: <T>(key: string, value: T) => setItem<T>(getKey(key), value),
    removeItem: (key: string) => removeItem(getKey(key)),
    hasItem: (key: string) => hasItem(getKey(key)),
    clear: () => {
      const keys = getAllKeys().filter((k) => k.startsWith(`${namespace}:`));
      keys.forEach((k) => removeItem(k));
    },
  };
};

/**
 * Storage wrapper with expiration support
 */
interface StorageWithExpiry<T> {
  value: T;
  expiry: number;
}

/**
 * Set an item with expiration time
 * @param key - The storage key
 * @param value - The value to store
 * @param ttl - Time to live in milliseconds
 * @returns True if successful, false otherwise
 */
export const setItemWithExpiry = <T>(
  key: string,
  value: T,
  ttl: number
): boolean => {
  const now = new Date().getTime();
  const item: StorageWithExpiry<T> = {
    value,
    expiry: now + ttl,
  };
  return setItem(key, item);
};

/**
 * Get an item with expiration check
 * @param key - The storage key
 * @param defaultValue - Default value if key doesn't exist or is expired
 * @returns The stored value, default value, or null
 */
export const getItemWithExpiry = <T>(
  key: string,
  defaultValue?: T
): T | null => {
  try {
    const itemStr = window.localStorage.getItem(key);
    if (!itemStr) {
      return defaultValue !== undefined ? defaultValue : null;
    }

    const item = JSON.parse(itemStr) as StorageWithExpiry<T>;
    const now = new Date().getTime();

    if (now > item.expiry) {
      removeItem(key);
      return defaultValue !== undefined ? defaultValue : null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue !== undefined ? defaultValue : null;
  }
};
