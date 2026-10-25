import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, Sparkles, AlertCircle, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum(['client', 'freelancer']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'client',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError('');
    try {
      await registerAuth(data);
      if (data.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Sparkles className="w-6 h-6 fill-white/20" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the SkillForge network as a client or verified freelancer
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'client')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'client'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Hire Freelancers</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'freelancer')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'freelancer'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Work as Freelancer</span>
              </button>
            </div>
          </div>

          <Input
            label="Full Name"
            placeholder="Sarah Jenkins"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+1 555-0199"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-4"
          >
            Create {selectedRole === 'client' ? 'Client' : 'Freelancer'} Account
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
