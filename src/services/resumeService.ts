import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadResume = async (userId: string, file: File) => {
  try {
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `resumes/${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume-files')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('resume-files')
      .getPublicUrl(filePath);

    // Extract text content (simplified for demo)
    // In a real app, you'd use a PDF parser library
    const content = "Extracted resume content would go here";

    // Create resume record
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        name: file.name,
        content,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save resume: ${error.message}`);
    }

    return {
      id: resume.id,
      name: resume.name,
      content: resume.content,
      uploadDate: resume.upload_date,
    };
  } catch (error) {
    throw error;
  }
};

export const getUserResumes = async (userId: string) => {
  try {
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('upload_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get resumes: ${error.message}`);
    }

    return resumes.map(resume => ({
      id: resume.id,
      name: resume.name,
      content: resume.content,
      uploadDate: resume.upload_date,
    }));
  } catch (error) {
    throw error;
  }
};

export const getResumeById = async (userId: string, resumeId: string) => {
  try {
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error("Resume not found");
    }

    return {
      id: resume.id,
      name: resume.name,
      content: resume.content,
      uploadDate: resume.upload_date,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteResume = async (userId: string, resumeId: string) => {
  try {
    // Get resume to get file path
    const { data: resume, error: getError } = await supabase
      .from('resumes')
      .select('file_path')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      throw new Error("Resume not found");
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('resume-files')
      .remove([resume.file_path]);

    if (storageError) {
      console.error(`Failed to delete file: ${storageError.message}`);
      // Continue with deleting the record even if file deletion fails
    }

    // Delete from database
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};