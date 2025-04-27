import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqhywsdyyzezfyjzhkvu.supabase.co'; // <-- paste your Project URL here
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaHl3c2R5eXplemZ5anpoa3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODg4NzEsImV4cCI6MjA2MTM2NDg3MX0.9LcCjQ4_1mpeBKHPxsF8qCVPjC7Slp_ZqmV4NIrYzk0'; // <-- paste your anon public key here

export const supabase = createClient(supabaseUrl, supabaseKey); 