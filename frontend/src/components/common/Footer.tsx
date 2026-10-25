import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, HeartHandshake, Lock, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      {/* Trust & Safety Highlights Strip */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">Verified Talent</h5>
                <p className="text-xs text-slate-400">Vetted professionals with authentic client reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">Secure Escrow Protection</h5>
                <p className="text-xs text-slate-400">Funds released only after you approve completed work</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">24/7 Dedicated Support</h5>
                <p className="text-xs text-slate-400">Real-time dispute mediation and customer care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                SkillForge
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              The premier freelance services marketplace connecting world-class companies with vetted independent developers, designers, and creatives.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Globe className="w-4 h-4" />
              <span>Global Remote Marketplace</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/services?category=web-app-development" className="hover:text-white transition-colors">
                  Web & App Dev
                </Link>
              </li>
              <li>
                <Link to="/services?category=ui-ux-design" className="hover:text-white transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/services?category=ai-data-science" className="hover:text-white transition-colors">
                  AI & Data Science
                </Link>
              </li>
              <li>
                <Link to="/services?category=video-editing" className="hover:text-white transition-colors">
                  Video & Motion
                </Link>
              </li>
              <li>
                <Link to="/services?category=cloud-devops" className="hover:text-white transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              For Clients
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/freelancers" className="hover:text-white transition-colors">
                  Find Freelancers
                </Link>
              </li>
              <li>
                <Link to="/client/projects/new" className="hover:text-white transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/client/orders" className="hover:text-white transition-colors">
                  Active Client Orders
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#escrow" className="hover:text-white transition-colors">
                  Escrow Protection
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              For Freelancers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Explore Open Projects
                </Link>
              </li>
              <li>
                <Link to="/freelancer/services/new" className="hover:text-white transition-colors">
                  Publish a Service
                </Link>
              </li>
              <li>
                <Link to="/freelancer/orders" className="hover:text-white transition-colors">
                  My Orders & Delivery
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#freelancers" className="hover:text-white transition-colors">
                  Freelancer Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillForge Marketplace Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link to="/how-it-works#faq" className="hover:text-slate-400">Common Questions (FAQ)</Link>
            <Link to="/how-it-works#escrow" className="hover:text-slate-400">Escrow Security</Link>
            <Link to="/how-it-works" className="hover:text-slate-400">Platform Policies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
