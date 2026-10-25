import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  Users,
  Award,
  Layers,
  Star,
} from 'lucide-react';
import { categoryApi, serviceApi, freelancerApi } from '../../services/api';
import type { Category, Service, FreelancerProfile } from '../../types';
import { ServiceCard } from '../../components/common/ServiceCard';
import { FreelancerCard } from '../../components/common/FreelancerCard';
import { CardSkeleton } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [topFreelancers, setTopFreelancers] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, servRes, freeRes] = await Promise.all([
          categoryApi.getAll(),
          serviceApi.getServices({ limit: 4, sort: 'popular' }),
          freelancerApi.getFreelancers({ limit: 4, sort: 'rating_desc' }),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (servRes.success) setPopularServices(servRes.data);
        if (freeRes.success) setTopFreelancers(freeRes.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Freelance Marketplace & Escrow Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none mb-6">
            Hire elite freelance talent.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              Build great products.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Discover verified software engineers, product designers, AI specialists, and digital creatives. Protected with transparent escrow and smart rule-based matching.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl mb-8"
          >
            <div className="flex items-center gap-3 flex-1 px-4 py-2 w-full">
              <Search className="w-5 h-5 text-indigo-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="Try 'React Developer', 'Figma Dashboard', 'Video Editing'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-slate-400 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Search Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Popular:</span>
            {['Web Development', 'UI/UX Design', 'AI Models', 'Video Editing', 'DevOps'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/services?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Section Jump Navigator */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10 text-xs">
            <span className="text-indigo-300 font-semibold">Jump to section:</span>
            <a href="#categories" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              Categories
            </a>
            <a href="#popular-services" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              Trending Services
            </a>
            <a href="#how-it-works-summary" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              Workflow
            </a>
            <a href="#top-freelancers" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              Top Talent
            </a>
            <Link to="/how-it-works" className="px-2.5 py-1 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-white font-bold transition-colors">
              Escrow Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-12 relative z-20 scroll-mt-28">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              to={`/services?category=${cat.slug}`}
              className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 flex items-center justify-center text-indigo-600 group-hover:text-white mb-3 transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cat.servicesCount !== undefined ? `${cat.servicesCount} services` : 'Explore'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Services Section */}
      <section id="popular-services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Deliverables</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Services from Pro Freelancers
            </h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 hover:underline"
          >
            <span>Browse All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-summary" className="bg-slate-100/70 py-16 border-y border-slate-200/60 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              How SkillForge Empowers Your Workflow
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Whether you need to hire top talent or offer your services, our platform guarantees transparency at every milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                01
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post a Project or Select a Service</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe your requirements, set your budget, and get instant recommendations through our rule-based smart matching engine.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                02
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hire & Collaborate in Escrow</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accept proposals, deposit funds securely in escrow, and coordinate directly via real-time Socket.IO chat and file sharing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                03
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Approve Delivery & Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect delivered assets, request revisions if needed, release payment once satisfied, and leave verified ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Freelancers */}
      <section id="top-freelancers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Top-Rated Independent Experts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Freelancers
            </h2>
          </div>
          <Link
            to="/freelancers"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 hover:underline"
          >
            <span>Explore Freelancer Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFreelancers.map((profile) => (
              <FreelancerCard key={profile._id} profile={profile} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Ready to find the right talent for your next big project?
            </h3>
            <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
              Post your project for free and start receiving tailored proposals from vetted experts in minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
            <Link to="/client/projects/new">
              <Button size="lg" variant="primary" className="w-full bg-white text-indigo-950 hover:bg-slate-100 shadow-xl">
                Post a Project
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full border-indigo-400 text-white hover:bg-white/10">
                Join as Freelancer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
