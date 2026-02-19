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

  // --- E-shop tables ---

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      price_czk INTEGER NOT NULL,
      compare_price_czk INTEGER,
      category VARCHAR(100) NOT NULL,
      image_url TEXT,
      stock_quantity INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS discount_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_percent INTEGER,
      discount_amount INTEGER,
      min_order_amount INTEGER DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER DEFAULT 0,
      valid_from TIMESTAMPTZ DEFAULT NOW(),
      valid_until TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      customer_name VARCHAR(255) NOT NULL,
      items JSONB NOT NULL,
      subtotal INTEGER NOT NULL,
      discount_amount INTEGER DEFAULT 0,
      discount_code VARCHAR(50),
      total INTEGER NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      delivery_method VARCHAR(50) DEFAULT 'pickup',
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      comgate_trans_id VARCHAR(100),
      amount INTEGER NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      method VARCHAR(50),
      paid_at TIMESTAMPTZ,
      raw_response JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // E-shop indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)`;

  // --- Users table (auth) ---

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'member',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS section_permissions TEXT[]`;

  // Visibility migrations
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'all'`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'all'`;

  // --- Bistro tables ---

  await sql`
    CREATE TABLE IF NOT EXISTS bistro_phases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(100) NOT NULL,
      description TEXT,
      phase_number INTEGER NOT NULL,
      start_date DATE,
      end_date DATE,
      status VARCHAR(20) DEFAULT 'planned'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bistro_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phase_id UUID REFERENCES bistro_phases(id) ON DELETE CASCADE,
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
    CREATE TABLE IF NOT EXISTS bistro_kpis (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      month_year VARCHAR(7) NOT NULL,
      revenue_target INTEGER,
      revenue_actual INTEGER,
      covers_target INTEGER,
      covers_actual INTEGER,
      avg_ticket_target INTEGER,
      avg_ticket_actual INTEGER,
      fixed_costs INTEGER DEFAULT 47500,
      variable_costs_actual INTEGER
    )
  `;

  // Bistro migrations
  await sql`ALTER TABLE bistro_tasks ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'task'`;
  await sql`ALTER TABLE bistro_tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE bistro_phases ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'blue'`;

  initialized = true;
}
