CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Auth read contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Auth update contact messages"
ON public.contact_messages FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Auth delete contact messages"
ON public.contact_messages FOR DELETE TO authenticated
USING (true);