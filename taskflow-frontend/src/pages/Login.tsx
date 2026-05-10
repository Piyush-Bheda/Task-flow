import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm, type FormField, type FormError } from '../components/forms/AuthForm';
import api from '../api/axios';
import type { AuthResponse, LoginCredentials } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';

const loginFields: FormField[] = [
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    placeholder: 'you@company.com',
    required: true,
    autoComplete: 'email',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    required: true,
    autoComplete: 'current-password',
    minLength: 6,
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError[]>([]);

  const validate = useCallback((data: Record<string, string>): FormError[] => {
    const errors: FormError[] = [];
    
    if (!data.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    if (!data.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (data.password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
    
    return errors;
  }, []);

  const handleSubmit = useCallback(
    async (data: Record<string, string>) => {
      setApiError(null);
      setFormErrors([]);

      const validationErrors = validate(data);
      if (validationErrors.length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      setIsLoading(true);

      try {
        const credentials: LoginCredentials = {
          email: data.email.trim(),
          password: data.password,
        };

        const response = await api.post<AuthResponse>('/api/auth/login', credentials);
        const { token, user } = response.data;

        login(token, user);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        const message =
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred. Please try again.';
        setApiError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [validate, login, navigate]
  );

  const footer = (
    <>
      Don't have an account?{' '}
      <Link
        to="/register"
        className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        Create one
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm
          mode="login"
          fields={loginFields}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          apiError={apiError}
          formErrors={formErrors}
          footer={footer}
        />
      </div>
    </div>
  );
}