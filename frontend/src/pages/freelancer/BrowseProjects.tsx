import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, DollarSign, Users, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { projectApi, categoryApi } from '../../services/api';
import type { Project, Category, PaginationMeta } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner, CardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const BrowseProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetType, setBudgetType] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
        sort: sortOption,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (budgetType && budgetType !== 'all') params.budgetType = budgetType;

      const res = await projectApi.getOpenProjects(params);
      if (res.success) {
        setProjects(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, budgetType, sortOption, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setBudgetType('all');
    setSortOption('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Browse Open Client Projects
        </h1>
        <p className="text-sm text-slate-500">
          Find contract projects seeking your skillset and pitch competitive proposals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search projects by title or required skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={budgetType}
            onChange={(e) => {
              setBudgetType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Any Budget Type</option>
            <option value="fixed">Fixed Price</option>
            <option value="hourly">Hourly Rate</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="budget_desc">Highest Budget</option>
            <option value="budget_asc">Lowest Budget</option>
          </select>

          {(searchTerm || selectedCategory !== 'all' || budgetType !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No open projects found"
          description="We couldn't find any projects matching your filter criteria. Try clearing your filters."
          actionText="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-4 mb-12">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                    {proj.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {proj.category?.name} &bull; Posted {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                  <Link to={`/projects/${proj._id}`}>{proj.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(proj.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Budget & Submit CTA */}
              <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto justify-between flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-slate-900 block leading-tight">
                    ${proj.budgetMin} - ${proj.budgetMax}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    {proj.budgetType} Budget
                  </span>
                </div>

                <Link to={`/projects/${proj._id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View & Pitch Proposal
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold text-slate-600 px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
