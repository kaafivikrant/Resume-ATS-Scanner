import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Resume } from '../types';
import { uploadResume } from '../api/resume';

interface ResumeUploadProps {
  onUpload: (resume: Resume) => void;
  currentResume: Resume | null;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, currentResume }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Actually upload the file
      const uploadedResume = await uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onUpload(uploadedResume);
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload resume');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeCurrentResume = () => {
    onUpload({
      id: '',
      name: '',
      content: '',
      file: null as unknown as File,
      uploadDate: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Resume</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {!currentResume?.id ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-gray-700 font-medium mb-2">
            {isDragging ? 'Drop your resume here' : 'Drag & drop your resume here'}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4">
            Supports PDF format only
          </p>
          
          <button
            onClick={triggerFileInput}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <File className="h-8 w-8 text-blue-600 mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{currentResume.name}</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{currentResume.name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(currentResume.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={removeCurrentResume}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-2">Resume History</h3>
        <p className="text-gray-500 text-sm">
          You haven't uploaded any previous versions of your resume.
        </p>
      </div>
    </div>
  );
};

export default ResumeUpload;