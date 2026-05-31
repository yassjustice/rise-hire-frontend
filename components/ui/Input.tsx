import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-700">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`
          w-full px-3 py-2 rounded-lg border text-text-900 text-sm
          placeholder:text-text-400 bg-white
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:bg-bg-50 disabled:text-text-400
          ${error ? 'border-danger' : 'border-border'}
          ${className}
        `}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-text-400">{hint}</p>}
    </div>
  );
}
