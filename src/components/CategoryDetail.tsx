import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface CategoryDetailProps {
  category: string;
  analysisResults: AnalysisResult;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ category, analysisResults }) => {
  const renderCategoryContent = () => {
    switch (category) {
      case 'Keyword Match':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Keywords are important terms from the job description that ATS systems look for in your resume.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Matching Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.keywordMatch.matches.map((keyword) => (
                  <span key={keyword} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.keywordMatch.missing.map((keyword) => (
                  <span key={keyword} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Try to incorporate more of the missing keywords into your resume where relevant.
              </p>
            </div>
          </div>
        );
        
      case 'Repetition':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Repetition refers to words or phrases that are used too frequently in your resume.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Overused Words</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.repetition.overusedWords.map((word) => (
                  <span key={word} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Use a variety of action verbs and descriptive terms to make your resume more engaging.
              </p>
            </div>
          </div>
        );
        
      case 'Job Fit':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Job fit measures how well your resume aligns with the specific requirements of the job.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
              <p className="text-gray-700">
                {analysisResults.categories.jobFit.feedback}
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Tailor your resume to highlight experiences and skills that directly relate to the job requirements.
              </p>
            </div>
          </div>
        );
        
      case 'Filler Words':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Filler words are unnecessary terms that don't add value to your resume.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detected Filler Words</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.fillerWords.words.map((word) => (
                  <span key={word} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Remove filler words to make your resume more concise and impactful.
              </p>
            </div>
          </div>
        );
        
      case 'Growth Signals':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Growth signals are indicators of career progression and professional development.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
              <p className="text-gray-700">
                {analysisResults.categories.growthSignals.feedback}
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Include metrics and achievements that demonstrate your impact and growth in previous roles.
              </p>
            </div>
          </div>
        );
        
      case 'Spelling':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Spelling errors can make your resume appear unprofessional and may cause ATS systems to misinterpret your content.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detected Errors</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.spelling.errors.map((error) => (
                  <span key={error} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    {error}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Proofread your resume carefully or use a spell-checking tool to eliminate spelling errors.
              </p>
            </div>
          </div>
        );
        
      case 'Buzzwords':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Buzzwords are industry-specific terms that can enhance or detract from your resume depending on usage.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Appropriate Buzzwords</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.buzzwords.appropriate.map((word) => (
                  <span key={word} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Excessive Buzzwords</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.buzzwords.excessive.map((word) => (
                  <span key={word} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Use industry-specific terms strategically, but avoid overusing generic buzzwords.
              </p>
            </div>
          </div>
        );
        
      case 'Unnecessary Sections':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Unnecessary sections are parts of your resume that don't add value or may distract from your qualifications.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sections to Consider Removing</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.categories.unnecessarySections.sections.map((section) => (
                  <span key={section} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {section}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-blue-700 text-sm">
                Focus on sections that highlight your relevant skills and experience for the specific job.
              </p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-4">
            <p className="text-gray-600">
              Detailed information for this category is not available.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t">
      {renderCategoryContent()}
    </div>
  );
};

export default CategoryDetail;