DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Public insert contact messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(message)) BETWEEN 1 AND 2000
    AND (subject IS NULL OR length(subject) <= 200)
  );

DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.chatbot_conversations;
CREATE POLICY "Public insert conversations" ON public.chatbot_conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(session_id)) BETWEEN 1 AND 100
    AND length(trim(user_message)) BETWEEN 1 AND 4000
    AND length(trim(bot_response)) BETWEEN 0 AND 8000
  );