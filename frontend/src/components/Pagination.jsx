import { useTranslation } from '../hooks/useTranslation';

/**
 * Reusable pagination component with consistent styling
 *
 * @param {Object} props
 * @param {number} props.page - Current page number (1-indexed)
 * @param {number} props.pageSize - Items per page
 * @param {number} props.totalCount - Total number of items
 * @param {boolean} props.hasNext - Whether there's a next page
 * @param {boolean} props.hasPrev - Whether there's a previous page
 * @param {function} props.onPageChange - Callback when page changes (receives new page number)
 * @param {function} [props.onPageSizeChange] - Optional callback when page size changes
 * @param {number[]} [props.pageSizeOptions] - Available page size options
 */
export default function Pagination({
  page,
  pageSize,
  totalCount,
  hasNext,
  hasPrev,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}) {
  const { t } = useTranslation();

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = ((page - 1) * pageSize) + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Item count info */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {totalCount > 0 ? (
          <>
            {t('pagination.showing')}{' '}
            <span className="font-medium">{startItem}</span>
            {' '}{t('pagination.to')}{' '}
            <span className="font-medium">{endItem}</span>
            {' '}{t('pagination.of')}{' '}
            <span className="font-medium">{totalCount}</span>
            {' '}{t('pagination.items')}
          </>
        ) : (
          t('pagination.noItems')
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700 dark:text-gray-300">
              {t('pagination.perPage')}:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="block w-20 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-colors ${
              hasPrev
                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            aria-label={t('pagination.previous')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page indicator */}
          <span className="px-4 py-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
            {t('pagination.page')} {page} {t('pagination.of')} {totalPages || 1}
          </span>

          {/* Next button */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-colors ${
              hasNext
                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            aria-label={t('pagination.next')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
