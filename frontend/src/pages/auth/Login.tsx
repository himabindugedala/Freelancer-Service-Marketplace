import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Sparkles, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError('');
    try {
      await login(data);
      // Retrieve stored user to determine role redirect
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'freelancer') navigate('/freelancer/dashboard');
      else if (user?.role === 'client') navigate('/client/dashboard');
      else navigate(from);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Sparkles className="w-6 h-6 fill-white/20" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your projects, orders, and messages
          </p>
        </div>

        {/* Quick Demo Fill Buttons for Testing */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            Quick-Fill Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('client1@techcorp.com', 'Password123!')}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs"
            >
              Client Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('freelancer1@marketplace.com', 'Password123!')}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs"
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@marketplace.com', 'Admin123!Secure')}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-rose-700 hover:border-rose-400 transition-colors shadow-2xs"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
};
