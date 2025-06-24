
-- Create the harvest_cycles table
CREATE TABLE public.harvest_cycles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.harvest_cycles ENABLE ROW LEVEL SECURITY;

-- Create policies for harvest_cycles table
CREATE POLICY "Users can manage their own harvest cycles"
ON public.harvest_cycles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger to automatically update updated_at on the harvest_cycles table
CREATE TRIGGER update_harvest_cycles_updated_at
BEFORE UPDATE ON public.harvest_cycles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Add harvest_cycle_id column to activities table
ALTER TABLE public.activities
ADD COLUMN harvest_cycle_id UUID REFERENCES public.harvest_cycles(id) ON DELETE SET NULL;

-- Add harvest_cycle_id column to production_records table
ALTER TABLE public.production_records
ADD COLUMN harvest_cycle_id UUID REFERENCES public.harvest_cycles(id) ON DELETE SET NULL;

-- Add harvest_cycle_id column to transactions table
ALTER TABLE public.transactions
ADD COLUMN harvest_cycle_id UUID REFERENCES public.harvest_cycles(id) ON DELETE SET NULL;
