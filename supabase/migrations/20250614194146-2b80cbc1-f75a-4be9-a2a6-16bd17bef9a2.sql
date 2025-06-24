
-- Create the plots table for visual registration
CREATE TABLE public.plots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    geometry JSONB, -- For storing GeoJSON of the plot shape
    area_hectares NUMERIC(10, 4), -- Area in hectares
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Create policies for plots table
CREATE POLICY "Users can manage their own plots"
ON public.plots FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger to automatically update updated_at on the plots table
CREATE TRIGGER update_plots_updated_at
BEFORE UPDATE ON public.plots
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Update activities table to link to plots
-- Note: The old 'plot' text field is being removed. Any data in it will be lost.
ALTER TABLE public.activities DROP COLUMN IF EXISTS plot;
ALTER TABLE public.activities ADD COLUMN plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL;

-- Update production_records table to link to plots
-- Note: The old 'plot' text field is being removed. Any data in it will be lost.
ALTER TABLE public.production_records DROP COLUMN IF EXISTS plot;
ALTER TABLE public.production_records ADD COLUMN plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL;

-- Update transactions table to link to plots
ALTER TABLE public.transactions ADD COLUMN plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL;
