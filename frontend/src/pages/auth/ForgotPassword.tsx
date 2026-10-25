import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      if (res.data?.demoToken) {
        setDemoToken(res.data.demoToken);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to receive simulated password recovery instructions
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="font-semibold">Reset code generated successfully!</p>
              {demoToken && (
                <div className="p-2 bg-white rounded-lg border border-emerald-200 font-mono text-[11px] text-slate-700">
                  Demo Code: <strong>{demoToken}</strong>
                </div>
              )}
            </div>

            <Link to="/login">
              <Button variant="primary" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Send Reset Code
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
