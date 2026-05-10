import React, { useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}

export interface FormError {
  field?: string;
  message: string;
}

interface AuthFormProps {
  mode: 'login' | 'register';
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  isLoading: boolean;
  apiError: string | null;
  formErrors: FormError[];
  footer: ReactNode;
}

// --- Components ---

const InputField: React.FC<{
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
}> = ({ field, value, onChange, error, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = field.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : field.type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-slate-700"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={field.name}
          name={field.name}
          type={inputType}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={field.autoComplete}
          minLength={field.minLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
          className={cn(
            'w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all duration-200',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 hover:border-slate-300'
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${field.name}-error`} className="text-xs text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

// --- Main AuthForm Component ---

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  fields,
  onSubmit,
  isLoading,
  apiError,
  formErrors,
  footer,
}) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => (initial[f.name] = ''));
    return initial;
  });

  const getFieldError = (fieldName: string): string | undefined => {
    return formErrors.find((e) => e.field === fieldName)?.message;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const title = mode === 'login' ? 'Welcome back' : 'Create your account';
  const subtitle =
    mode === 'login'
      ? 'Enter your credentials to access your workspace'
      : 'Start your 14-day free trial, no credit card required';

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-600/20">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5" noValidate>
          {/* API Error */}
          {apiError && (
            <div
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in"
              role="alert"
              aria-live="polite"
            >
              {apiError}
            </div>
          )}

          {/* Fields */}
          {fields.map((field) => (
            <InputField
              key={field.name}
              field={field}
              value={values[field.name] || ''}
              onChange={(val) => setValues((prev) => ({ ...prev, [field.name]: val }))}
              error={getFieldError(field.name)}
              disabled={isLoading}
            />
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white',
              'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
            )}
          </button>

          {/* Footer */}
          <div className="pt-2 text-center text-sm text-slate-500">{footer}</div>
        </form>
      </div>

      {/* Branding */}
      <p className="mt-6 text-center text-xs text-slate-400">
        Secure authentication powered by <span className="font-semibold text-slate-500">TASKFLOW</span>
      </p>
    </div>
  );
};