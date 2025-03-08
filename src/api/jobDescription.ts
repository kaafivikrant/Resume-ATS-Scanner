import { supabase } from '../lib/supabase';
import { JobDesc } from '../types';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { convert } from 'html-to-text';

const COMMON_JOB_SELECTORS = [
  // LinkedIn
  '.show-more-less-html__markup',
  '[data-test-id="job-details"]',
  // Indeed
  '#jobDescriptionText',
  '.jobsearch-jobDescriptionText',
  // Glassdoor
  '.desc',
  '.jobDescriptionContent',
  // General
  '[data-test="job-description"]',
  '.job-description',
  '.description',
  '#job-description',
  '.posting-requirements',
  '.job-details',
  'article',
  '.main-content'
];

const COMPANY_SELECTORS = [
  // LinkedIn
  '.company-name',
  '[data-test-id="company-name"]',
  // Indeed
  '.company-name',
  '.companyName',
  // Glassdoor
  '.employer-name',
  '.company-name',
  // General
  '[data-test="company-name"]',
  '.company',
  '.organization-name'
];

const TITLE_SELECTORS = [
  // LinkedIn
  '.job-title',
  '[data-test-id="job-title"]',
  // Indeed
  '.jobsearch-JobInfoHeader-title',
  '.job-title',
  // Glassdoor
  '.job-title',
  // General
  'h1',
  '[data-test="job-title"]',
  '.position-title',
  '.role-title'
];

export const saveJobDescription = async (jobDesc: Omit<JobDesc, 'id' | 'saveDate'>): Promise<JobDesc> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data: jobDescription, error } = await supabase
      .from('job_descriptions')
      .insert({
        title: jobDesc.title,
        company: jobDesc.company || null,
        content: jobDesc.content,
        source: jobDesc.source,
        url: jobDesc.url || null,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to save job description: ${error.message}`);
    
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

export const getJobDescriptions = async (): Promise<JobDesc[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data: jobDescriptions, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('save_date', { ascending: false });
    
    if (error) throw new Error(`Failed to get job descriptions: ${error.message}`);
    
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

export const getJobDescriptionById = async (id: string): Promise<JobDesc> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data: jobDesc, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) throw new Error("Job description not found");
    
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

export const deleteJobDescription = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw new Error(`Failed to delete job description: ${error.message}`);
  } catch (error) {
    throw error;
  }
};

export const fetchFromUrl = async (url: string): Promise<{ content: string; title?: string; company?: string }> => {
  try {
    // Add headers to mimic a browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.google.com/'
    };

    const response = await axios.get(url, { headers });
    const html = response.data;
    
    // Parse the HTML
    const root = parse(html);
    
    // Try to find job description content using various selectors
    let content = '';
    let title = '';
    let company = '';
    
    // Find job description
    for (const selector of COMMON_JOB_SELECTORS) {
      const element = root.querySelector(selector);
      if (element) {
        content = element.textContent || '';
        break;
      }
    }
    
    // Find job title
    for (const selector of TITLE_SELECTORS) {
      const element = root.querySelector(selector);
      if (element) {
        title = element.textContent || '';
        break;
      }
    }
    
    // Find company name
    for (const selector of COMPANY_SELECTORS) {
      const element = root.querySelector(selector);
      if (element) {
        company = element.textContent || '';
        break;
      }
    }
    
    // If no content found using selectors, try to get main content
    if (!content) {
      const mainContent = root.querySelector('main') || root.querySelector('article') || root.querySelector('body');
      if (mainContent) {
        content = convert(mainContent.innerHTML, {
          wordwrap: 130,
          preserveNewlines: true,
          selectors: [
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'img', format: 'skip' }
          ]
        });
      }
    }
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    title = title.replace(/\s+/g, ' ').trim();
    company = company.replace(/\s+/g, ' ').trim();
    
    if (!content) {
      throw new Error('Could not extract job description from the provided URL');
    }
    
    return { 
      content,
      title: title || undefined,
      company: company || undefined
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch job description: ${error.message}`);
    }
    throw new Error('Failed to fetch job description from URL');
  }
};