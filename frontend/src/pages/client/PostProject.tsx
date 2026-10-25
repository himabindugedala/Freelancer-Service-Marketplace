import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  Tag,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { categoryApi, projectApi, matchingApi } from '../../services/api';
import type { Category, SmartMatch } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RatingStars } from '../../components/common/RatingStars';

const projectFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters').max(6000),
  category: z.string().min(1, 'Please select a category'),
  budgetType: z.enum(['fixed', 'hourly']),
  budgetMin: z.coerce.number().min(5, 'Minimum budget must be at least $5'),
  budgetMax: z.coerce.number().min(5, 'Maximum budget must be at least $5'),
  deadline: z.string().min(1, 'Please specify an expected deadline date'),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const PostProject: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [smartMatches, setSmartMatches] = useState<SmartMatch[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      budgetType: 'fixed',
      budgetMin: 150,
      budgetMax: 500,
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    },
  });

  const watchedCategory = watch('category');
  const watchedBudgetType = watch('budgetType');
  const watchedBudgetMin = watch('budgetMin');
  const watchedBudgetMax = watch('budgetMax');

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.success && res.data.length > 0) {
        setCategories(res.data);
      }
    });
  }, []);

  // Live preview matching recommendations
  useEffect(() => {
    if (!watchedCategory || skills.length === 0) return;

    const timer = setTimeout(async () => {
      setIsMatchingLoading(true);
      try {
        const res = await matchingApi.previewDraftMatches({
          category: watchedCategory,
          skills,
          budgetType: watchedBudgetType,
          budgetMin: watchedBudgetMin,
          budgetMax: watchedBudgetMax,
        });
        if (res.success) {
          setSmartMatches(res.data || []);
        }
      } catch (err) {
        console.error('Matching preview error:', err);
      } finally {
        setIsMatchingLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [watchedCategory, skills, watchedBudgetType, watchedBudgetMin, watchedBudgetMax]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const onSubmit = async (data: ProjectFormValues) => {
    if (skills.length === 0) {
      setServerError('Please add at least one required skill tag.');
      return;
    }
    if (data.budgetMin > data.budgetMax) {
      setServerError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    try {
      const payload = {
        ...data,
        skills,
      };

      const res = await projectApi.create(payload);
      if (res.success && res.data) {
        navigate(`/client/projects/${res.data._id}/proposals`);
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to post project. Please review your form.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Post a New Project
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Define your project requirements, set a budget, and get instant talent recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
          >
            {serverError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Input
              label="Project Title"
              placeholder="e.g. Build Real-Time Collaboration Dashboard with React & Node.js"
              error={errors.title?.message}
              helperText="Summarize the core deliverable in a clear, concise headline"
              {...register('title')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('category')}
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Detailed Scope of Work & Requirements
              </label>
              <textarea
                rows={6}
                placeholder="Describe your goals, tech stack preferences, key deliverables, and expectations in detail..."
                className="block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Skills Tag Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Required Skills & Technologies
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. React, MongoDB, Figma, Python..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" variant="secondary" onClick={addSkill}>
                  Add Skill
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Budget & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Budget Structure
                </label>
                <select
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('budgetType')}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>

              <Input
                label="Min Budget ($)"
                type="number"
                min={5}
                error={errors.budgetMin?.message}
                {...register('budgetMin')}
              />

              <Input
                label="Max Budget ($)"
                type="number"
                min={5}
                error={errors.budgetMax?.message}
                {...register('budgetMax')}
              />
            </div>

            {/* Deadline */}
            <Input
              label="Expected Deadline Date"
              type="date"
              error={errors.deadline?.message}
              {...register('deadline')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Publish Project & Open for Bids
            </Button>
          </form>
        </div>

        {/* Right Column: Rule-Based Smart Matching Live Feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs sticky top-24">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Live Smart Matching Preview
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Our transparent rule-based algorithm scores candidates based on skills overlap (35%), category match (20%), rating (15%), experience, and budget compatibility.
            </p>

            {isMatchingLoading ? (
              <p className="text-xs text-slate-400 animate-pulse text-center py-6">
                Recalculating match scores...
              </p>
            ) : smartMatches.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                Select a category and add skill tags to preview candidate matches.
              </p>
            ) : (
              <div className="space-y-3">
                {smartMatches.map((m) => (
                  <div
                    key={m.freelancer._id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-indigo-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            m.freelancer.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              m.freelancer.name
                            )}`
                          }
                          alt={m.freelancer.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-900">{m.freelancer.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px]">
                        {m.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                      {m.freelancer.headline}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {m.matchReasons.slice(0, 2).map((reason, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium"
                        >
                          &bull; {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
