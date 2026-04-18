-- Trips table for shared collaborative trips
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  accommodation JSONB NOT NULL DEFAULT '{}'::jsonb,
  places JSONB NOT NULL DEFAULT '[]'::jsonb,
  expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
  shopping JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Anyone with the trip link can view and edit (collaborative shared trips, no auth required)
CREATE POLICY "Anyone can view trips"
  ON public.trips FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update trips"
  ON public.trips FOR UPDATE
  USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;