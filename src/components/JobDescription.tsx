import React, { useState } from 'react';
import { Briefcase, Link as LinkIcon, X } from 'lucide-react';
import { JobDesc } from '../types';
import { fetchFromUrl } from '../api/jobDescription';

interface JobDescriptionProps {
  onSave: (jobDesc: JobDesc) => void;
  currentJobDesc: JobDesc | null;
}

const JobDescription: React.FC<JobDescriptionProps> = ({
  onSave,
  currentJobDesc,
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [inputMethod, setInputMethod] = useState<'manual' | 'url'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!title || (inputMethod === 'manual' && !content) || (inputMethod === 'url' && !url)) {
      setError('Please fill in all required fields');
      return;
    }

    const newJobDesc: JobDesc = {
      id: `job-${Date.now()}`,
      title,
      company,
      content: inputMethod === 'manual' ? content : content || `Content from URL: ${url}`,
      source: inputMethod,
      url: inputMethod === 'url' ? url : undefined,
      saveDate: new Date().toISOString(),
    };

    onSave(newJobDesc);
    resetForm();
  };

  const handleFetchFromUrl = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { content: fetchedContent, title: fetchedTitle, company: fetchedCompany } = await fetchFromUrl(url);
      
      if (fetchedContent) {
        setContent(fetchedContent);
        if (fetchedTitle && !title) setTitle(fetchedTitle);
        if (fetchedCompany && !company) setCompany(fetchedCompany);
      } else {
        setError('No job description content found at this URL');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch job description');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setContent('');
    setUrl('');
    setError(null);
  };

  const removeCurrentJobDesc = () => {
    onSave({
      id: '',
      title: '',
      content: '',
      source: 'manual',
      saveDate: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {!currentJobDesc?.id ? (
        <div>
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                  inputMethod === 'manual'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setInputMethod('manual')}
              >
                Manual Input
              </button>
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                  inputMethod === 'url'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setInputMethod('url')}
              >
                Import from URL
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Job Title*
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Acme Inc."
                />
              </div>

              {inputMethod === 'manual' ? (
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Description*
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the job description here..."
                  ></textarea>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Posting URL*
                  </label>
                  <div className="flex">
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/job-posting"
                    />
                    <button
                      onClick={handleFetchFromUrl}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition duration-200 flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Fetching...
                        </>
                      ) : (
                        'Fetch'
                      )}
                    </button>
                  </div>
                  {content && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fetched Content
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50 text-sm text-gray-700 max-h-40 overflow-y-auto">
                        {content.split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Save Job Description
          </button>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{currentJobDesc.title}</h3>
                {currentJobDesc.company && (
                  <p className="text-sm text-gray-500">{currentJobDesc.company}</p>
                )}
                {currentJobDesc.source === 'url' && currentJobDesc.url && (
                  <div className="flex items-center text-sm text-blue-600 mt-1">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    <a
                      href={currentJobDesc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate"
                    >
                      {currentJobDesc.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={removeCurrentJobDesc}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-2">Saved Job Descriptions</h3>
        <p className="text-gray-500 text-sm">
          You haven't saved any previous job descriptions.
        </p>
      </div>
    </div>
  );
};

export default JobDescription;