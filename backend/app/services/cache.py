"""
Simple in-memory cache with TTL support for TAF library and other expensive operations
"""

import asyncio
import time
import logging
from typing import Any, Optional, Dict, Callable, TypeVar
from functools import wraps

logger = logging.getLogger(__name__)

T = TypeVar('T')


class SimpleCache:
    """Thread-safe in-memory cache with TTL support"""

    def __init__(self, default_ttl: int = 300):
        """
        Initialize cache

        Args:
            default_ttl: Default time-to-live in seconds (default: 5 minutes)
        """
        self._cache: Dict[str, tuple[Any, float]] = {}
        self._default_ttl = default_ttl
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache if not expired

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        async with self._lock:
            if key not in self._cache:
                return None

            value, expiry = self._cache[key]
            if time.time() > expiry:
                # Expired, remove from cache
                del self._cache[key]
                return None

            return value

    async def set(self, key: str, value: Any, ttl: int = None) -> None:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (default: use default_ttl)
        """
        async with self._lock:
            expiry = time.time() + (ttl or self._default_ttl)
            self._cache[key] = (value, expiry)

    async def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if key was deleted, False if not found
        """
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    async def clear(self) -> None:
        """Clear all cached values"""
        async with self._lock:
            self._cache.clear()

    async def invalidate_prefix(self, prefix: str) -> int:
        """
        Invalidate all keys with given prefix

        Args:
            prefix: Key prefix to match

        Returns:
            Number of keys invalidated
        """
        async with self._lock:
            keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
            for key in keys_to_delete:
                del self._cache[key]
            return len(keys_to_delete)


# Global cache instance for TAF library
taf_cache = SimpleCache(default_ttl=300)  # 5 minute TTL

# Global cache instance for tonies data
tonies_cache = SimpleCache(default_ttl=60)  # 1 minute TTL for tonies (changes more frequently)


async def get_cached_taf_files(scanner, force_refresh: bool = False):
    """
    Get TAF files with caching

    Args:
        scanner: VolumeScanner instance
        force_refresh: Force cache refresh

    Returns:
        List of TAF files
    """
    cache_key = f"taf_files:{scanner.data_path}"

    if not force_refresh:
        cached = await taf_cache.get(cache_key)
        if cached is not None:
            logger.debug(f"TAF files cache hit ({len(cached)} files)")
            return cached

    # Cache miss - scan files
    logger.info("TAF files cache miss, scanning...")
    taf_files = scanner.scan_taf_files_recursive()
    await taf_cache.set(cache_key, taf_files)
    logger.info(f"Cached {len(taf_files)} TAF files")

    return taf_files


async def invalidate_taf_cache():
    """Invalidate all TAF file caches"""
    count = await taf_cache.invalidate_prefix("taf_files:")
    logger.info(f"Invalidated {count} TAF cache entries")


async def get_cached_tonies(client, cache_key: str, fetch_func: Callable):
    """
    Get tonies with caching

    Args:
        client: TeddyCloudClient instance
        cache_key: Cache key
        fetch_func: Async function to fetch data

    Returns:
        Tonies data
    """
    cached = await tonies_cache.get(cache_key)
    if cached is not None:
        logger.debug(f"Tonies cache hit for {cache_key}")
        return cached

    # Cache miss - fetch data
    data = await fetch_func()
    await tonies_cache.set(cache_key, data)
    return data
