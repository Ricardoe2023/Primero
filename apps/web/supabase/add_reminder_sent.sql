-- Columna para marcar que el recordatorio de 30 min ya fue enviado
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
