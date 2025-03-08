import React, { useEffect } from 'react';
import PricingPlans from '../components/subscription/PricingPlans';
import useSubscriptionStore from '../store/subscriptionStore';

const PricingPage: React.FC = () => {
  const { fetchCurrentPlan } = useSubscriptionStore();
  
  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Plans for every stage of your career
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Choose the plan that's right for you and start optimizing your resume today
            </p>
          </div>
          
          <PricingPlans />
          
          <div className="mt-10 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Need a custom solution for your team?
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Contact us for enterprise pricing and custom features
            </p>
            <a
              href="mailto:enterprise@resumeatsscanner.com"
              className="mt-4 inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Contact Sales
            </a>
          </div>
          
          <div className="mt-20 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Can I cancel my subscription at any time?</h3>
                <p className="mt-2 text-base text-gray-500">
                  Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">What payment methods do you accept?</h3>
                <p className="mt-2 text-base text-gray-500">
                  We accept all major credit cards, including Visa, Mastercard, American Express, and Discover.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Is there a free trial?</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our Free plan allows you to try out the basic features of our service. You can upgrade to a paid plan at any time to access more features.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Can I change my plan later?</h3>
                <p className="mt-2 text-base text-gray-500">
                  Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new features will be available immediately. If you downgrade, the change will take effect at the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;