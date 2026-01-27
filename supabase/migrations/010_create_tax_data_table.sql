-- Create tax_data table for year-wise tax information
CREATE TABLE tax_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    tax_year INTEGER NOT NULL,
    
    -- Personal Tax Questions
    out_of_country BOOLEAN DEFAULT FALSE,
    months_out_of_country INTEGER,
    foreign_account BOOLEAN DEFAULT FALSE,
    digital_assets BOOLEAN DEFAULT FALSE,
    w2_count INTEGER DEFAULT 0,
    form_1099_count INTEGER DEFAULT 0,
    spouse_w2_count INTEGER DEFAULT 0,
    spouse_1099_count INTEGER DEFAULT 0,
    
    -- Dependent Questions
    dependent_student BOOLEAN DEFAULT FALSE,
    dependent_months_us INTEGER,
    dependent_lived_with BOOLEAN DEFAULT FALSE,
    dependent_worked BOOLEAN DEFAULT FALSE,
    
    -- Business Tax Data
    total_revenue DECIMAL(12, 2),
    phone_expense DECIMAL(12, 2),
    internet_expense DECIMAL(12, 2),
    
    -- Industry-specific expenses (stored as JSONB for flexibility)
    -- Examples: taxi_car_rent, taxi_fuel, taxi_uber_fees, truck_pmt, truck_trailer, truck_dispatch
    industry_expenses JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per profile per year
    UNIQUE(profile_id, tax_year)
);

-- Enable RLS
ALTER TABLE tax_data ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_tax_data_profile_id ON tax_data(profile_id);
CREATE INDEX idx_tax_data_tax_year ON tax_data(tax_year);

-- Policies

-- Users can view their own tax data
CREATE POLICY "Users can view own tax data"
    ON tax_data FOR SELECT
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can insert their own tax data
CREATE POLICY "Users can insert own tax data"
    ON tax_data FOR INSERT
    WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can update their own tax data
CREATE POLICY "Users can update own tax data"
    ON tax_data FOR UPDATE
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can delete their own tax data
CREATE POLICY "Users can delete own tax data"
    ON tax_data FOR DELETE
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Admins can view all tax data
CREATE POLICY "Admins can view all tax data"
    ON tax_data FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tax_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER tax_data_updated_at
    BEFORE UPDATE ON tax_data
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_data_updated_at();
