-- Run once on the existing DanaGo database before enabling Google login.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "supabase_id" UUID;
CREATE UNIQUE INDEX IF NOT EXISTS "user_supabase_id_key" ON "user"("supabase_id");
