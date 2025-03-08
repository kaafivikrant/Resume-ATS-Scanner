import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';
import useAuthStore from '../store/authStore';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const SubscriptionPage: React.FC = () => {
  const { currentPlan, plans, fetchCurrentPlan, cancelPlan, isLoading } = useSubscriptionStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);

  const currentPlanDetails = plans.find(plan => plan.id === currentPlan);

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
        await cancelPlan();
        alert('Your subscription has been canceled. You will have access to premium features until the end of your billing period.');
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
        alert('Failed to cancel subscription. Please try again later.');
      }
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
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
              <div className="mt-4 flex items-center">
                <span className="text-2xl font-bold text-gray-900 mr-2">
                  {currentPlanDetails?.name || 'Free'}
                </span>
                {currentPlan === 'pro' && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
                {currentPlan === 'enterprise' && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                    ENTERPRISE
                  </span>
                )}
              </div>
              
              {currentPlan !== 'free' ? (
                <div className="mt-2 text-gray-600">
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Next billing date: <span className="font-medium ml-1">July 15, 2025</span>
                  </p>
                  <p className="mt-1">
                    ${currentPlanDetails?.price}/month
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-600">
                  You are currently on the free plan with limited features.
                </p>
              )}
              
              <div className="mt-6 space-y-4">
                {currentPlan === 'free' ? (
                  <Link
                    to="/pricing"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upgrade Plan
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Plan
                    </Link>
                    <button
                      onClick={handleCancelSubscription}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Plan Features</h2>
          
          <div className="space-y-4">
            {currentPlanDetails?.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          {currentPlan === 'free' && (
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Upgrade to unlock more features</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Get unlimited resume uploads, AI-powered rewrite suggestions, and more with our Pro plan.
                  </p>
                  <Link
                    to="/pricing"
                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>
          
          {currentPlan !== 'free' ? (
            <div className="border-t border-gray-200 divide-y divide-gray-200">
              <div className="py-4 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">June 15, 2025</p>
                  <p className="text-sm text-gray-500">
                    {currentPlanDetails?.name} Plan - Monthly
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${currentPlanDetails?.price}</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
              <div className="py-4 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">May 15, 2025</p>
                  <p className="text-sm text-gray-500">
                    {currentPlanDetails?.name} Plan - Monthly
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${currentPlanDetails?.price}</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No billing history available for free plan.
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SubscriptionPage;