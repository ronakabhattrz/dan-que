-- Migration: Expand profiles schema for Tax Intake system
-- Description: Adds personal, spouse, dependent, and business-specific fields to the profiles table.

ALTER TABLE profiles
  -- Personal Intake (P1)
  ADD COLUMN ssn VARCHAR(15),
  ADD COLUMN first_name VARCHAR(255),
  ADD COLUMN last_name VARCHAR(255),
  ADD COLUMN preferred_name VARCHAR(255),
  ADD COLUMN dob DATE,
  ADD COLUMN mailing_address TEXT,
  ADD COLUMN residency_state VARCHAR(50),
  ADD COLUMN dl_details JSONB DEFAULT '{}'::jsonb, -- doc_serial, issue_date, expiry_date, backside_code

  -- Marital & Dependents (P2, P3)
  ADD COLUMN marital_status VARCHAR(50) DEFAULT 'single',
  ADD COLUMN spouse_info JSONB DEFAULT '{}'::jsonb, -- ssn, first_name, last_name, dob, phone, email, dl_details
  ADD COLUMN dependents JSONB DEFAULT '[]'::jsonb, -- Array of {ssn, first_name, last_name, dob, relationship}

  -- Personal Tax (T1, T2)
  ADD COLUMN tax_responses JSONB DEFAULT '{}'::jsonb, -- T1/T2 questions and numeric answers

  -- Business Intake (B1)
  ADD COLUMN business_phone VARCHAR(50),
  ADD COLUMN business_email VARCHAR(255),
  ADD COLUMN state_inc VARCHAR(50),
  ADD COLUMN municipality_inc VARCHAR(100),
  ADD COLUMN date_inc DATE,
  ADD COLUMN year_end VARCHAR(10), -- MM/DD
  ADD COLUMN industry_code VARCHAR(20),
  ADD COLUMN industry_description TEXT,

  -- Business Tax (B2)
  ADD COLUMN tax_financials JSONB DEFAULT '{}'::jsonb; -- revenue, expenses, industry-specific breakdowns

-- Add check constraint for marital_status if needed
-- ALTER TABLE profiles ADD CONSTRAINT check_marital_status CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'domestic_partnership'));
