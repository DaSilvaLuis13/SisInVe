import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.REACT_VITE_APP_SUPABASE_URL,
    process.env.REACT_VITE_APP_SUPABASE_ANON_KEY
);