import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  Layers,
  Clock,
  DollarSign,
  Tag,
  X,
  AlertCircle,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import { serviceApi, categoryApi, uploadApi } from '../../services/api';
import type { Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const serviceFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  category: z.string().min(1, 'Please select a category'),
  price: z.coerce.number().min(5, 'Price must be at least $5'),
  deliveryTimeDays: z.coerce.number().min(1, 'Delivery time must be at least 1 day'),
  revisionsAllowed: z.coerce.number().min(0).default(2),
  status: z.enum(['published', 'draft', 'paused']).default('published'),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const CreateEditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<string[]>(['React', 'Web Development']);
  const [skillInput, setSkillInput] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80');
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      price: 150,
      deliveryTimeDays: 3,
      revisionsAllowed: 2,
      status: 'published',
    },
  });

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });

    if (isEditing && id) {
      setIsLoading(true);
      serviceApi
        .getById(id)
        .then((res) => {
          if (res.success && res.data) {
            setValue('title', res.data.title);
            setValue('description', res.data.description);
            setValue('category', res.data.category?._id || '');
            setValue('price', res.data.price);
            setValue('deliveryTimeDays', res.data.deliveryTimeDays);
            setValue('revisionsAllowed', res.data.revisionsAllowed);
            setValue('status', res.data.status);
            setCoverImage(res.data.coverImage);
            setSkills(res.data.skills || []);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing, setValue]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadApi.uploadSingle(file);
      if (res.success && res.data) {
        setCoverImage(res.data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

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

  const onSubmit = async (data: ServiceFormValues) => {
    if (skills.length === 0) {
      setServerError('Please provide at least one skill or tag.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    try {
      const payload = {
        ...data,
        skills,
        coverImage,
      };

      if (isEditing && id) {
        await serviceApi.update(id, payload);
      } else {
        await serviceApi.create(payload);
      }

      navigate('/freelancer/services');
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to save service. Please review your form.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading service data..." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isEditing ? 'Edit Service Package' : 'Publish a New Service'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Craft an attractive offering that highlights your expertise, delivery timeframe, and pricing.
        </p>
      </div>

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
          label="Service Title"
          placeholder="I will build a responsive full-stack web application with React & Node"
          error={errors.title?.message}
          helperText="Start with 'I will...' for clear buyer clarity"
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Service Category
            </label>
            <select
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('category')}
            >
              <option value="">Select Category</option>
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
              Publishing Status
            </label>
            <select
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('status')}
            >
              <option value="published">Published (Visible on marketplace)</option>
              <option value="draft">Draft (Saved only to your studio)</option>
              <option value="paused">Paused (Temporarily hidden)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Service Description & What You'll Deliver
          </label>
          <textarea
            rows={6}
            placeholder="Describe what makes your service stand out, the deliverables included, and requirements from the client..."
            className="block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Cover Image Upload (Actual Multer file upload) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Service Cover Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50">
            <img
              src={coverImage}
              alt="Cover Preview"
              className="w-32 h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="flex-1 w-full">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>{isUploading ? 'Uploading Image...' : 'Upload New Cover File'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1.5">
                PNG, JPG, or WebP up to 10MB. Recommended resolution 1200x800.
              </p>
            </div>
          </div>
        </div>

        {/* Deliverable Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Package Price ($ USD)"
            type="number"
            min={5}
            error={errors.price?.message}
            {...register('price')}
          />

          <Input
            label="Delivery Time (Days)"
            type="number"
            min={1}
            error={errors.deliveryTimeDays?.message}
            {...register('deliveryTimeDays')}
          />

          <Input
            label="Included Revisions"
            type="number"
            min={0}
            error={errors.revisionsAllowed?.message}
            {...register('revisionsAllowed')}
          />
        </div>

        {/* Skills Tag Management */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Skills & Keyword Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. React, Express, Tailwind, API Integration..."
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
              Add Tag
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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/freelancer/services')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isEditing ? 'Update Service' : 'Publish Service Package'}
          </Button>
        </div>
      </form>
    </div>
  );
};
