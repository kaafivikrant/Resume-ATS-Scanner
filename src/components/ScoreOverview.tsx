import React from 'react';

interface ScoreOverviewProps {
  score: number;
}

const ScoreOverview: React.FC<ScoreOverviewProps> = ({ score }) => {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreText = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getScoreDescription = () => {
    if (score >= 80) {
      return 'Your resume is well-optimized for ATS systems and matches the job description well.';
    }
    if (score >= 60) {
      return 'Your resume is reasonably optimized but has some areas that could be improved.';
    }
    return 'Your resume needs significant improvements to pass through ATS systems effectively.';
  };

  // Calculate the circumference of the circle
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the offset based on the score
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h2>
      
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          </svg>
          
          {/* Score text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getScoreColor()}`}>{score}</span>
            <span className="text-gray-500 text-sm">out of 100</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h3 className={`text-xl font-semibold ${getScoreColor()}`}>
            {getScoreText()}
          </h3>
          <p className="text-gray-600 mt-2">
            {getScoreDescription()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreOverview;