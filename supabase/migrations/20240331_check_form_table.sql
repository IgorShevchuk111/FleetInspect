-- Check current form table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'form'
ORDER BY 
    ordinal_position;

-- Check if there are any records
SELECT * FROM form;

-- If the table exists but has issues, let's recreate it properly
DROP TABLE IF EXISTS form CASCADE;

-- Create form table with proper BIGINT identity
CREATE TABLE form (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    field_id TEXT NOT NULL UNIQUE,
    hidden BOOLEAN NOT NULL DEFAULT false,
    vehicletype TEXT,
    trip TEXT CHECK (trip IN ('pre-trip', 'post-trip', NULL)),
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    label TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    placeholder TEXT,
    is_disabled BOOLEAN DEFAULT false,
    options JSONB,
    is_required BOOLEAN DEFAULT false
);

-- Insert form fields (IDs will be auto-generated as 1, 2, 3, 4)
INSERT INTO form (field_id, label, name, type, placeholder, hidden, vehicletype, trip, position, is_required) VALUES
    ('headlights', 'Headlights', 'headlights', 'checkbox', NULL, false, NULL, NULL, 1, true),
    ('turn_signals', 'Turn Signals', 'turn_signals', 'checkbox', NULL, false, NULL, NULL, 2, true),
    ('mirrors', 'Mirrors', 'mirrors', 'checkbox', NULL, false, NULL, NULL, 3, true),
    ('brakes', 'Brakes', 'brakes', 'checkbox', NULL, false, NULL, NULL, 4, true);

-- Verify the data was inserted correctly
SELECT id, field_id, label, name FROM form ORDER BY id;

-- Enable RLS
ALTER TABLE form ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON form
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON form
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON form
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON form TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 