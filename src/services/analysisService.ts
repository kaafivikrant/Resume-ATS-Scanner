import { supabase } from '../lib/supabase';

export const analyzeResume = async (userId: string, resumeId: string, jobDescId: string) => {
  try {
    // Get resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('content')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeError || !resume) {
      throw new Error("Resume not found");
    }

    // Get job description
    const { data: jobDesc, error: jobDescError } = await supabase
      .from('job_descriptions')
      .select('content')
      .eq('id', jobDescId)
      .eq('user_id', userId)
      .single();

    if (jobDescError || !jobDesc) {
      throw new Error("Job description not found");
    }

    // Perform analysis (simplified for demo)
    // In a real app, this would be a complex algorithm or AI service
    const analysisResult = performAnalysis(resume.content, jobDesc.content);

    // Save analysis result
    const { data: result, error } = await supabase
      .from('analysis_results')
      .insert({
        overall_score: analysisResult.overallScore,
        categories: analysisResult.categories,
        recommendations: analysisResult.recommendations,
        resume_id: resumeId,
        job_description_id: jobDescId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save analysis result: ${error.message}`);
    }

    return {
      id: result.id,
      resumeId: result.resume_id,
      jobDescId: result.job_description_id,
      timestamp: result.timestamp,
      overallScore: result.overall_score,
      categories: result.categories,
      recommendations: result.recommendations,
    };
  } catch (error) {
    throw error;
  }
};

export const getAnalysisHistory = async (userId: string) => {
  try {
    const { data: results, error } = await supabase
      .from('analysis_results')
      .select(`
        *,
        resumes:resume_id (name),
        job_descriptions:job_description_id (title)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Failed to get analysis history: ${error.message}`);
    }

    return results.map(result => ({
      id: result.id,
      resumeId: result.resume_id,
      resumeName: result.resumes.name,
      jobDescriptionId: result.job_description_id,
      jobTitle: result.job_descriptions.title,
      timestamp: result.timestamp,
      overallScore: result.overall_score,
    }));
  } catch (error) {
    throw error;
  }
};

export const getAnalysisById = async (userId: string, analysisId: string) => {
  try {
    const { data: result, error } = await supabase
      .from('analysis_results')
      .select(`
        *,
        resumes:resume_id (name),
        job_descriptions:job_description_id (title)
      `)
      .eq('id', analysisId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error("Analysis result not found");
    }

    return {
      id: result.id,
      resumeId: result.resume_id,
      resumeName: result.resumes.name,
      jobDescriptionId: result.job_description_id,
      jobTitle: result.job_descriptions.title,
      timestamp: result.timestamp,
      overallScore: result.overall_score,
      categories: result.categories,
      recommendations: result.recommendations,
    };
  } catch (error) {
    throw error;
  }
};

// Helper function to perform resume analysis
const performAnalysis = (resumeContent: string, jobDescContent: string) => {
  // This is a simplified mock implementation
  // In a real app, this would be a sophisticated algorithm or AI service
  
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescContent);
  
  // Extract keywords from resume
  const resumeKeywords = extractKeywords(resumeContent);
  
  // Find matching and missing keywords
  const matches = jobKeywords.filter(keyword => 
    resumeKeywords.some(rk => rk.toLowerCase() === keyword.toLowerCase())
  );
  
  const missing = jobKeywords.filter(keyword => 
    !resumeKeywords.some(rk => rk.toLowerCase() === keyword.toLowerCase())
  );
  
  // Calculate keyword match score
  const keywordMatchScore = Math.min(100, Math.round((matches.length / (matches.length + missing.length)) * 100));
  
  // Find overused words
  const overusedWords = findOverusedWords(resumeContent);
  
  // Calculate repetition score
  const repetitionScore = Math.min(100, Math.max(60, 100 - (overusedWords.length * 5)));
  
  // Calculate overall score (weighted average of different scores)
  const overallScore = Math.round(
    (keywordMatchScore * 0.4) + 
    (repetitionScore * 0.2) + 
    (Math.random() * 20 + 60) * 0.4 // Other random scores for demo
  );
  
  // Generate recommendations
  const recommendations = generateRecommendations(matches, missing, overusedWords);
  
  return {
    overallScore,
    categories: {
      keywordMatch: {
        score: keywordMatchScore,
        matches,
        missing,
      },
      repetition: {
        score: repetitionScore,
        overusedWords,
      },
      jobFit: {
        score: Math.floor(Math.random() * 40) + 60,
        feedback: 'Your resume shows good alignment with the job requirements, but could be improved by highlighting more specific achievements.',
      },
      fillerWords: {
        score: Math.floor(Math.random() * 40) + 60,
        words: ['very', 'successfully', 'effectively', 'various'],
      },
      growthSignals: {
        score: Math.floor(Math.random() * 40) + 60,
        feedback: 'Consider adding more quantifiable achievements to demonstrate career progression.',
      },
      spelling: {
        score: Math.floor(Math.random() * 40) + 60,
        errors: ['recieved', 'accomodate', 'occassionally'],
      },
      buzzwords: {
        score: Math.floor(Math.random() * 40) + 60,
        appropriate: ['full-stack', 'agile', 'microservices'],
        excessive: ['synergy', 'disruptive', 'cutting-edge'],
      },
      unnecessarySections: {
        score: Math.floor(Math.random() * 40) + 60,
        sections: ['Objective', 'References'],
      },
    },
    recommendations,
  };
};

// Helper function to extract keywords from text
const extractKeywords = (text: string): string[] => {
  // This is a simplified implementation
  // In a real app, you'd use NLP or ML techniques
  
  const commonWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
    'of', 'by', 'from', 'as', 'if', 'then', 'than', 'so', 'that', 'this', 'these',
    'those', 'it', 'its', 'we', 'us', 'our', 'they', 'them', 'their'
  ]);
  
  // Split text into words, remove punctuation, and filter out common words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  // Count word frequencies
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  // Sort by frequency and take top keywords
  const sortedWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top keywords (limited to 20 for demo)
  return sortedWords.slice(0, 20);
};

// Helper function to find overused words
const findOverusedWords = (text: string): string[] => {
  // This is a simplified implementation
  // In a real app, you'd use more sophisticated analysis
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count word frequencies
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  // Find words that appear too frequently
  const overusedWords = [...wordCounts.entries()]
    .filter(([word, count]) => count > 3 && ['developed', 'implemented', 'managed', 'responsible'].includes(word))
    .map(entry => entry[0]);
  
  return overusedWords;
};

// Helper function to generate recommendations
const generateRecommendations = (matches: string[], missing: string[], overusedWords: string[]): string[] => {
  const recommendations: string[] = [];
  
  if (missing.length > 0) {
    recommendations.push('Add more keywords from the job description');
  }
  
  if (overusedWords.length > 0) {
    recommendations.push('Vary your action verbs to avoid repetition');
  }
  
  // Add some standard recommendations
  recommendations.push('Quantify your achievements with metrics');
  recommendations.push('Remove filler words to make your resume more concise');
  recommendations.push('Focus more on relevant skills and experience');
  
  return recommendations;
};