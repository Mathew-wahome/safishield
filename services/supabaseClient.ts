import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These should be stored in environment variables in a real application.
const supabaseUrl = 'https://ejjglxvyxsyrokgdetwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqamdseHZ5eHN5cm9rZ2RldHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzkzNzMsImV4cCI6MjA3Mzg1NTM3M30.DgqghqeshlcDW4kNQxqUSdm9nZX60YVaJKXaAcx1u9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);