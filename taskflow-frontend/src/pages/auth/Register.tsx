import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm, type FormField, type FormError } from '@/components/forms/AuthForm';
import api from '@/api/axios';
import type { AuthResponse, RegisterCredentials } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';

const registerFields: FormField[] = [
    {
        name: 'name',
        label: 'Full name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
        autoComplete: 'name',
    },
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
        placeholder: 'Min. 8 characters',
        required: true,
        autoComplete: 'new-password',
        minLength: 8,
    },
];

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormError[]>([]);

    const validate = useCallback((data: Record<string, string>): FormError[] => {
        const errors: FormError[] = [];

        if (!data.name?.trim()) {
            errors.push({ field: 'name', message: 'Full name is required' });
        } else if (data.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
        }

        if (!data.email?.trim()) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push({ field: 'email', message: 'Please enter a valid email address' });
        }

        if (!data.password) {
            errors.push({ field: 'password', message: 'Password is required' });
        } else if (data.password.length < 8) {
            errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
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
                const credentials: RegisterCredentials = {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    password: data.password,
                };

                const response = await api.post<AuthResponse>('/api/auth/register', credentials);
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
            Already have an account?{' '}
            <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
                Sign in
            </Link>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <AuthForm
                    mode="register"
                    fields={registerFields}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    apiError={apiError}
                    formErrors={formErrors}
                    footer={footer}
                />
            </div>
        </div>
    );
};

export default Register;