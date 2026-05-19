-- Agregar owner_id a businesses
alter table businesses add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists idx_businesses_owner_id on businesses(owner_id);

-- RLS: el dueño puede insertar y actualizar su negocio
create policy "owner_insert_business" on businesses for insert with check (auth.uid() = owner_id);
create policy "owner_update_business" on businesses for update using (auth.uid() = owner_id);

-- RLS: el dueño puede ver y actualizar las citas de su negocio
create policy "owner_read_appointments" on appointments for select using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "owner_update_appointments" on appointments for update using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "owner_insert_appointments" on appointments for insert with check (
  business_id in (select id from businesses where owner_id = auth.uid())
);
