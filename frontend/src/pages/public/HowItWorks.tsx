import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Zap,
  Users,
  CheckCircle2,
  FileCheck,
  DollarSign,
  Award,
  HelpCircle,
  ArrowRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'How It Works' }]} />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
          Platform Architecture & Standards
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          How SkillForge Works
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed">
          From first pitch to final payout, SkillForge provides an intuitive, trustworthy, and milestone-guaranteed environment for businesses and independent professionals.
        </p>

        {/* Section Navigation Jump Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs font-semibold">
          <a
            href="#clients"
            className="px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
          >
            Hiring Clients
          </a>
          <a
            href="#freelancers"
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
          >
            Freelancers
          </a>
          <a
            href="#escrow"
            className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Escrow Security
          </a>
          <a
            href="#faq"
            className="px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
          >
            Common Questions
          </a>
        </div>
      </div>

      {/* For Clients & For Freelancers Dual Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Workflow */}
        <div
          id="clients"
          className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6 scroll-mt-28"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
            <span>CLIENT JOURNEY</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">For Hiring Clients</h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Post a Project or Choose a Service</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit your scope of work, budget, and required skills. Our rule-based smart matching engine will immediately recommend top-compatible freelancers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Compare Proposals & Hire Securely</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluate custom bids, portfolios, and proposed delivery schedules. Accept the best proposal to atomically generate an order with simulated escrow deposit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Review Delivery & Release Payment</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inspect the delivered assets. Request revisions if needed or approve completion. Payment is released to the freelancer only upon your approval.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <Link to="/client/projects/new" className="flex-1">
              <Button variant="primary" className="w-full">
                Post a Project
              </Button>
            </Link>
            <Link to="/services" className="flex-1">
              <Button variant="outline" className="w-full">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>

        {/* Freelancer Workflow */}
        <div
          id="freelancers"
          className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6 scroll-mt-28"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
            <span>FREELANCER JOURNEY</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">For Freelancers</h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Build Profile & Publish Services</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Set up your hourly rate, portfolio showcases, and technical skill tags. Publish fixed-price services so clients can order your expertise directly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Discover Projects & Pitch Proposals</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browse open client projects filtered by category, budget, and skills. Submit compelling proposals outlining your approach and delivery timeline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Deliver Quality Work & Get Paid</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Collaborate via real-time messaging, upload completed files, and upon client approval, funds are credited directly to your earnings balance.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <Link to="/register" className="flex-1">
              <Button variant="secondary" className="w-full">
                Join as Freelancer
              </Button>
            </Link>
            <Link to="/projects" className="flex-1">
              <Button variant="outline" className="w-full">
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Escrow & Trust Section */}
      <div
        id="escrow"
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 scroll-mt-28"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 flex-shrink-0">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>ESCROW STATE MACHINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black mb-2">Simulated Escrow Payment Security</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            In our marketplace environment, client funds are held securely in a simulated escrow vault from the moment an order starts. Freelancers work with full confidence knowing funds are guaranteed, while clients retain total control over final approval.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-0.5">1. In Progress</span>
              <span>Funds locked in escrow upon order creation.</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-0.5">2. Delivered</span>
              <span>Client inspects work or requests revisions.</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="font-bold text-emerald-400 block mb-0.5">3. Completed</span>
              <span>Funds released directly to freelancer wallet.</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6 scroll-mt-28">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Essential information on orders, accounts, and policies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1.5">How does smart freelancer matching work?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a client posts a project, our matching engine scores candidate profiles based on skill overlap (50pts), budget alignment (20pts), rating & reviews (20pts), and availability status (10pts).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1.5">Can I test with pre-seeded demo accounts?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes! The application comes with pre-seeded Admin, Client, and Freelancer accounts. Use the quick-fill buttons on the login screen to test all roles instantly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1.5">What happens if a revision is requested?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The order transitions to `revision_requested`. The freelancer is notified with the client's revision notes, applies updates, and re-delivers the work for final approval.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1.5">Are order cancellations refunded?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an order is cancelled prior to completion approval, funds held in simulated escrow are automatically returned to the client's wallet balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
