import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://agliuotvnerzzvrkyfwh.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImVmYzJhYWIzLTY4MTgtNDE2Mi04ZTBiLWYyYjBhN2MzZmJiNSJ9.eyJwcm9qZWN0SWQiOiJhZ2xpdW90dm5lcnp6dnJreWZ3aCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4OTgyODc2LCJleHAiOjIwODQzNDI4NzYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.WzEpEaaK7UOrkDXIYvdUrYFKLXIvVKES3witafMpAhg';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };