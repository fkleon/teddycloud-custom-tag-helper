import { createContext, useState, useEffect, useCallback } from 'react';
import { tafLibraryAPI } from '../api/client';

export const TAFLibraryContext = createContext();

const DEFAULT_PAGE_SIZE = 50;

export function TAFLibraryProvider({ children }) {
  const [tafFiles, setTafFiles] = useState([]);
  const [stats, setStats] = useState({ total: 0, linked: 0, orphaned: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const loadTafFiles = useCallback(async (force = false, newPage = page, newPageSize = pageSize) => {
    // Skip if already loaded and not forcing refresh (and same page)
    if (tafFiles.length > 0 && !force && lastUpdated && newPage === page && newPageSize === pageSize) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skip = (newPage - 1) * newPageSize;
      const { data } = await tafLibraryAPI.getAll(skip, newPageSize);

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
      setTotalCount(data.total_count || 0);
      setPage(data.page || 1);
      setPageSize(data.page_size || DEFAULT_PAGE_SIZE);
      setHasNext(data.has_next || false);
      setHasPrev(data.has_prev || false);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setLoading(false);
    }
  }, [tafFiles.length, lastUpdated, page, pageSize]);

  // Load on mount
  useEffect(() => {
    loadTafFiles();
  }, []);

  const refresh = useCallback(() => {
    return loadTafFiles(true);
  }, [loadTafFiles]);

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
    return loadTafFiles(true, newPage, pageSize);
  }, [loadTafFiles, pageSize]);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
    return loadTafFiles(true, 1, newPageSize);
  }, [loadTafFiles]);

  return (
    <TAFLibraryContext.Provider value={{
      tafFiles,
      stats,
      loading,
      error,
      refresh,
      lastUpdated,
      // Pagination
      page,
      pageSize,
      totalCount,
      hasNext,
      hasPrev,
      goToPage,
      changePageSize,
    }}>
      {children}
    </TAFLibraryContext.Provider>
  );
}
