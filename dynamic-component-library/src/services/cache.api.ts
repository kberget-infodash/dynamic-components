/* eslint-disable @typescript-eslint/no-explicit-any */
import * as moment from "moment";
import { ICacheItem } from "../interfaces";
/**
 * Interface for cache configuration
 */
interface ICacheConfig {
  expiration: number;
  prefix: string;
  storage?: Storage;
}

/**
 * Enhanced cache service with better type safety, error handling, and performance
 */
export class CacheService {
  private readonly defaultExpiration: number = 240;
  private readonly defaultPrefix: string = "infodash_";
  private expiration: number;
  private readonly prefix: string;
  private readonly storage: Storage;
  private readonly isStorageEnabled: boolean;

  constructor(config?: number | Partial<ICacheConfig>) {
    if (typeof config === "number") {
      this.expiration = Math.max(1, config);
      this.prefix = this.defaultPrefix;
      this.storage = localStorage;
    } else {
      this.expiration = Math.max(
        1,
        config?.expiration ?? this.defaultExpiration
      );
      this.prefix = config?.prefix ?? this.defaultPrefix;
      this.storage = config?.storage ?? localStorage;
    }

    // Check storage availability once during initialization
    this.isStorageEnabled = this.checkStorageAvailability();

    // Run cleanup on initialization
    this.cleanupExpiredKeys();
  }

  private cleanupExpiredKeys(): void {
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.indexOf(this.prefix) === 0) {
          const cachedItem = this.getRawItem(key);
          if (cachedItem?.expires) {
            const expiresAt = Number(cachedItem.expires); // Ensure it's a number
            if (!isNaN(expiresAt) && expiresAt < Date.now()) {
              this.storage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  private getRawItem(key: string): ICacheItem | null {
    const item = this.storage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as ICacheItem;
    } catch (error) {
      console.error("Failed to parse cache item:", error);
      return null;
    }
  }

  /**
   * Sets cache expiration time in minutes
   * @throws {Error} If minutes is less than 1
   */
  public setCacheTime(minutes: number): void {
    if (minutes < 1) {
      throw new Error("Cache expiration must be at least 1 minute");
    }
    this.expiration = minutes;
  }

  /**
   * Resets cache time to constructor-defined expiration
   */
  public resetCacheTime(): void {
    this.expiration = this.defaultExpiration;
  }

  /**
   * Stores an item in cache with expiration
   * @throws {Error} If storage is not available
   */
  public setCacheItem<T>(name: string, data: T): T {
    if (!this.isStorageEnabled) {
      throw new Error("Local storage is not available");
    }

    try {
      const cacheObject: ICacheItem = {
        data: this.serializeData(data),
        expires: moment().add(this.expiration, "minutes").toISOString(),
      };

      this.storage.setItem(this.generateKey(name), JSON.stringify(cacheObject));

      return data;
    } catch (error) {
      console.error("Failed to set cache item:", error);
      throw new Error("Failed to set cache item");
    }
  }

  /**
   * Retrieves an item from cache
   * @returns The cached item or null if not found/expired
   */
  public getCacheItem<T>(name: string): T | undefined {
    if (!this.isStorageEnabled) {
      return undefined;
    }

    try {
      const key = this.generateKey(name);
      const cacheItem = this.storage.getItem(key);

      if (!cacheItem) {
        return undefined;
      }

      const { data, expires }: ICacheItem = JSON.parse(cacheItem);

      // Some storage entities may not have an expiration date or data object
      if (!data && !expires && cacheItem) {
        return this.deserializeData<T>(cacheItem);
      }

      if (this.isExpired(expires)) {
        this.deleteCacheItem(name);
        return undefined;
      }

      return this.deserializeData<T>(data);
    } catch (error) {
      console.error("Failed to get cache item:", error);
      return undefined;
    }
  }

  /**
   * Deletes an item from cache
   */
  public deleteCacheItem(name: string): void {
    if (this.isStorageEnabled) {
      this.storage.removeItem(this.generateKey(name));
    }
  }

  /**
   * Clears all cache items with the current prefix
   */
  public clearCache(): void {
    if (!this.isStorageEnabled) {
      return;
    }

    try {
      const keys = Object.keys(this.storage);
      keys.forEach((key) => {
        if (key.indexOf(this.prefix) === 0) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  /**
   * Gets the current cache size in bytes
   */
  public getCacheSize(): number {
    if (!this.isStorageEnabled) {
      return 0;
    }

    try {
      return Object.keys(this.storage)
        .filter((key) => key.indexOf(this.prefix) === 0)
        .reduce((size, key) => {
          return size + (this.storage.getItem(key)?.length ?? 0) * 2;
        }, 0);
    } catch (error) {
      console.error("Failed to calculate cache size:", error);
      return 0;
    }
  }

  /**
   * Generic cache wrapper for async operations
   */
  public async withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expiration?: number
  ): Promise<T> {
    const cached = this.getCacheItem<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const originalExpiration = this.expiration;
    if (expiration) {
      this.setCacheTime(expiration);
    }

    try {
      const result = await fetchFn();
      // Do not cache undefined configs
      if (key !== "undefined_configuration") {
        this.setCacheItem(key, result);
      } else {
        this.setCacheItem(
          `${(result as any).ConfigName}_configuration`,
          result
        );
      }

      return result;
    } finally {
      if (expiration) {
        this.expiration = originalExpiration;
      }
    }
  }

  /**
   * Retrieves a cached item if available without a promise; otherwise, executes the provided function, caches its result, and returns it.
   *
   * @template T - The type of the cached item.
   * @param {string} key - The cache key used to store/retrieve the value.
   * @param {() => T} fetchFn - A function that fetches the data if it's not found in the cache.
   * @param {number} [expiration] - Optional expiration time in milliseconds. If provided, it temporarily overrides the default cache expiration time.
   * @returns {T} - The cached value if present, or the result of the fetch function if not.
   */
  public withCacheNp<T>(
    key: string,
    fetchFn: () => T,
    expiration?: number
  ): any {
    // Attempt to retrieve the item from cache
    const cached = this.getCacheItem<T>(key);
    if (!!cached) {
      return cached; // Return the cached item if found
    }

    // Store the original expiration time to restore later if a custom expiration is provided
    const originalExpiration = this.expiration;
    if (expiration) {
      this.setCacheTime(expiration); // Temporarily override the cache expiration
    }

    try {
      // Fetch the new result and store it in the cache
      const result = fetchFn();
      this.setCacheItem(key, result);
      return result;
    } finally {
      // Restore the original expiration time if it was overridden
      if (expiration) {
        this.expiration = originalExpiration;
      }
    }
  }

  /**
   * Checks if an item exists in cache and is not expired
   */
  public hasValidCache(name: string): boolean {
    if (!this.isStorageEnabled) {
      return false;
    }

    try {
      const key = this.generateKey(name);
      const cacheItem = this.storage.getItem(key);

      if (!cacheItem) {
        return false;
      }

      const { expires }: ICacheItem = JSON.parse(cacheItem);
      return !this.isExpired(expires);
    } catch {
      return false;
    }
  }

  // Private helper methods

  private checkStorageAvailability(): boolean {
    try {
      const testKey = `${this.prefix}_test`;
      this.storage.setItem(testKey, testKey);
      this.storage.removeItem(testKey);
      return true;
    } catch {
      console.warn("Local storage is not available. Cache will be disabled.");
      return false;
    }
  }

  private generateKey(name: string): string {
    return `${this.prefix}${name?.toLowerCase()?.replace(/ /g, "")}`;
  }

  private isExpired(expires: string): boolean {
    return new Date(expires) < new Date();
  }

  private serializeData<T>(data: T): string {
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  private deserializeData<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch {
      return data as unknown as T;
    }
  }
}

export default CacheService;
