import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';

const SubscriptionBanner: React.FC = () => {
  const { currentPlan, plans } = useSubscriptionStore();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated || currentPlan !== 'free') {
    return null;
  }

  const proPlan = plans.find(plan => plan.id === 'pro');
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-4">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
            <p className="text-white/80 text-sm">
              Get unlimited resume uploads, AI-powered rewrites, and more for just ${proPlan?.price}/month
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 whitespace-nowrap"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionBanner;