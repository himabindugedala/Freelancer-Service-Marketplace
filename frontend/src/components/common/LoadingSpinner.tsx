import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Loading data...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }

  return content;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse shadow-sm">
      <div className="w-full h-44 bg-slate-200 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="w-20 h-4 bg-slate-200 rounded" />
        <div className="w-16 h-5 bg-slate-200 rounded" />
      </div>
    </div>
  );
};
