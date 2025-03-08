import { supabase } from '../lib/supabase';
import axios from "axios";
import { JSDOM } from "jsdom";

export const saveJobDescription = async (userId: string, jobDescData: { title: string; company?: string; content: string; source: string; url?: string }) => {
  try {
    const { data: jobDescription, error } = await supabase
      .from('job_descriptions')
      .insert({
        title: jobDescData.title,
        company: jobDescData.company || null,
        content: jobDescData.content,
        source: jobDescData.source,
        url: jobDescData.url || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save job description: ${error.message}`);
    }

    return {
      id: jobDescription.id,
      title: jobDescription.title,
      company: jobDescription.company,
      content: jobDescription.content,
      source: jobDescription.source,
      url: jobDescription.url,
      saveDate: jobDescription.save_date,
    };
  } catch (error) {
    throw error;
  }
};

export const getJobDescriptions = async (userId: string) => {
  try {
    const { data: jobDescriptions, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('save_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get job descriptions: ${error.message}`);
    }

    return jobDescriptions.map(jobDesc => ({
      id: jobDesc.id,
      title: jobDesc.title,
      company: jobDesc.company,
      content: jobDesc.content,
      source: jobDesc.source,
      url: jobDesc.url,
      saveDate: jobDesc.save_date,
    }));
  } catch (error) {
    throw error;
  }
};

export const getJobDescriptionById = async (userId: string, jobDescId: string) => {
  try {
    const { data: jobDesc, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', jobDescId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error("Job description not found");
    }

    return {
      id: jobDesc.id,
      title: jobDesc.title,
      company: jobDesc.company,
      content: jobDesc.content,
      source: jobDesc.source,
      url: jobDesc.url,
      saveDate: jobDesc.save_date,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteJobDescription = async (userId: string, jobDescId: string) => {
  try {
    const { error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', jobDescId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete job description: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const fetchFromUrl = async (url: string) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Use JSDOM to parse HTML and extract job description
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // This is a simplified example - in a real app, you'd need more sophisticated scraping
    // based on the structure of the job posting sites you want to support
    let content = '';
    
    // Try to find job description content
    // This is just an example - real implementation would be more robust
    const jobDescriptionElement = document.querySelector('.job-description') || 
                                 document.querySelector('[data-testid="jobDescriptionText"]') ||
                                 document.querySelector('.description');
    
    if (jobDescriptionElement) {
      content = jobDescriptionElement.textContent || '';
    } else {
      // Fallback: get all text from the body
      content = document.body.textContent || '';
    }
    
    // Clean up the content
    content = content.trim();
    
    return { content };
  } catch (error) {
    throw new Error(`Failed to fetch job description from URL: ${error.message}`);
  }
};