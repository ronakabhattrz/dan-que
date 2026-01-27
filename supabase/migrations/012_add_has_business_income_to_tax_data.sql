-- Add has_business_income to tax_data table
ALTER TABLE tax_data
ADD COLUMN IF NOT EXISTS has_business_income BOOLEAN DEFAULT FALSE;
