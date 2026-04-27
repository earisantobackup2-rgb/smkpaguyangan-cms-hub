
-- Knowledge base table
CREATE TABLE public.chatbot_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chatbot_knowledge_active ON public.chatbot_knowledge(is_active);

-- Settings table (singleton row)
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  position TEXT NOT NULL DEFAULT 'bottom-right', -- bottom-right, bottom-left, top-right, top-left
  primary_color TEXT NOT NULL DEFAULT '#10b981', -- green
  bot_name TEXT NOT NULL DEFAULT 'Asisten Sekolah',
  welcome_message TEXT NOT NULL DEFAULT 'Halo! Saya asisten virtual SMK Muhammadiyah 1 Paguyangan. Ada yang bisa saya bantu?',
  placeholder_text TEXT NOT NULL DEFAULT 'Tanyakan sesuatu...',
  offset_x INTEGER NOT NULL DEFAULT 24,
  offset_y INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations log
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chatbot_conv_session ON public.chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_conv_created ON public.chatbot_conversations(created_at DESC);

-- Enable RLS
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Knowledge policies
CREATE POLICY "Public can view active knowledge"
  ON public.chatbot_knowledge FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage knowledge"
  ON public.chatbot_knowledge FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));

-- Settings policies
CREATE POLICY "Public can view settings"
  ON public.chatbot_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.chatbot_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));

-- Conversation policies
CREATE POLICY "Anyone can insert conversations"
  ON public.chatbot_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view conversations"
  ON public.chatbot_conversations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete conversations"
  ON public.chatbot_conversations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_chatbot_knowledge_updated_at
  BEFORE UPDATE ON public.chatbot_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_settings_updated_at
  BEFORE UPDATE ON public.chatbot_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings row
INSERT INTO public.chatbot_settings (is_enabled, position, primary_color, bot_name, welcome_message)
VALUES (true, 'bottom-right', '#10b981', 'Asisten SMK', 'Halo! Saya asisten virtual SMK Muhammadiyah 1 Paguyangan. Ada yang bisa saya bantu seputar sekolah, jurusan, atau pendaftaran?');

-- Seed initial knowledge entry
INSERT INTO public.chatbot_knowledge (title, content, category) VALUES
('Tentang SMK Muhammadiyah 1 Paguyangan', 'SMK Muhammadiyah 1 Paguyangan adalah sekolah menengah kejuruan yang berlokasi di Paguyangan, Kabupaten Brebes, Jawa Tengah. Sekolah ini berada di bawah naungan Persyarikatan Muhammadiyah dan menjunjung nilai Islam, Ilmu, dan Amal.', 'profil');
