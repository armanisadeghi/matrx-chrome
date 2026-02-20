import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default:
    'bg-[var(--m-bg-card)] border border-[var(--m-border)] text-[var(--m-text-primary)] hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]',
  primary:
    'bg-[var(--m-brand)] text-[var(--m-text-inverse)] hover:bg-[var(--m-brand-hover)] active:bg-[var(--m-brand-active)] border border-transparent',
  secondary:
    'bg-transparent border border-[var(--m-brand)] text-[var(--m-brand)] hover:bg-[var(--m-brand-subtle)]',
  ghost:
    'bg-transparent border border-transparent text-[var(--m-text-secondary)] hover:bg-[var(--m-bg-hover)] hover:text-[var(--m-text-primary)]',
  danger:
    'bg-transparent border border-[var(--m-border)] text-[var(--m-text-primary)] hover:bg-[var(--m-error-subtle)] hover:text-[var(--m-error)] hover:border-[var(--m-error)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-[var(--m-text-sm)] gap-1 rounded-[var(--m-radius-sm)]',
  md: 'px-3 py-1.5 text-[var(--m-text-sm)] gap-1.5 rounded-[var(--m-radius-md)]',
  lg: 'px-4 py-2 text-[var(--m-text-md)] gap-2 rounded-[var(--m-radius-md)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      block = false,
      icon = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium cursor-pointer
          transition-all duration-[var(--m-transition)]
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-2 focus-visible:outline-[var(--m-brand-ring)] focus-visible:outline-offset-2
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${block ? 'w-full' : ''}
          ${icon ? '!p-1.5' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
