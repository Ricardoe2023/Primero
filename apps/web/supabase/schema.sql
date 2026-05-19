-- ============================================================
-- GESTAI · Schema multi-tenant
-- Corre este SQL en el SQL Editor de tu proyecto Supabase
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── NEGOCIOS ─────────────────────────────────────────────────
create table if not exists businesses (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  description text,
  logo_url    text,
  phone       text,
  email       text,
  industry    text default 'barberia',
  created_at  timestamptz default now()
);

-- ── LOCALES / SUCURSALES ─────────────────────────────────────
create table if not exists locations (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid references businesses(id) on delete cascade,
  name         text not null,
  address      text not null,
  city         text default 'Santiago',
  neighborhood text,
  lat          numeric(10,8),
  lng          numeric(11,8),
  phone        text,
  -- horas por día: { "1": {"open":"09:00","close":"20:00"}, ... }
  -- 0=Domingo 1=Lunes ... 6=Sábado
  hours        jsonb default '{}',
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- ── CATEGORÍAS DE SERVICIOS ──────────────────────────────────
create table if not exists service_categories (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name        text not null,
  sort_order  int default 0
);

-- ── SERVICIOS ────────────────────────────────────────────────
create table if not exists services (
  id               uuid primary key default uuid_generate_v4(),
  business_id      uuid references businesses(id) on delete cascade,
  location_id      uuid references locations(id) on delete set null,
  category_id      uuid references service_categories(id) on delete set null,
  name             text not null,
  description      text,
  price            numeric(10,0) not null,
  duration_minutes int not null default 30,
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- ── CATEGORÍAS DE PRODUCTOS ──────────────────────────────────
create table if not exists product_categories (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name        text not null,
  sort_order  int default 0
);

-- ── PRODUCTOS ────────────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  category_id uuid references product_categories(id) on delete set null,
  name        text not null,
  description text,
  brand       text,
  price       numeric(10,0) not null,
  stock       int default 0,
  image_url   text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ── STAFF ────────────────────────────────────────────────────
create table if not exists staff (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  name        text not null,
  role        text,
  bio         text,
  specialties text[],
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ── DISPONIBILIDAD DEL STAFF ─────────────────────────────────
create table if not exists staff_availability (
  id          uuid primary key default uuid_generate_v4(),
  staff_id    uuid references staff(id) on delete cascade,
  day_of_week int not null,   -- 0=Dom 1=Lun ... 6=Sáb
  start_time  time not null,
  end_time    time not null,
  is_active   boolean default true
);

-- ── AGENDA / CITAS ───────────────────────────────────────────
create table if not exists appointments (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid references businesses(id) on delete cascade,
  location_id     uuid references locations(id) on delete set null,
  staff_id        uuid references staff(id) on delete set null,
  service_id      uuid references services(id) on delete set null,
  customer_name   text not null,
  customer_phone  text,
  customer_email  text,
  date            date not null,
  start_time      time not null,
  end_time        time not null,
  status          text default 'confirmed', -- confirmed, cancelled, completed, no_show
  notes           text,
  source          text default 'agent',     -- agent, manual, web
  created_at      timestamptz default now()
);

-- ── CONFIGURACIÓN DEL AGENTE ─────────────────────────────────
create table if not exists agent_configs (
  id                  uuid primary key default uuid_generate_v4(),
  business_id         uuid unique references businesses(id) on delete cascade,
  agent_name          text default 'Sofía',
  greeting            text,
  personality         text default 'amable, profesional y concisa',
  language            text default 'es',
  extra_instructions  text,
  whatsapp_number     text,
  instagram_handle    text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── CONVERSACIONES ───────────────────────────────────────────
create table if not exists conversations (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid references businesses(id) on delete cascade,
  customer_phone  text,
  customer_name   text,
  channel         text default 'web',
  started_at      timestamptz default now(),
  last_message_at timestamptz default now()
);

-- ── MENSAJES ─────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  role            text not null,   -- user | assistant
  content         text not null,
  created_at      timestamptz default now()
);

-- ── RLS (Row Level Security) ─────────────────────────────────
alter table businesses         enable row level security;
alter table locations          enable row level security;
alter table service_categories enable row level security;
alter table services           enable row level security;
alter table product_categories enable row level security;
alter table products           enable row level security;
alter table staff              enable row level security;
alter table staff_availability enable row level security;
alter table appointments       enable row level security;
alter table agent_configs      enable row level security;
alter table conversations      enable row level security;
alter table messages           enable row level security;

-- Lectura pública para el agente (widget sin auth)
create policy "public_read_businesses"  on businesses         for select using (true);
create policy "public_read_locations"   on locations          for select using (true);
create policy "public_read_svc_cats"    on service_categories for select using (true);
create policy "public_read_services"    on services           for select using (is_active = true);
create policy "public_read_prod_cats"   on product_categories for select using (true);
create policy "public_read_products"    on products           for select using (is_active = true);
create policy "public_read_staff"       on staff              for select using (is_active = true);
create policy "public_read_avail"       on staff_availability for select using (is_active = true);
create policy "public_read_agent_cfg"   on agent_configs      for select using (true);
create policy "public_insert_conv"      on conversations      for insert with check (true);
create policy "public_insert_msg"       on messages           for insert with check (true);
create policy "public_read_appts"       on appointments       for select using (true);
create policy "public_insert_appts"     on appointments       for insert with check (true);

-- ============================================================
-- SEED: negocio de demo (Routine BarberStudio)
-- ============================================================

do $$
declare
  biz_id   uuid := uuid_generate_v4();
  loc_id   uuid := uuid_generate_v4();
  cat1_id  uuid := uuid_generate_v4();
  cat2_id  uuid := uuid_generate_v4();
  pcat1_id uuid := uuid_generate_v4();
  pcat2_id uuid := uuid_generate_v4();
  s1_id    uuid := uuid_generate_v4();
  s2_id    uuid := uuid_generate_v4();
  s3_id    uuid := uuid_generate_v4();
  s4_id    uuid := uuid_generate_v4();
  s5_id    uuid := uuid_generate_v4();
  staff1   uuid := uuid_generate_v4();
  staff2   uuid := uuid_generate_v4();
begin

  -- Negocio
  insert into businesses (id, name, slug, description, phone, email, industry)
  values (biz_id, 'Routine BarberStudio', 'routine-barber',
    'Barbería premium en Providencia. Cortes modernos, fades y tratamientos de barba.',
    '+56 9 8765 4321', 'hola@routinebarber.cl', 'barberia');

  -- Local
  insert into locations (id, business_id, name, address, neighborhood, city, phone, hours)
  values (loc_id, biz_id, 'Local Providencia',
    'Av. Providencia 1234, Providencia', 'Providencia', 'Santiago',
    '+56 9 8765 4321',
    '{"1":{"open":"09:00","close":"20:00"},"2":{"open":"09:00","close":"20:00"},"3":{"open":"09:00","close":"20:00"},"4":{"open":"09:00","close":"20:00"},"5":{"open":"09:00","close":"20:00"},"6":{"open":"09:00","close":"18:00"}}'
  );

  -- Categorías de servicios
  insert into service_categories (id, business_id, name, sort_order) values
    (cat1_id, biz_id, 'Cortes', 1),
    (cat2_id, biz_id, 'Barba', 2);

  -- Servicios
  insert into services (id, business_id, location_id, category_id, name, description, price, duration_minutes) values
    (s1_id, biz_id, loc_id, cat1_id, 'Corte clásico',   'Corte tradicional con tijera y máquina', 12000, 30),
    (s2_id, biz_id, loc_id, cat1_id, 'Corte + barba',   'Corte completo más perfilado y arreglo de barba', 18000, 45),
    (s3_id, biz_id, loc_id, cat1_id, 'Fade',            'Degradado bajo, medio o alto. Acabado perfecto', 15000, 40),
    (s4_id, biz_id, loc_id, cat2_id, 'Arreglo de barba','Perfilado, relleno y hidratación', 8000, 20),
    (s5_id, biz_id, loc_id, cat1_id, 'Corte niños',     'Para menores de 12 años', 9000, 25);

  -- Categorías de productos
  insert into product_categories (id, business_id, name, sort_order) values
    (pcat1_id, biz_id, 'Productos para cabello', 1),
    (pcat2_id, biz_id, 'Productos para barba', 2);

  -- Productos
  insert into products (business_id, category_id, name, brand, price, stock, description) values
    (biz_id, pcat1_id, 'Pomada mate', 'Suavecito', 9990, 15, 'Fijación fuerte, acabado mate. 113g'),
    (biz_id, pcat1_id, 'Pomada brillo', 'Reuzel', 12990, 10, 'Fijación media, brillo alto. 113g'),
    (biz_id, pcat1_id, 'Cera moldeadora', 'Layrite', 11990, 8, 'Flexible todo el día. 120g'),
    (biz_id, pcat1_id, 'Shampoo anticaída', 'American Crew', 14990, 12, '250ml. Fortalece el cabello'),
    (biz_id, pcat2_id, 'Aceite de barba', 'Suavecito', 9990, 20, 'Hidrata y suaviza la barba. 30ml'),
    (biz_id, pcat2_id, 'Balm para barba',  'Reuzel', 13990, 14, 'Acondiciona y da forma. 35g'),
    (biz_id, pcat2_id, 'Kit barba completo','Routine', 24990, 6, 'Aceite + balm + peine de bolsillo');

  -- Staff
  insert into staff (id, business_id, location_id, name, role, specialties) values
    (staff1, biz_id, loc_id, 'Carlos Díaz',   'Barbero Senior', ARRAY['fades','diseños','coloracion']),
    (staff2, biz_id, loc_id, 'Felipe Moreno', 'Barbero',        ARRAY['corte clasico','barba','niños']);

  -- Disponibilidad (Lun-Vie 9-20, Sáb 9-18)
  insert into staff_availability (staff_id, day_of_week, start_time, end_time) values
    (staff1,1,'09:00','20:00'),(staff1,2,'09:00','20:00'),(staff1,3,'09:00','20:00'),
    (staff1,4,'09:00','20:00'),(staff1,5,'09:00','20:00'),(staff1,6,'09:00','18:00'),
    (staff2,1,'09:00','20:00'),(staff2,2,'09:00','20:00'),(staff2,3,'09:00','20:00'),
    (staff2,4,'09:00','20:00'),(staff2,5,'09:00','20:00'),(staff2,6,'09:00','18:00');

  -- Config del agente
  insert into agent_configs (business_id, agent_name, greeting, personality)
  values (biz_id, 'Sofía',
    '¡Hola! 👋 Soy Sofía, asistente de Routine BarberStudio. ¿En qué te puedo ayudar hoy?',
    'Eres amable, directa y profesional. Hablas en español chileno informal (tú, no usted). Máximo 3 oraciones por respuesta.'
  );

  raise notice 'business_id: %', biz_id;
end $$;
