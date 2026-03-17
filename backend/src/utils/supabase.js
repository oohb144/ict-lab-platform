import { createClient } from '@supabase/supabase-js';
import config from '../config.js';

const supabase = config.supabaseUrl && config.supabaseAnonKey
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

export default supabase;
