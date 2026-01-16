-- Migration: Finalize profiles schema synchronization
-- Description: Ensures all necessary columns exist for the intake system.
-- Run this in your Supabase SQL Editor if you encounter "column not found" errors.

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS ssn VARCHAR(15),
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS mailing_address TEXT,
  ADD COLUMN IF NOT EXISTS residency_state VARCHAR(50),
  ADD COLUMN IF NOT EXISTS dl_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50) DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS spouse_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dependents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_responses JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS business_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state_inc VARCHAR(50),
  ADD COLUMN IF NOT EXISTS municipality_inc VARCHAR(100),
  ADD COLUMN IF NOT EXISTS date_inc DATE,
  ADD COLUMN IF NOT EXISTS year_end VARCHAR(10),
  ADD COLUMN IF NOT EXISTS industry_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS industry_description TEXT,
  ADD COLUMN IF NOT EXISTS tax_financials JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS has_business BOOLEAN DEFAULT FALSE;

-- Ensure trigger for updated_at exists (from initial schema)
-- Do not modify if already exists
