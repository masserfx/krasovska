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

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'planned',
      priority VARCHAR(10) DEFAULT 'medium',
      due_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'todo',
      priority VARCHAR(10) DEFAULT 'medium',
      assignee VARCHAR(100),
      due_date DATE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analysis_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      ip_address VARCHAR(45),
      user_agent TEXT,
      device_type VARCHAR(20),
      country VARCHAR(100),
      city VARCHAR(100),
      geo_status VARCHAR(20) DEFAULT 'pending',
      changed_sections JSONB DEFAULT '[]',
      changed_fields JSONB DEFAULT '{}',
      device_info JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Migration: add device_info column if missing
  await sql`
    ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}'
  `;

  initialized = true;
}
