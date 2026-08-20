CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stops jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.routes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routes TO authenticated;
GRANT ALL ON public.routes TO service_role;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Routes are publicly readable" ON public.routes FOR SELECT USING (true);

CREATE TABLE public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number text NOT NULL,
  route_id uuid REFERENCES public.routes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.buses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buses TO authenticated;
GRANT ALL ON public.buses TO service_role;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buses are publicly readable" ON public.buses FOR SELECT USING (true);

CREATE TABLE public.live_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  speed float8,
  heading float8,
  accuracy float8,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX live_locations_bus_id_key ON public.live_locations (bus_id);
GRANT SELECT, INSERT, UPDATE ON public.live_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_locations TO authenticated;
GRANT ALL ON public.live_locations TO service_role;
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live locations are publicly readable" ON public.live_locations FOR SELECT USING (true);
CREATE POLICY "Anyone can report a bus location" ON public.live_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update a bus location" ON public.live_locations FOR UPDATE USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_locations;
ALTER TABLE public.live_locations REPLICA IDENTITY FULL;

INSERT INTO public.routes (id, name, stops) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Route 12 — City Centre Loop', '[{"name":"Central Station","lat":12.9767,"lng":77.5713},{"name":"Museum Road","lat":12.9718,"lng":77.5946},{"name":"MG Road","lat":12.9756,"lng":77.6068},{"name":"Indiranagar","lat":12.9784,"lng":77.6408}]'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'Route 7 — Airport Express', '[{"name":"Majestic","lat":12.9774,"lng":77.5710},{"name":"Hebbal","lat":13.0358,"lng":77.5970},{"name":"Yelahanka","lat":13.1007,"lng":77.5963},{"name":"Airport","lat":13.1986,"lng":77.7066}]'::jsonb);

INSERT INTO public.buses (id, bus_number, route_id) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', 'KA-01-1234', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-2222-2222-2222-222222222222', 'KA-01-5678', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-1111-1111-1111-111111111111', 'KA-05-9090', '22222222-2222-2222-2222-222222222222');

INSERT INTO public.live_locations (bus_id, latitude, longitude, speed, heading, accuracy) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', 12.9756, 77.6068, 24.5, 90, 12),
  ('aaaaaaaa-2222-2222-2222-222222222222', 12.9718, 77.5946, 0, 180, 20),
  ('bbbbbbbb-1111-1111-1111-111111111111', 13.0358, 77.5970, 42.1, 20, 8);