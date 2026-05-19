-- RLS for staff table: owner can manage their own staff
create policy "owner_read_staff" on staff for select
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

create policy "owner_insert_staff" on staff for insert
  with check (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

create policy "owner_update_staff" on staff for update
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

-- RLS for locations table: owner can read and update their own locations
create policy "owner_read_location" on locations for select
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

create policy "owner_update_location" on locations for update
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );
