import React, { useState } from 'react';
import { BarChart3, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { AnalysisResult, ScoreCategory } from '../types';
import ScoreOverview from './ScoreOverview';
import CategoryDetail from './CategoryDetail';
import RecommendationsList from './RecommendationsList';
import { generatePDF } from '../utils/pdfGenerator';

interface DashboardProps {
  analysisResults: AnalysisResult | null;
}

const Dashboard: React.FC<DashboardProps> = ({ analysisResults }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!analysisResults) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Results</h2>
        <p className="text-gray-600 mb-4">
          Please upload a resume and job description to analyze.
        </p>
      </div>
    );
  }

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(analysisResults);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  const scoreCategories: ScoreCategory[] = [
    {
      name: 'Keyword Match',
      score: analysisResults.categories.keywordMatch.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Job Fit',
      score: analysisResults.categories.jobFit.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Growth Signals',
      score: analysisResults.categories.growthSignals.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Repetition',
      score: analysisResults.categories.repetition.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Filler Words',
      score: analysisResults.categories.fillerWords.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Spelling',
      score: analysisResults.categories.spelling.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Buzzwords',
      score: analysisResults.categories.buzzwords.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Unnecessary Sections',
      score: analysisResults.categories.unnecessarySections.score,
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <ScoreOverview score={analysisResults.overallScore} />
        
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              onClick={handleDownloadReport}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </>
              )}
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg border border-gray-300 transition duration-200 flex items-center justify-center">
              <span>Save to History</span>
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg border border-gray-300 transition duration-200 flex items-center justify-center">
              <span>Try Magic Write</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Scores</h2>
          
          <div className="space-y-4">
            {scoreCategories.map((category) => (
              <div key={category.name} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      category.score >= 80 ? 'bg-green-100 text-green-600' :
                      category.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {category.icon}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      {category.score >= 80 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                      ) : category.score >= 60 ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-1" />
                      )}
                      <span className="font-semibold">{category.score}</span>
                    </div>
                    
                    {expandedCategory === category.name ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedCategory === category.name && (
                  <CategoryDetail category={category.name} analysisResults={analysisResults} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <RecommendationsList recommendations={analysisResults.recommendations} />
      </div>
     </div>
  );
};

export default Dashboard;