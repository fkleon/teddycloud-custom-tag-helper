import { createContext, useState, useEffect, useCallback } from 'react';
import { tafLibraryAPI } from '../api/client';

export const TAFLibraryContext = createContext();

export function TAFLibraryProvider({ children }) {
  const [tafFiles, setTafFiles] = useState([]);
  const [stats, setStats] = useState({ total: 0, linked: 0, orphaned: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadTafFiles = useCallback(async (force = false) => {
    // Skip if already loaded and not forcing refresh
    if (tafFiles.length > 0 && !force && lastUpdated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await tafLibraryAPI.getAll();

      // Handle API error response
      if (data.success === false && data.error) {
        throw new Error(data.error);
      }

      setTafFiles(data.taf_files || []);
      setStats({
        total: data.total_count || 0,
        linked: data.linked_count || 0,
        orphaned: data.orphaned_count || 0,
      });
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setLoading(false);
    }
  }, [tafFiles.length, lastUpdated]);

  // Load on mount
  useEffect(() => {
    loadTafFiles();
  }, []);

  const refresh = useCallback(() => {
    return loadTafFiles(true);
  }, [loadTafFiles]);

  return (
    <TAFLibraryContext.Provider value={{
      tafFiles,
      stats,
      loading,
      error,
      refresh,
      lastUpdated,
    }}>
      {children}
    </TAFLibraryContext.Provider>
  );
}
