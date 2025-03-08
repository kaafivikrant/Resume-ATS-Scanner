/*
  # Initial Schema Setup

  1. New Tables
    - `users` - Stores user account information
    - `resumes` - Stores user uploaded resumes
    - `job_descriptions` - Stores job descriptions
    - `analysis_results` - Stores resume analysis results
    - `subscription_plans` - Stores available subscription plans
    - `subscriptions` - Stores user subscriptions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create job_descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  content TEXT NOT NULL,
  source VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  save_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_score INTEGER NOT NULL,
  categories JSONB NOT NULL,
  recommendations TEXT[] NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_description_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features TEXT[] NOT NULL,
  limits JSONB NOT NULL,
  stripe_price_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT false,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for resumes table
CREATE POLICY "Users can view their own resumes" 
  ON resumes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" 
  ON resumes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
  ON resumes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
  ON resumes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for job_descriptions table
CREATE POLICY "Users can view their own job descriptions" 
  ON job_descriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job descriptions" 
  ON job_descriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job descriptions" 
  ON job_descriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job descriptions" 
  ON job_descriptions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for analysis_results table
CREATE POLICY "Users can view their own analysis results" 
  ON analysis_results FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis results" 
  ON analysis_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis results" 
  ON analysis_results FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis results" 
  ON analysis_results FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for subscription_plans table
CREATE POLICY "Anyone can view subscription plans" 
  ON subscription_plans FOR SELECT 
  USING (true);

-- Create policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
  ON subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_id, name, price, features, limits)
VALUES 
  ('free', 'Free', 0, 
    ARRAY['Basic resume analysis', '3 resume uploads', '3 job descriptions', 'Basic keyword matching', '7-day analysis history'],
    '{"resumeUploads": 3, "savedJobDescriptions": 3, "analysisHistory": 5, "aiRewrites": false}'
  ),
  ('pro', 'Pro', 9.99, 
    ARRAY['Advanced resume analysis', 'Unlimited resume uploads', 'Unlimited job descriptions', 'Advanced keyword matching', 'Detailed section analysis', '30-day analysis history', 'AI-powered rewrite suggestions'],
    '{"resumeUploads": 9999, "savedJobDescriptions": 9999, "analysisHistory": 30, "aiRewrites": true}'
  ),
  ('enterprise', 'Enterprise', 29.99, 
    ARRAY['Everything in Pro', 'Team management', 'Bulk analysis', 'API access', 'Priority support', 'Custom branding', 'Unlimited analysis history'],
    '{"resumeUploads": 9999, "savedJobDescriptions": 9999, "analysisHistory": 9999, "aiRewrites": true}'
  );