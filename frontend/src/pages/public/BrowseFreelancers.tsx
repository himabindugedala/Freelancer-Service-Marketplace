import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { freelancerApi } from '../../services/api';
import type { FreelancerProfile, PaginationMeta } from '../../types';
import { FreelancerCard } from '../../components/common/FreelancerCard';
import { CardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const BrowseFreelancers: React.FC = () => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sortOption, setSortOption] = useState('rating_desc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFreelancers = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        sort: sortOption,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (skillFilter.trim()) params.skill = skillFilter.trim();
      if (availability && availability !== 'all') params.availability = availability;

      const res = await freelancerApi.getFreelancers(params);
      if (res.success) {
        setFreelancers(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load freelancers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [availability, sortOption, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFreelancers();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSkillFilter('');
    setAvailability('all');
    setSortOption('rating_desc');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Discover Top Freelancers
        </h1>
        <p className="text-sm text-slate-500">
          Find and hire verified domain experts, engineers, designers, and creative directors.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search freelancers by name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Skill Tag Quick Filter */}
          <input
            type="text"
            placeholder="Filter by skill (e.g. React)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchFreelancers()}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Availability */}
          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Any Availability</option>
            <option value="available">Available Now</option>
            <option value="busy">Busy / High Demand</option>
          </select>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="completed_desc">Most Jobs Completed</option>
            <option value="rate_asc">Hourly Rate: Low to High</option>
            <option value="rate_desc">Hourly Rate: High to Low</option>
          </select>

          {(searchTerm || skillFilter || availability !== 'all') && (
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

      {/* Freelancers Directory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          title="No freelancers matched"
          description="We couldn't find any freelancers matching your query. Try broadening your search or resetting filters."
          actionText="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {freelancers.map((profile) => (
              <FreelancerCard key={profile._id} profile={profile} />
            ))}
          </div>

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
        </>
      )}
    </div>
  );
};
