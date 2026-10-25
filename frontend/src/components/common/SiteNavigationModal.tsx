import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Compass,
  Home,
  Layers,
  Users,
  Briefcase,
  HelpCircle,
  PlusCircle,
  FileText,
  MessageSquare,
  Bell,
  Bookmark,
  Settings,
  ShieldAlert,
  LogIn,
  UserPlus,
  KeyRound,
  FolderTree,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

interface SiteNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteNavigationModal: React.FC<SiteNavigationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Public Marketplace',
      description: 'Open access catalog, profiles, and information',
      color: 'border-indigo-500/20 bg-indigo-50/50',
      links: [
        { label: 'Home Page', to: '/', desc: 'Hero, featured categories, top services', icon: <Home className="w-4 h-4 text-indigo-600" /> },
        { label: 'Browse Services', to: '/services', desc: 'Search & filter all freelance gigs', icon: <Layers className="w-4 h-4 text-indigo-600" /> },
        { label: 'Find Freelancers', to: '/freelancers', desc: 'Explore vetted talent & profiles', icon: <Users className="w-4 h-4 text-indigo-600" /> },
        { label: 'Browse Projects', to: '/projects', desc: 'Open client project requests', icon: <Briefcase className="w-4 h-4 text-indigo-600" /> },
        { label: 'How It Works', to: '/how-it-works', desc: 'Escrow protection & workflows', icon: <HelpCircle className="w-4 h-4 text-indigo-600" /> },
      ],
    },
    {
      title: 'Client Workspace',
      description: 'For businesses and hiring individuals',
      color: 'border-blue-500/20 bg-blue-50/50',
      badge: 'Client',
      links: [
        { label: 'Client Dashboard', to: '/client/dashboard', desc: 'Account overview & active hires', icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
        { label: 'Post a New Project', to: '/client/projects/new', desc: 'Create brief with live matching', icon: <PlusCircle className="w-4 h-4 text-blue-600" /> },
        { label: 'My Posted Projects', to: '/client/projects', desc: 'Manage listings & check bids', icon: <Layers className="w-4 h-4 text-blue-600" /> },
        { label: 'Client Orders', to: '/client/orders', desc: 'Track deliveries & escrow release', icon: <FileText className="w-4 h-4 text-blue-600" /> },
      ],
    },
    {
      title: 'Freelancer Workspace',
      description: 'For independent specialists & developers',
      color: 'border-emerald-500/20 bg-emerald-50/50',
      badge: 'Freelancer',
      links: [
        { label: 'Freelancer Dashboard', to: '/freelancer/dashboard', desc: 'Earnings, statistics & orders', icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
        { label: 'My Services', to: '/freelancer/services', desc: 'Manage your active gigs', icon: <Layers className="w-4 h-4 text-emerald-600" /> },
        { label: 'Create Service', to: '/freelancer/services/new', desc: 'Publish a new gig with tiers', icon: <PlusCircle className="w-4 h-4 text-emerald-600" /> },
        { label: 'My Proposals', to: '/freelancer/proposals', desc: 'Track your pending bids', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
        { label: 'Freelancer Orders', to: '/freelancer/orders', desc: 'Work in progress & deliveries', icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
      ],
    },
    {
      title: 'Platform Management',
      description: 'System-wide control & audit tools',
      color: 'border-rose-500/20 bg-rose-50/50',
      badge: 'Admin',
      links: [
        { label: 'Admin Analytics', to: '/admin', desc: 'Platform metrics & escrow volume', icon: <ShieldAlert className="w-4 h-4 text-rose-600" /> },
        { label: 'User Directory', to: '/admin/users', desc: 'User moderation & suspension', icon: <Users className="w-4 h-4 text-rose-600" /> },
        { label: 'Services Moderation', to: '/admin/services', desc: 'Gig compliance & reviews', icon: <Layers className="w-4 h-4 text-rose-600" /> },
        { label: 'Category Manager', to: '/admin/categories', desc: 'Organize platform taxonomies', icon: <FolderTree className="w-4 h-4 text-rose-600" /> },
        { label: 'Dispute Reports', to: '/admin/reports', desc: 'Review & mediate complaints', icon: <AlertOctagon className="w-4 h-4 text-rose-600" /> },
      ],
    },
    {
      title: 'Communications & Account',
      description: 'Real-time collaboration and preferences',
      color: 'border-purple-500/20 bg-purple-50/50',
      links: [
        { label: 'Live Chat & Messaging', to: '/messages', desc: 'Socket.IO chat with file sharing', icon: <MessageSquare className="w-4 h-4 text-purple-600" /> },
        { label: 'Notifications Center', to: '/notifications', desc: 'Real-time alerts & status updates', icon: <Bell className="w-4 h-4 text-purple-600" /> },
        { label: 'Saved Favorites', to: '/saved', desc: 'Bookmarked services & talent', icon: <Bookmark className="w-4 h-4 text-purple-600" /> },
        { label: 'Account Settings', to: '/settings', desc: 'Profile, skills, and password', icon: <Settings className="w-4 h-4 text-purple-600" /> },
      ],
    },
    {
      title: 'Authentication',
      description: 'Access & account creation endpoints',
      color: 'border-slate-500/20 bg-slate-50/50',
      links: [
        { label: 'Sign In', to: '/login', desc: 'Log in with demo credentials', icon: <LogIn className="w-4 h-4 text-slate-700" /> },
        { label: 'Create Account', to: '/register', desc: 'Register client or freelancer', icon: <UserPlus className="w-4 h-4 text-slate-700" /> },
        { label: 'Forgot Password', to: '/forgot-password', desc: 'Password reset instructions', icon: <KeyRound className="w-4 h-4 text-slate-700" /> },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                All Pages & Section Directory
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">
                  Full Sitemap
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Direct navigation links to every page, role workspace, and platform section
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Grid of Sections */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 bg-white shadow-xs flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">{section.title}</h4>
                  {section.badge && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {section.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-3">{section.description}</p>

                <ul className="space-y-1.5">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.to}
                        onClick={onClose}
                        className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
                      >
                        <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-white shadow-2xs mt-0.5">
                          {link.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                            {link.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{link.desc}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            SkillForge Marketplace — Instant Page Navigator
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
