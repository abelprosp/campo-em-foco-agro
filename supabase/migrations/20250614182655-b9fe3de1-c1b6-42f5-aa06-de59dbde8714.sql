
-- Create the production_records table
CREATE TABLE public.production_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    plot TEXT,
    harvest_date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    quality TEXT,
    observations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;

-- Policies for production_records table
CREATE POLICY "Users can manage their own production records"
ON public.production_records FOR ALL
USING (auth.uid() = user_id);

-- A trigger to automatically update updated_at on the production_records table
CREATE TRIGGER update_production_records_updated_at
BEFORE UPDATE ON public.production_records
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
