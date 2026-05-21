import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://jkpkkimczpczgwjbutix.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGtraW1jenBjemd3amJ1dGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODMxNDMsImV4cCI6MjA5NDg1OTE0M30.DfqHrhjIjGWX5ZgTHvESy7UOAbAU-9toTOAvtdX5P_Y"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)