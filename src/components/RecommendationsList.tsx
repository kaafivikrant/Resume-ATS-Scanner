import React from 'react';
import { Lightbulb } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: string[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
      
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 p-1 rounded-full">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700">{recommendation}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center">
          <span>Get AI-Powered Rewrite Suggestions</span>
        </button>
      </div>
    </div>
  );
};

export default RecommendationsList;