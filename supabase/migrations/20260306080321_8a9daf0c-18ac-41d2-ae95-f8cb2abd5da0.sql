
-- Create enum for industry types
CREATE TYPE public.visitor_industry AS ENUM (
  'academe',
  'government',
  'private_sector',
  'msme',
  'marginalized'
);

-- Create enum for purpose of visit
CREATE TYPE public.visit_purpose AS ENUM (
  'training',
  'coworking',
  'conference_room'
);

-- Create enum for marginalized sub-types
CREATE TYPE public.marginalized_type AS ENUM (
  'pwd',
  'unemployed',
  'senior'
);

-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  gender TEXT NOT NULL,
  industry visitor_industry NOT NULL,
  industry_detail TEXT,
  industry_location TEXT,
  marginalized_type marginalized_type,
  purpose visit_purpose NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time TIME WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for one entry per person per day
CREATE UNIQUE INDEX idx_visitors_unique_daily ON public.visitors (full_name, visit_date);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Public insert policy (visitors can submit forms without auth)
CREATE POLICY "Anyone can submit visitor form"
  ON public.visitors FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can read
CREATE POLICY "Authenticated users can read visitors"
  ON public.visitors FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
