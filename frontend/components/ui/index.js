import { clsx } from 'clsx';

export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Card({ children, className, ...props }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', variants[variant], className)}>
      {children}
    </span>
  );
}

export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-200 border-t-primary-600', sizes[size])} />
  );
}
