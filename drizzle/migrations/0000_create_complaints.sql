CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  summary text,
  category text NOT NULL DEFAULT 'other',
  urgency text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'submitted',
  area text,
  latitude double precision,
  longitude double precision,
  photo_url text,
  language text NOT NULL DEFAULT 'en',
  ai_source text NOT NULL DEFAULT 'demo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.complaints TO anon, authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.complaints FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public file" ON public.complaints FOR INSERT TO anon, authenticated WITH CHECK (status = 'submitted');
CREATE POLICY "Demo admin status update" ON public.complaints FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (status IN ('submitted','in_progress','resolved','rejected'));
CREATE INDEX complaints_created_idx ON public.complaints (created_at DESC);

INSERT INTO public.complaints (code,title,description,summary,category,urgency,status,area,latitude,longitude,language,ai_source,created_at) VALUES
('NV-24A7K3','Deep pothole on 80 Feet Road','There is a very deep pothole near the Sony signal, two-wheelers are falling at night.','Hazardous pothole near Sony World signal causing two-wheeler accidents at night.','pothole','high','in_progress','Koramangala, Bengaluru',12.9352,77.6245,'en','demo',now()-interval '2 days'),
('NV-9QX2LM','ಕಸ ಸಂಗ್ರಹಣೆ ಆಗುತ್ತಿಲ್ಲ','ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ಒಂದು ವಾರದಿಂದ ಕಸ ತೆಗೆದುಕೊಂಡು ಹೋಗಿಲ್ಲ, ವಾಸನೆ ಬರುತ್ತಿದೆ.','Garbage not collected for a week on residential street; foul smell reported.','garbage','medium','submitted','Jayanagar 4th Block, Bengaluru',12.9250,77.5838,'kn','demo',now()-interval '5 hours'),
('NV-B7T4PZ','Water pipeline leaking for 3 days','Clean drinking water is gushing out of a broken BWSSB pipe near the temple.','Broken water main wasting drinking water for three days near temple.','water','high','submitted','Malleshwaram, Bengaluru',13.0035,77.5709,'en','demo',now()-interval '1 day'),
('NV-K2M8RD','Open drain overflowing','Drainage is overflowing onto the road after rain, mosquitoes everywhere.','Overflowing storm drain after rain creating health risk.','drainage','critical','in_progress','Hebbal, Bengaluru',13.0358,77.5970,'en','demo',now()-interval '3 days'),
('NV-L5H1WC','ಬೀದಿ ದೀಪ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ','ಮೂರು ಬೀದಿ ದೀಪಗಳು ಎರಡು ವಾರದಿಂದ ಆರಿಹೋಗಿವೆ, ರಾತ್ರಿ ಅಪಾಯಕಾರಿ.','Three streetlights out for two weeks making the road unsafe at night.','streetlight','medium','resolved','Vijayanagar, Mysuru',12.3200,76.6200,'kn','demo',now()-interval '9 days'),
('NV-P8D3NY','Garbage dumped on lake bund','Construction debris and plastic dumped along the lake walking path.','Illegal dumping of debris and plastic along lake walkway.','garbage','low','resolved','HSR Layout, Bengaluru',12.9116,77.6389,'en','demo',now()-interval '12 days');