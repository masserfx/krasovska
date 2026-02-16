import { sql } from "@vercel/postgres";

let initialized = false;

export async function ensureTable() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL DEFAULT 'Nový dotazník',
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  initialized = true;
}
