import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="font-medium text-[color:var(--m-text-secondary)]"
            style={{ fontSize: '12px' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-2.5 py-1.5
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] text-[color:var(--m-text-primary)]
            placeholder:text-[color:var(--m-text-tertiary)]
            focus:outline-none focus:border-[var(--m-brand)] focus:ring-2 focus:ring-[var(--m-brand-ring)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--m-transition)]
            ${error ? 'border-[var(--m-error)] focus:border-[var(--m-error)] focus:ring-[var(--m-error-subtle)]' : ''}
            ${className}
          `.trim()}
          style={{ fontSize: '13px' }}
          {...props}
        />
        {hint && !error && (
          <span className="text-[color:var(--m-text-tertiary)]" style={{ fontSize: '11px' }}>
            {hint}
          </span>
        )}
        {error && (
          <span className="text-[var(--m-error)]" style={{ fontSize: '11px' }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="font-medium text-[color:var(--m-text-secondary)]"
            style={{ fontSize: '12px' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-2.5 py-1.5
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] text-[color:var(--m-text-primary)]
            placeholder:text-[color:var(--m-text-tertiary)]
            focus:outline-none focus:border-[var(--m-brand)] focus:ring-2 focus:ring-[var(--m-brand-ring)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--m-transition)]
            resize-y min-h-[80px]
            ${error ? 'border-[var(--m-error)]' : ''}
            ${className}
          `.trim()}
          style={{ fontSize: '13px' }}
          {...props}
        />
        {hint && !error && (
          <span className="text-[color:var(--m-text-tertiary)]" style={{ fontSize: '11px' }}>
            {hint}
          </span>
        )}
        {error && (
          <span className="text-[var(--m-error)]" style={{ fontSize: '11px' }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
