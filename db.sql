-- ============================================================
-- AssetFlow — Complete Supabase Database Schema
-- Paste this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- STEP 1: ENUMS
CREATE TYPE public.user_role AS ENUM ('admin', 'asset_manager', 'department_head', 'employee');
CREATE TYPE public.asset_status AS ENUM ('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed');
CREATE TYPE public.asset_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'damaged');
CREATE TYPE public.transfer_status AS ENUM ('requested', 'dept_head_approved', 'asset_manager_approved', 'completed', 'rejected');
CREATE TYPE public.maintenance_status AS ENUM ('pending', 'approved', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.resource_type AS ENUM ('meeting_room', 'conference_hall', 'projector', 'company_vehicle');
CREATE TYPE public.allocation_status AS ENUM ('active', 'returned');

-- STEP 2: USERS TABLE
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  employee_id   TEXT NOT NULL DEFAULT '',
  department_id UUID,
  role          public.user_role NOT NULL DEFAULT 'employee',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  joining_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 3: DEPARTMENTS TABLE
CREATE TABLE public.departments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  code                 TEXT NOT NULL UNIQUE,
  head_id              UUID REFERENCES public.users(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  description          TEXT,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users
  ADD CONSTRAINT fk_users_department
  FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

-- STEP 4: CATEGORIES TABLE
CREATE TABLE public.categories (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  description            TEXT,
  warranty_period_months INTEGER,
  icon                   TEXT,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 5: ASSETS TABLE
CREATE TABLE public.assets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id           TEXT NOT NULL UNIQUE DEFAULT ('AF-' || UPPER(SUBSTR(gen_random_uuid()::TEXT,1,8))),
  name               TEXT NOT NULL,
  serial_number      TEXT,
  category_id        UUID NOT NULL REFERENCES public.categories(id),
  purchase_date      DATE,
  purchase_cost      NUMERIC(12,2),
  manufacturer       TEXT,
  model              TEXT,
  warranty_expiry    DATE,
  condition          public.asset_condition NOT NULL DEFAULT 'good',
  location           TEXT,
  department_id      UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  is_shared_resource BOOLEAN NOT NULL DEFAULT FALSE,
  resource_type      public.resource_type,
  image_url          TEXT,
  description        TEXT,
  status             public.asset_status NOT NULL DEFAULT 'available',
  current_holder_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 6: ASSET ALLOCATIONS TABLE
CREATE TABLE public.asset_allocations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id              UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  employee_id           UUID NOT NULL REFERENCES public.users(id),
  department_id         UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  allocated_by          UUID NOT NULL REFERENCES public.users(id),
  allocated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_return_date  DATE,
  actual_return_date    TIMESTAMPTZ,
  purpose               TEXT,
  remarks               TEXT,
  return_condition      public.asset_condition,
  return_remarks        TEXT,
  damage_report         TEXT,
  condition_at_check_in public.asset_condition,
  status                public.allocation_status NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 7: ASSET TRANSFERS TABLE
CREATE TABLE public.asset_transfers (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id                  UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  from_employee_id          UUID REFERENCES public.users(id),
  to_employee_id            UUID REFERENCES public.users(id),
  from_department_id        UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  to_department_id          UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  requested_by              UUID NOT NULL REFERENCES public.users(id),
  dept_head_approved_by     UUID REFERENCES public.users(id),
  asset_manager_approved_by UUID REFERENCES public.users(id),
  status                    public.transfer_status NOT NULL DEFAULT 'requested',
  reason                    TEXT,
  remarks                   TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 8: MAINTENANCE REQUESTS TABLE
CREATE TABLE public.maintenance_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  reported_by       UUID NOT NULL REFERENCES public.users(id),
  approved_by       UUID REFERENCES public.users(id),
  technician        TEXT,
  priority          public.maintenance_priority NOT NULL DEFAULT 'medium',
  issue_description TEXT NOT NULL,
  resolution_notes  TEXT,
  status            public.maintenance_status NOT NULL DEFAULT 'pending',
  cost              NUMERIC(10,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 9: BOOKINGS TABLE
CREATE TABLE public.bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  booked_by   UUID NOT NULL REFERENCES public.users(id),
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  purpose     TEXT,
  status      public.booking_status NOT NULL DEFAULT 'confirmed',
  remarks     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_time_check CHECK (end_time > start_time)
);

-- STEP 10: NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  link       TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 11: ACTIVITY LOGS TABLE
CREATE TABLE public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  module      TEXT NOT NULL,
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 12: UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users          BEFORE UPDATE ON public.users               FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_departments    BEFORE UPDATE ON public.departments         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_categories     BEFORE UPDATE ON public.categories          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_assets         BEFORE UPDATE ON public.assets              FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_allocations    BEFORE UPDATE ON public.asset_allocations   FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_transfers      BEFORE UPDATE ON public.asset_transfers     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_maintenance    BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_bookings       BEFORE UPDATE ON public.bookings            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- STEP 13: AUTO-CREATE USER PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, employee_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email,'@',1)),
    NEW.email,
    'EMP-' || UPPER(SUBSTR(NEW.id::TEXT,1,6))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 14: ROW LEVEL SECURITY
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_allocations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_transfers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs        ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_read"   ON public.users FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- Department, Category, Asset policies (read all / write admin+manager)
CREATE POLICY "dept_read"  ON public.departments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "dept_write" ON public.departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager')));

CREATE POLICY "cat_read"  ON public.categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "cat_write" ON public.categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager')));

CREATE POLICY "asset_read"  ON public.assets FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "asset_write" ON public.assets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager')));

CREATE POLICY "alloc_read"  ON public.asset_allocations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "alloc_write" ON public.asset_allocations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager')));

CREATE POLICY "transfer_read"  ON public.asset_transfers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "transfer_write" ON public.asset_transfers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager','department_head')));

CREATE POLICY "maint_read"   ON public.maintenance_requests FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "maint_insert" ON public.maintenance_requests FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "maint_update" ON public.maintenance_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager')));

CREATE POLICY "book_read"   ON public.bookings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "book_insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (booked_by=auth.uid());
CREATE POLICY "book_update" ON public.bookings FOR UPDATE TO authenticated USING (booked_by=auth.uid());

CREATE POLICY "notif_read"   ON public.notifications FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id=auth.uid());

CREATE POLICY "log_read"   ON public.activity_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.role IN ('admin','asset_manager')));
CREATE POLICY "log_insert" ON public.activity_logs FOR INSERT WITH CHECK (TRUE);

-- STEP 15: SEED — DEPARTMENTS
INSERT INTO public.departments (name, code, description) VALUES
  ('Engineering',     'ENG', 'Software and hardware engineering'),
  ('Human Resources', 'HR',  'People and culture management'),
  ('Finance',         'FIN', 'Accounting and financial operations'),
  ('Operations',      'OPS', 'Day-to-day business operations');

-- STEP 16: SEED — CATEGORIES
INSERT INTO public.categories (name, description, warranty_period_months) VALUES
  ('Laptops',      'Portable computing devices',          24),
  ('Desktop PCs',  'Stationary workstations',             36),
  ('Phones',       'Company-issued smartphones',          12),
  ('Monitors',     'Display screens and monitors',        36),
  ('Networking',   'Routers, switches and cabling',       60),
  ('Furniture',    'Chairs, desks and storage',            0),
  ('Vehicles',     'Company-owned transport',             60),
  ('Meeting Rooms','Shared conference spaces',             0),
  ('Projectors',   'Presentation projectors',             24),
  ('Accessories',  'Keyboards, mice, headsets',           12);

-- STEP 17: SEED — SAMPLE ASSETS
INSERT INTO public.assets (name, serial_number, category_id, manufacturer, model, condition, location, is_shared_resource, resource_type, status, purchase_date, purchase_cost)
SELECT 'MacBook Pro 14 M3',   'SN-MBP-001', c.id, 'Apple',  'MacBook Pro M3',  'excellent'::public.asset_condition, 'HQ Floor 2',      FALSE, NULL::public.resource_type, 'available'::public.asset_status, '2024-01-15'::date, 185000 FROM public.categories c WHERE c.name='Laptops'
UNION ALL
SELECT 'Dell XPS 15',         'SN-XPS-002', c.id, 'Dell',   'XPS 15 9530',     'good'::public.asset_condition,      'HQ Floor 1',      FALSE, NULL::public.resource_type, 'available'::public.asset_status, '2023-11-10'::date, 125000 FROM public.categories c WHERE c.name='Laptops'
UNION ALL
SELECT 'iPhone 15 Pro',       'SN-IP15-003',c.id, 'Apple',  'iPhone 15 Pro',   'excellent'::public.asset_condition, 'HQ Store Room',   FALSE, NULL::public.resource_type, 'available'::public.asset_status, '2024-02-01'::date, 129900 FROM public.categories c WHERE c.name='Phones'
UNION ALL
SELECT 'Conference Room Alpha',NULL,         c.id, NULL,     NULL,              'excellent'::public.asset_condition, 'HQ Ground Floor', TRUE,  'meeting_room'::public.resource_type,   'available'::public.asset_status, NULL::date,         NULL   FROM public.categories c WHERE c.name='Meeting Rooms'
UNION ALL
SELECT 'Boardroom Suite',      NULL,         c.id, NULL,     NULL,              'excellent'::public.asset_condition, 'HQ 3rd Floor',    TRUE,  'conference_hall'::public.resource_type,'available'::public.asset_status, NULL::date,         NULL   FROM public.categories c WHERE c.name='Meeting Rooms'
UNION ALL
SELECT 'Epson EB-2265U',      'SN-PRJ-006', c.id, 'Epson',  'EB-2265U',        'good'::public.asset_condition,      'HQ AV Closet',    TRUE,  'projector'::public.resource_type,      'available'::public.asset_status, '2023-06-20'::date, 45000  FROM public.categories c WHERE c.name='Projectors'
UNION ALL
SELECT 'Toyota Innova',       'GJ01AB1234', c.id, 'Toyota', 'Innova Crysta',   'good'::public.asset_condition,      'Ground Parking',  TRUE,  'company_vehicle'::public.resource_type,'available'::public.asset_status, '2022-03-10'::date, 1850000 FROM public.categories c WHERE c.name='Vehicles';
