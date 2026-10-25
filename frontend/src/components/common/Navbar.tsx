import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bell,
  MessageSquare,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Briefcase,
  Layers,
  ShieldAlert,
  Menu,
  X,
  Wallet,
  Settings,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from './Button';
import { SiteNavigationModal } from './SiteNavigationModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);

  const categoriesNav = [
    { label: 'All Services', to: '/services', slug: 'all' },
    { label: 'Web & App Dev', to: '/services?category=web-app-development', slug: 'web-app-development' },
    { label: 'UI/UX Design', to: '/services?category=ui-ux-design', slug: 'ui-ux-design' },
    { label: 'AI & Data Science', to: '/services?category=ai-data-science', slug: 'ai-data-science' },
    { label: 'Video & Motion', to: '/services?category=video-editing', slug: 'video-editing' },
    { label: 'Cloud & DevOps', to: '/services?category=cloud-devops', slug: 'cloud-devops' },
    { label: 'Logo & Brand', to: '/services?category=logo-brand-identity', slug: 'logo-brand-identity' },
    { label: 'Writing & Copy', to: '/services?category=writing-translation', slug: 'writing-translation' },
    { label: 'Digital Marketing', to: '/services?category=digital-marketing', slug: 'digital-marketing' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Main Navbar Top Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  SkillForge
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-indigo-500 block -mt-1">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Search Bar (Desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-md relative items-center"
            >
              <input
                type="text"
                placeholder="Search services, skills, or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            </form>

            {/* Center Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-600">
              <Link
                to="/services"
                className={`hover:text-indigo-600 transition-colors ${
                  location.pathname.startsWith('/services') ? 'text-indigo-600' : ''
                }`}
              >
                Services
              </Link>
              <Link
                to="/freelancers"
                className={`hover:text-indigo-600 transition-colors ${
                  location.pathname.startsWith('/freelancers') ? 'text-indigo-600' : ''
                }`}
              >
                Freelancers
              </Link>
              <Link
                to="/projects"
                className={`hover:text-indigo-600 transition-colors ${
                  location.pathname.startsWith('/projects') ? 'text-indigo-600' : ''
                }`}
              >
                Projects
              </Link>
              <Link
                to="/how-it-works"
                className={`hover:text-indigo-600 transition-colors ${
                  location.pathname === '/how-it-works' ? 'text-indigo-600' : ''
                }`}
              >
                How it Works
              </Link>

              {/* Sitemap & All Pages Navigator Trigger */}
              <button
                type="button"
                onClick={() => setIsNavModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60"
                title="Explore all pages and sections"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>All Pages</span>
              </button>
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {/* Role-Specific Primary CTA */}
                  {user.role === 'client' && (
                    <Link to="/client/projects/new">
                      <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                        Post a Project
                      </Button>
                    </Link>
                  )}

                  {user.role === 'freelancer' && (
                    <Link to="/freelancer/services/new">
                      <Button size="sm" variant="outline" leftIcon={<PlusCircle className="w-4 h-4" />}>
                        Create Service
                      </Button>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link to="/admin">
                      <Button size="sm" variant="danger" leftIcon={<ShieldAlert className="w-4 h-4" />}>
                        Admin Portal
                      </Button>
                    </Link>
                  )}

                  {/* Messages Icon */}
                  <Link
                    to="/messages"
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors relative"
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {/* Notifications Icon with Badge */}
                  <Link
                    to="/notifications"
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Profile Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-200 transition-all focus:outline-none"
                    >
                      <img
                        src={
                          user.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                        }
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileOpen && (
                      <div
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <div className="mt-2 flex items-center justify-between text-xs font-semibold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <span className="capitalize text-slate-600 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                              {user.role} Account
                            </span>
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Wallet className="w-3.5 h-3.5" />
                              ${user.walletBalance || 0}
                            </span>
                          </div>
                        </div>

                        <div className="py-1 text-sm font-medium text-slate-700">
                          {user.role === 'client' && (
                            <>
                              <Link
                                to="/client/dashboard"
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Client Dashboard
                              </Link>
                              <Link
                                to="/client/projects"
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <Layers className="w-4 h-4 text-slate-400" />
                                My Posted Projects
                              </Link>
                              <Link
                                to="/client/orders"
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Client Orders
                              </Link>
                            </>
                          )}

                          {user.role === 'freelancer' && (
                            <>
                              <Link
                                to="/freelancer/dashboard"
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Freelancer Dashboard
                              </Link>
                              <Link
                                to="/freelancer/services"
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <Layers className="w-4 h-4 text-slate-400" />
                                My Services
                              </Link>
                              <Link
                                to="/freelancer/orders"
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Freelancer Orders
                              </Link>
                              <Link
                                to={`/freelancers/${user._id}`}
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <UserIcon className="w-4 h-4 text-slate-400" />
                                Public Profile
                              </Link>
                            </>
                          )}

                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Admin Console
                            </Link>
                          )}

                          <Link
                            to="/settings"
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Profile Settings
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Join Free
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Category Ribbon Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 text-xs font-semibold whitespace-nowrap">
            {categoriesNav.map((cat, idx) => {
              const currentCat = new URLSearchParams(location.search).get('category') || (location.pathname === '/services' ? 'all' : '');
              const isActive = cat.slug === currentCat;

              return (
                <Link
                  key={idx}
                  to={cat.to}
                  className={`px-3 py-1 rounded-full transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search services or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <nav className="flex flex-col gap-2 pt-2 text-sm font-medium text-slate-700">
              <Link
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Browse Services
              </Link>
              <Link
                to="/freelancers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Browse Freelancers
              </Link>
              <Link
                to="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Browse Projects
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                How It Works
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsNavModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-indigo-600 font-bold bg-indigo-50 rounded-lg text-left"
              >
                <Compass className="w-4 h-4" />
                <span>Explore All Pages & Sections</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Global Site Navigation Modal */}
      <SiteNavigationModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
      />
    </>
  );
};
