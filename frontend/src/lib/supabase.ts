import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppttlnnodstqvyrcvwpi.supabase.co';
const supabaseAnonKey = 'sb_publishable_LyXWvcrbwWFbTtjcL3qBPQ_2Up7JxIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'casamance-tour-auth-token',
    persistSession: true,
    autoRefreshToken: true,
  },
});
