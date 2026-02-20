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
            className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-[var(--m-text-md)]
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] text-[var(--m-text-primary)]
            placeholder:text-[var(--m-text-tertiary)]
            focus:outline-none focus:border-[var(--m-brand)] focus:ring-2 focus:ring-[var(--m-brand-ring)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--m-transition)]
            ${error ? 'border-[var(--m-error)] focus:border-[var(--m-error)] focus:ring-[var(--m-error-subtle)]' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {hint && !error && (
          <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
            {hint}
          </span>
        )}
        {error && (
          <span className="text-[var(--m-text-xs)] text-[var(--m-error)]">
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
            className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-secondary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-[var(--m-text-md)]
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] text-[var(--m-text-primary)]
            placeholder:text-[var(--m-text-tertiary)]
            focus:outline-none focus:border-[var(--m-brand)] focus:ring-2 focus:ring-[var(--m-brand-ring)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--m-transition)]
            resize-y min-h-[80px]
            ${error ? 'border-[var(--m-error)]' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {hint && !error && (
          <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
            {hint}
          </span>
        )}
        {error && (
          <span className="text-[var(--m-text-xs)] text-[var(--m-error)]">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
