-- Add tax_year column to documents table to associate documents with specific tax years
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS tax_year INTEGER;

-- Add index for tax year queries
CREATE INDEX IF NOT EXISTS idx_documents_tax_year ON documents(tax_year);

-- Add index for combined profile_id and tax_year queries
CREATE INDEX IF NOT EXISTS idx_documents_profile_tax_year ON documents(profile_id, tax_year);
