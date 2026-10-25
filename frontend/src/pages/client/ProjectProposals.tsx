import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Award,
} from 'lucide-react';
import { proposalApi, chatApi } from '../../services/api';
import type { Project, Proposal, FreelancerProfile } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const ProjectProposals: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hiring modal state
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isHiring, setIsHiring] = useState(false);
  const [hireError, setHireError] = useState('');

  const fetchProposals = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await proposalApi.getProjectProposals(projectId);
      if (res.success && res.data) {
        setProject(res.data.project);
        setProposals(res.data.proposals || []);
      }
    } catch (err) {
      console.error('Failed to load project proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [projectId]);

  const handleStartChat = async (freelancerId: string) => {
    try {
      const res = await chatApi.getOrCreateConversation({
        recipientId: freelancerId,
        projectId,
      });
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id } });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleConfirmHire = async () => {
    if (!selectedProposal) return;
    setIsHiring(true);
    setHireError('');
    try {
      const res = await proposalApi.accept(selectedProposal._id);
      if (res.success && res.data) {
        setSelectedProposal(null);
        navigate(`/client/orders/${res.data.order._id}`);
      }
    } catch (err: any) {
      setHireError(err.response?.data?.message || 'Failed to hire freelancer.');
    } finally {
      setIsHiring(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading proposals..." />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Project Not Found</h3>
        <Link to="/client/projects" className="mt-4 inline-block">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Client Dashboard', to: '/client/dashboard' },
          { label: 'My Projects', to: '/client/projects' },
          { label: project.title },
          { label: 'Bids & Proposals' },
        ]}
      />

      {/* Project Summary Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-black text-slate-900 block">
              ${project.budgetMin} - ${project.budgetMax}
            </span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {project.budgetType} Budget
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-4">
          {project.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(project.skills || []).map((skill, i) => (
            <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Proposals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Candidate Proposals ({proposals.length})
          </h2>
          <span className="text-xs text-slate-500">
            Select one proposal to hire and fund escrow
          </span>
        </div>

        {proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">No Proposals Received Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your project is open on the marketplace. Verified freelancers will submit bids shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((prop) => {
              const profile = prop.freelancerProfile;
              const isAccepted = prop.status === 'accepted';
              const isRejected = prop.status === 'rejected';

              return (
                <div
                  key={prop._id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs transition-all ${
                    isAccepted
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200/90 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={
                          prop.freelancer?.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            prop.freelancer?.name || 'F'
                          )}`
                        }
                        alt={prop.freelancer?.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/freelancers/${prop.freelancer?._id}`}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {prop.freelancer?.name}
                          </Link>
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-50" />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {profile?.headline || 'Professional Specialist'}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                          <RatingStars
                            rating={profile?.ratingAvg || 5.0}
                            count={profile?.ratingCount || 0}
                            size="sm"
                          />
                          <span>&bull;</span>
                          <span>{profile?.completedOrdersCount || 0} jobs completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <div>
                        <span className="text-2xl font-black text-slate-900 block leading-tight">
                          ${prop.bidAmount}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          in {prop.deliveryTimeDays} days
                        </span>
                      </div>
                      <span
                        className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          prop.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.status === 'rejected'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  {/* Cover letter */}
                  <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">Proposal Pitch:</span>
                    {prop.coverLetter}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                      onClick={() => handleStartChat(prop.freelancer._id)}
                    >
                      Chat with Candidate
                    </Button>

                    {project.status === 'open' && prop.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedProposal(prop)}
                      >
                        Accept Bid & Hire
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hire Confirmation Modal */}
      <Modal
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        title="Confirm Freelancer Hire"
        description="Review proposal terms and fund the contract escrow"
      >
        {selectedProposal && (
          <div className="space-y-5">
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Candidate: {selectedProposal.freelancer?.name}
              </h4>
              <p className="text-xs text-slate-600">
                Bid Amount: <strong>${selectedProposal.bidAmount} USD</strong> &bull; Timeline: {selectedProposal.deliveryTimeDays} Days
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Atomic Escrow Guarantee</span>
              </div>
              <p className="leading-relaxed">
                By hiring <strong>{selectedProposal.freelancer?.name}</strong>, other pending proposals will be closed, an active Order will be generated, and <strong>${selectedProposal.bidAmount}</strong> will be held in simulated escrow until you approve the delivered work.
              </p>
            </div>

            {hireError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hireError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedProposal(null)}
                disabled={isHiring}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmHire}
                isLoading={isHiring}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm Hire & Start Order
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
