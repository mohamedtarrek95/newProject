import { clsx } from 'clsx';

export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-premium-500 to-premium-600 text-surface-900 font-semibold hover:from-premium-400 hover:to-premium-500 hover:shadow-premium-glow focus:ring-premium-400',
    secondary: 'bg-surface-700 text-white hover:bg-surface-600 border border-surface-600 hover:border-surface-500 focus:ring-surface-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 hover:shadow-lg focus:ring-red-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg focus:ring-emerald-400',
    outline: 'border-2 border-surface-600 text-white hover:bg-surface-700 hover:border-surface-500 focus:ring-surface-500',
    ghost: 'bg-transparent text-surface-300 hover:bg-surface-800 hover:text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900',
        'inline-flex items-center justify-center gap-2',
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

export function Input({ label, error, className, dir, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-surface-300">
          {label}
        </label>
      )}
      <input
        dir={dir || 'ltr'}
        className={clsx(
          'w-full bg-surface-800 border border-surface-600 text-white px-4 py-3 rounded-lg',
          'placeholder:text-surface-500',
          'focus:ring-2 focus:ring-premium-500 focus:border-transparent outline-none',
          'transition-all duration-200',
          error ? 'border-red-500 focus:ring-red-500' : 'hover:border-surface-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, dir, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-surface-300">
          {label}
        </label>
      )}
      <select
        dir={dir || 'ltr'}
        className={clsx(
          'w-full bg-surface-800 border border-surface-600 text-white px-4 py-3 rounded-lg',
          'focus:ring-2 focus:ring-premium-500 focus:border-transparent outline-none',
          'transition-all duration-200 cursor-pointer',
          'hover:border-surface-500',
          error ? 'border-red-500 focus:ring-red-500' : '',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Card({ children, className, premium, ...props }) {
  const cardClass = premium
    ? 'bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-600 rounded-xl p-6 shadow-premium-md relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-gradient-to-r before:from-transparent before:via-premium-500/50 before:to-transparent'
    : 'bg-surface-800 border border-surface-700 rounded-xl p-6 shadow-premium';

  return (
    <div className={clsx(cardClass, 'transition-all duration-200', className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-surface-600 text-surface-200 border border-surface-500',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };

  return (
    <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', variants[variant], className)}>
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
    <div className={clsx('animate-spin rounded-full border-2 border-surface-600 border-t-premium-500', sizes[size])} />
  );
}

export function Alert({ children, variant = 'info', className }) {
  const variants = {
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };

  return (
    <div className={clsx('p-4 rounded-lg text-sm font-medium', variants[variant], className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, color = 'premium' }) {
  const colors = {
    premium: 'text-premium-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  };

  return (
    <Card premium className="text-center group hover:scale-[1.02] transition-transform duration-200">
      <div className="flex flex-col items-center">
        {icon && (
          <div className={clsx('mb-3 p-3 rounded-full bg-surface-700', colors[color])}>
            {icon}
          </div>
        )}
        <p className="text-surface-400 text-sm mb-1 truncate">{label}</p>
        <p className={clsx('text-3xl font-bold', colors[color])}>{value}</p>
      </div>
    </Card>
  );
}