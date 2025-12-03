/**
 * Shared Card component for content containers
 * Supports header, body, footer sections
 */

export default function Card({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick,
}) {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow transition-colors';
  const paddingClasses = padding ? 'p-4 sm:p-6' : '';
  const hoverClasses = hover
    ? 'hover:shadow-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-600'
    : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      {children}
    </div>
  );
}

// Card Header component
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// Card Title component
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

// Card Description component
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

// Card Body component
export function CardBody({ children, className = '' }) {
  return <div className={`py-4 ${className}`}>{children}</div>;
}

// Card Footer component
export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 ${className}`}
    >
      {children}
    </div>
  );
}

// Alert Card variants for messages
export function AlertCard({ variant = 'info', title, children, className = '' }) {
  const variants = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      title: 'text-blue-900 dark:text-blue-200',
      text: 'text-blue-800 dark:text-blue-300',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      title: 'text-green-900 dark:text-green-200',
      text: 'text-green-800 dark:text-green-300',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-900 dark:text-yellow-200',
      text: 'text-yellow-800 dark:text-yellow-300',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      title: 'text-red-900 dark:text-red-200',
      text: 'text-red-800 dark:text-red-300',
    },
  };

  const style = variants[variant] || variants.info;

  return (
    <div className={`${style.bg} border ${style.border} rounded-md p-4 ${className}`}>
      {title && <h4 className={`text-sm font-medium ${style.title} mb-2`}>{title}</h4>}
      <div className={`text-sm ${style.text}`}>{children}</div>
    </div>
  );
}
