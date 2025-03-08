import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const PricingPlans: React.FC = () => {
  const { plans, currentPlan, isLoading, fetchPlans, createCheckout } = useSubscriptionStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=pricing');
      return;
    }

    if (planId === 'free') {
      // Handle free plan selection
      navigate('/dashboard');
      return;
    }

    try {
      const checkoutUrl = await createCheckout(planId as any);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose the Right Plan for You
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Optimize your resume with our powerful ATS scanner and get hired faster
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-lg shadow-sm divide-y divide-gray-200 ${
                currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">
                  {plan.id === 'free' ? 'Get started with basic features' : 
                   plan.id === 'pro' ? 'Perfect for job seekers' : 
                   'For teams and professionals'}
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-base font-medium text-gray-500">/mo</span>}
                </p>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={currentPlan === plan.id}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    currentPlan === plan.id
                      ? 'bg-gray-100 text-gray-800 cursor-default'
                      : plan.id === 'free'
                      ? 'bg-gray-800 text-white hover:bg-gray-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {currentPlan === plan.id
                    ? 'Current Plan'
                    : plan.id === 'free'
                    ? 'Get Started'
                    : 'Upgrade'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;