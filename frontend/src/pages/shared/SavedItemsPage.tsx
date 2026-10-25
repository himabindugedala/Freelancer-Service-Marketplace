import React, { useState, useEffect } from 'react';
import { Bookmark, Star } from 'lucide-react';
import { savedItemApi } from '../../services/api';
import { ServiceCard } from '../../components/common/ServiceCard';
import { FreelancerCard } from '../../components/common/FreelancerCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const SavedItemsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    savedItemApi
      .getAll()
      .then((res) => {
        if (res.success) setItems(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading saved favorites..." />;
  }

  const savedServices = items.filter((i) => i.itemType === 'service' && i.service);
  const savedFreelancers = items.filter((i) => i.itemType === 'freelancer' && i.freelancer);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Saved Favorites & Bookmarks
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quickly access your saved services and preferred freelancers.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No favorites saved"
          description="Bookmark services or freelancers while browsing to keep them organized here."
          actionText="Explore Marketplace"
          onAction={() => window.location.assign('/services')}
        />
      ) : (
        <div className="space-y-8">
          {savedServices.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Saved Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {savedServices.map((item) => (
                  <ServiceCard key={item._id} service={item.service} initialSaved={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
