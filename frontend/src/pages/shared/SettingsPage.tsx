import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, DollarSign, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, uploadApi } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();

  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || ['React', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      headline: profile?.headline || '',
      hourlyRate: profile?.hourlyRate || 35,
      availability: profile?.availability || 'available',
      experienceLevel: profile?.experienceLevel || 'intermediate',
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadApi.uploadSingle(file);
      if (res.success && res.data) {
        setAvatar(res.data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Avatar upload failed');
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

  const removeSkill = (sToRemove: string) => {
    setSkills(skills.filter((s) => s !== sToRemove));
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setServerError('');
    try {
      const payload = {
        ...data,
        avatar,
        skills,
      };

      const res = await authApi.updateProfile(payload);
      if (res.success) {
        setSuccessMessage('Profile settings saved successfully.');
        await refreshUser();
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your public profile, contact details, and freelancer rates.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
      >
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Profile Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <img
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>{isUploading ? 'Uploading...' : 'Upload New Photo'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            leftIcon={<User className="w-4 h-4" />}
            {...register('name')}
          />

          <Input
            label="Phone Number"
            leftIcon={<Phone className="w-4 h-4" />}
            {...register('phone')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">About / Bio</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('bio')}
          />
        </div>

        {/* Freelancer Specific Settings */}
        {user?.role === 'freelancer' && (
          <div className="pt-6 border-t border-slate-100 space-y-6">
            <h3 className="text-base font-bold text-slate-900">Freelancer Professional Settings</h3>

            <Input
              label="Professional Headline"
              placeholder="e.g. Senior Full-Stack Engineer | React & Node.js"
              {...register('headline')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Hourly Rate ($ USD)"
                type="number"
                min={5}
                {...register('hourlyRate')}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Current Availability
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('availability')}
                >
                  <option value="available">Available Immediately</option>
                  <option value="busy">Busy (Limited capacity)</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Experience Level
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('experienceLevel')}
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert / Senior</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Skills & Endorsements
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add skill..."
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
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl"
                  >
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
