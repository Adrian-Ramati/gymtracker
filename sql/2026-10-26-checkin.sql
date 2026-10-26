-- Check-in v2 (sueño en horas, motivación, cansancio / agujetas / dolor por músculo).
-- Ejecútalo en Supabase → SQL Editor después de 2026-10-25-modelo-v2.sql. Es idempotente.
-- Sin esta columna la app funciona igual: el check-in completo queda en el móvil y en la nube solo una aproximación.
alter table if exists biometric_daily add column if not exists checkin jsonb;
