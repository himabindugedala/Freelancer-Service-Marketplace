import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, PlusCircle, Users, Clock, AlertCircle } from 'lucide-react';
import { projectApi } from '../../services/api';
import type { Project } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectApi.getMyProjects();
      if (res.success) setProjects(res.data);
    } catch (err) {
      console.error('Error fetching client projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCloseProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to close this project to further proposals?')) return;
    try {
      await projectApi.close(id);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close project');
    }
  };

  const filtered = filterStatus === 'all' ? projects : projects.filter((p) => p.status === filterStatus);

  if (isLoading) {
    return <LoadingSpinner message="Loading your projects..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Posted Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming bids, evaluate candidate profiles, and manage hired contracts.
          </p>
        </div>

        <Link to="/client/projects/new">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post a Project
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-500">
        {['all', 'open', 'in_progress', 'completed', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
              filterStatus === st
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="You don't have any projects under this filter status."
          actionText="Post a New Project"
          onAction={() => window.location.assign('/client/projects/new')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      proj.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700'
                        : proj.status === 'in_progress'
                        ? 'bg-indigo-50 text-indigo-700'
                        : proj.status === 'completed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {proj.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Category: {proj.category?.name || 'General'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                  <span>
                    Budget: <strong className="text-slate-800">${proj.budgetMin} - ${proj.budgetMax}</strong> ({proj.budgetType})
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Deadline: {new Date(proj.deadline).toLocaleDateString()}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-indigo-600 font-bold">
                    <Users className="w-3.5 h-3.5" />
                    {proj.proposalsCount} Proposals
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-shrink-0">
                <Link to={`/client/projects/${proj._id}/proposals`}>
                  <Button variant="primary" size="sm">
                    View Proposals ({proj.proposalsCount})
                  </Button>
                </Link>

                {proj.status === 'open' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => handleCloseProject(proj._id)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
