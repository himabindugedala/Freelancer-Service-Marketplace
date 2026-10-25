import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { serviceApi, categoryApi } from '../../services/api';
import type { Service, Category, PaginationMeta } from '../../types';
import { ServiceCard } from '../../components/common/ServiceCard';
import { CardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const BrowseServices: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state initialized from query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [deliveryTime, setDeliveryTime] = useState(searchParams.get('deliveryTime') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // Sync state if URL query params change (e.g. from navbar category ribbon)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchTerm(searchParams.get('search') || '');
    setCurrentPage(1);
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Fetch services when filters change
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        sort: sortOption,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;
      if (deliveryTime) params.deliveryTime = deliveryTime;

      const res = await serviceApi.getServices(params);
      if (res.success) {
        setServices(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, sortOption, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices();
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setDeliveryTime('');
    setSortOption('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          ...(selectedCategory !== 'all'
            ? [
                {
                  label:
                    categories.find((c) => c.slug === selectedCategory)?.name ||
                    selectedCategory,
                },
              ]
            : []),
        ]}
        className="mb-4"
      />

      {/* Header and Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Browse Marketplace Services
        </h1>
        <p className="text-sm text-slate-500">
          Explore on-demand services across engineering, design, and digital creative specialties.
        </p>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search keywords in title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Category Dropdown */}
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

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="rating_desc">Top Rated</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Delivery Max Days */}
          <select
            value={deliveryTime}
            onChange={(e) => {
              setDeliveryTime(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Any Delivery Time</option>
            <option value="2">Up to 2 days</option>
            <option value="3">Up to 3 days</option>
            <option value="7">Up to 7 days</option>
          </select>

          {(searchTerm || selectedCategory !== 'all' || minPrice || maxPrice || deliveryTime) && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="We couldn't find any services matching your current filters. Try searching for different keywords or resetting filters."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
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
