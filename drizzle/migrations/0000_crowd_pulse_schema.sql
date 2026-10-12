CREATE TABLE public.temples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, city text NOT NULL, state text NOT NULL, country text NOT NULL DEFAULT 'India',
  latitude numeric, longitude numeric, popularity_score numeric NOT NULL DEFAULT 50,
  image_url text, is_sample boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.temples TO anon, authenticated; GRANT ALL ON public.temples TO service_role;
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temples public read" ON public.temples FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.crowd_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id uuid NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  date date NOT NULL, hour integer NOT NULL, visitor_count integer NOT NULL, waiting_time_minutes integer NOT NULL,
  crowd_level text NOT NULL, source text NOT NULL DEFAULT 'demo_sample', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.crowd_history TO anon, authenticated; GRANT ALL ON public.crowd_history TO service_role;
ALTER TABLE public.crowd_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history public read" ON public.crowd_history FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX ON public.crowd_history(temple_id, date);

CREATE TABLE public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), date date NOT NULL, name text NOT NULL, holiday_type text NOT NULL DEFAULT 'national'
);
GRANT SELECT ON public.holidays TO anon, authenticated; GRANT ALL ON public.holidays TO service_role;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "holidays public read" ON public.holidays FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.festivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id uuid REFERENCES public.temples(id) ON DELETE CASCADE,
  festival_name text NOT NULL, start_date date NOT NULL, end_date date NOT NULL, importance integer NOT NULL DEFAULT 3
);
GRANT SELECT ON public.festivals TO anon, authenticated; GRANT ALL ON public.festivals TO service_role;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "festivals public read" ON public.festivals FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  temple_id uuid NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  prediction_date date NOT NULL, prediction_hour integer NOT NULL,
  crowd_score numeric NOT NULL, crowd_level text NOT NULL,
  estimated_min integer NOT NULL, estimated_max integer NOT NULL,
  waiting_min integer NOT NULL, waiting_max integer NOT NULL,
  confidence numeric NOT NULL, model_version text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.predictions TO authenticated; GRANT ALL ON public.predictions TO service_role;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own predictions select" ON public.predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own predictions insert" ON public.predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own predictions delete" ON public.predictions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.prediction_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  actual_crowd integer, user_rating integer, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.prediction_feedback TO authenticated; GRANT ALL ON public.prediction_feedback TO service_role;
ALTER TABLE public.prediction_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback select" ON public.prediction_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own feedback insert" ON public.prediction_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.video_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, video_url text NOT NULL, status text NOT NULL DEFAULT 'uploading',
  total_frames integer, average_people numeric, maximum_people integer, density_score numeric,
  crowd_level text, confidence numeric, analysis_summary text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.video_analysis TO authenticated; GRANT ALL ON public.video_analysis TO service_role;
ALTER TABLE public.video_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own video select" ON public.video_analysis FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own video insert" ON public.video_analysis FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own video update" ON public.video_analysis FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.temples (name, city, state, latitude, longitude, popularity_score) VALUES
 ('Tirumala Tirupati', 'Tirupati', 'Andhra Pradesh', 13.6833, 79.3474, 95),
 ('Srikalahasti Temple', 'Srikalahasti', 'Andhra Pradesh', 13.7499, 79.6981, 60),
 ('Kanaka Durga Temple', 'Vijayawada', 'Andhra Pradesh', 16.5175, 80.6050, 70),
 ('Srisailam Temple', 'Srisailam', 'Andhra Pradesh', 16.0740, 78.8680, 65),
 ('Yadadri Temple', 'Yadagirigutta', 'Telangana', 17.5880, 78.9450, 62),
 ('Simhachalam Temple', 'Visakhapatnam', 'Andhra Pradesh', 17.7664, 83.2507, 58);

INSERT INTO public.crowd_history (temple_id, date, hour, visitor_count, waiting_time_minutes, crowd_level, source)
SELECT t.id, d::date, h, v, GREATEST(2, round(v / (t.popularity_score * 3.2))::int),
  CASE WHEN v < t.popularity_score*8 THEN 'LOW' WHEN v < t.popularity_score*14 THEN 'MODERATE' WHEN v < t.popularity_score*20 THEN 'HIGH' ELSE 'CRITICAL' END,
  'demo_sample'
FROM public.temples t
CROSS JOIN generate_series(current_date - 60, current_date - 1, interval '1 day') d
CROSS JOIN generate_series(6, 20) h
CROSS JOIN LATERAL (SELECT round(t.popularity_score * 25 *
  (0.25 + 0.75 * GREATEST(exp(-((h-9)^2)/6.0), 0.9*exp(-((h-18)^2)/5.0))) *
  (CASE WHEN extract(dow FROM d) IN (0,6) THEN 1.25 ELSE 1 END) * (0.85 + random()*0.3))::int AS v) x;

INSERT INTO public.holidays (date, name, holiday_type) VALUES
 ('2026-10-20','Dussehra','festival'),('2026-11-08','Diwali','festival'),('2026-12-25','Christmas','national'),('2027-01-26','Republic Day','national');
INSERT INTO public.festivals (temple_id, festival_name, start_date, end_date, importance)
SELECT id, 'Brahmotsavam', '2026-10-12', '2026-10-20', 5 FROM public.temples WHERE name = 'Tirumala Tirupati';

CREATE POLICY "own videos read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own videos upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);