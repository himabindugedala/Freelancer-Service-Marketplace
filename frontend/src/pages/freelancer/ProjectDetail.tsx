import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock,
  DollarSign,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { projectApi, proposalApi } from '../../services/api';
import type { Project, Proposal } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';


const proposalSchema = z.object({
  coverLetter: z.string().min(20, 'Pitch must be at least 20 characters').max(3000),
  bidAmount: z.coerce.number().min(5, 'Bid must be at least $5'),
  deliveryTimeDays: z.coerce.number().min(1, 'Delivery time must be at least 1 day'),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
  });

  const fetchProject = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await projectApi.getById(id);
      if (res.success && res.data) {
        setProject(res.data);
        if (res.data.myProposal) {
          setExistingProposal(res.data.myProposal);
        } else {
          setValue('bidAmount', res.data.budgetMin || 100);
          setValue('deliveryTimeDays', 5);
        }
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const onSubmitProposal = async (data: ProposalFormValues) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!id) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    try {
      const res = await proposalApi.submit(id, data);
      if (res.success) {
        setSuccessMessage('Your proposal was pitched successfully! Client has been notified.');
        fetchProject();
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to submit proposal. Please review your input.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!existingProposal) return;
    if (!window.confirm('Are you sure you want to withdraw this proposal?')) return;
    try {
      await proposalApi.withdraw(existingProposal._id);
      fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw proposal');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Project Not Found</h3>
        <Link to="/projects" className="mt-4 inline-block">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Projects', to: '/projects' },
          ...(project.category
            ? [
                {
                  label: project.category.name,
                },
              ]
            : []),
          { label: project.title },
        ]}
      />

      {/* Project Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                {project.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Category: {project.category?.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-3xl font-black text-slate-900 block">
              ${project.budgetMin} - ${project.budgetMax}
            </span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {project.budgetType} Budget
            </span>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-b border-slate-100 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Posted by: <strong>{project.client?.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-500" />
            <span>{project.proposalsCount} Proposals Submitted</span>
          </div>
        </div>

        {/* Description */}
        <div className="pt-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Project Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>

          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Required Skills & Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {(project.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Submission or Existing Proposal Status */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        {existingProposal ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  You Have Submitted a Proposal for This Project
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  existingProposal.status === 'accepted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : existingProposal.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : existingProposal.status === 'withdrawn'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Status: {existingProposal.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Your Bid: ${existingProposal.bidAmount} USD</span>
                <span>Delivery: {existingProposal.deliveryTimeDays} Days</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed pt-2 border-t border-slate-200">
                {existingProposal.coverLetter}
              </p>
            </div>

            {existingProposal.status === 'pending' && (
              <div className="flex justify-end pt-2">
                <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={handleWithdraw}>
                  Withdraw Proposal
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmitProposal)} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pitch Your Proposal to the Client
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Outline your technical approach, timeline, and deliverables to win this project.
              </p>
            </div>

            {serverError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Proposed Bid Amount ($ USD)"
                type="number"
                min={5}
                error={errors.bidAmount?.message}
                helperText={`Client's budget range: $${project.budgetMin} - $${project.budgetMax}`}
                {...register('bidAmount')}
              />

              <Input
                label="Estimated Completion Time (Days)"
                type="number"
                min={1}
                error={errors.deliveryTimeDays?.message}
                {...register('deliveryTimeDays')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cover Letter & Technical Pitch
              </label>
              <textarea
                rows={6}
                placeholder="Explain why you are the best fit for this project, relevant projects you've built, and how you will execute this scope..."
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('coverLetter')}
              />
              {errors.coverLetter && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.coverLetter.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Submit Proposal Bid
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
