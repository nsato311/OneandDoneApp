import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://forvxjpxuipdufldpbqi.supabase.co';
const supabaseKey = 'sb_publishable_Y0fkChodxzIpldE01TKWyw_U5JyFUAH';

export const supabase = createClient(supabaseUrl, supabaseKey);