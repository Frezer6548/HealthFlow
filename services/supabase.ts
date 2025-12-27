
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdutxamaczexnshrozja.supabase.co';
const supabaseKey = 'sb_publishable_ZIRczQaw4MyUx3QhnZSlWg_o9jNmUOl';

export const supabase = createClient(supabaseUrl, supabaseKey);
