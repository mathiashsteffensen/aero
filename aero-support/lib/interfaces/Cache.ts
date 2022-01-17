export interface SetCacheOptions {
  ttl?: number
}

export interface Cache {
  /**
   * Get a key from the cache
   */
  get<TReturns>(key: string): Promise<TReturns | undefined>

  /**
   * Set a key in the cache
   */
  set<TValue>(key: string, value: TValue, options?: SetCacheOptions): Promise<void>

  /**
   * Fetch should get the key from the cache, if the key exists in the cache, return its value,
   * if the key doesn't exist in the cache it should yield to the callback function, and cache and return its value.
   */
  fetch<TReturns>(key: string, callback: () => Promise<TReturns>, options?: SetCacheOptions): Promise<TReturns>

  /**
   * Delete a key from the cache
   */
  delete(key: string): Promise<void>

  /**
   * Flush the cache of all keys
   */
  flush(): Promise<void>
}
