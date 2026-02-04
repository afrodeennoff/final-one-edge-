-- Supabase Database Schema for Qunt Edge
-- This file contains additional SQL that should be run after Prisma migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RLS (Row Level Security) policies for user data
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboard_layout" ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY "Users can view their own data" ON "user"
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own data" ON "user"
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own data" ON "user"
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Trade table policies
CREATE POLICY "Users can view their own trades" ON "trade"
  FOR SELECT USING (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own trades" ON "trade"
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own trades" ON "trade"
  FOR UPDATE USING (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own trades" ON "trade"
  FOR DELETE USING (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

-- Dashboard layout policies
CREATE POLICY "Users can view their own dashboard layouts" ON "dashboard_layout"
  FOR SELECT USING (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own dashboard layouts" ON "dashboard_layout"
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own dashboard layouts" ON "dashboard_layout"
  FOR UPDATE USING (user_id = (SELECT id FROM "user" WHERE auth_user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trade_user_id ON "trade"(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_entry_date ON "trade"(entry_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_layout_user_id ON "dashboard_layout"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_user_id ON "user"(auth_user_id);

-- Create function to automatically create user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."user" (id, auth_user_id, email, language)
  VALUES (NEW.id, NEW.id, NEW.email, 'en')
  ON CONFLICT (auth_user_id) DO UPDATE
  SET email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();