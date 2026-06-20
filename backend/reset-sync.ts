import { getSupabase } from './src/config/db';
import { validateEnvironment } from './src/config/validation';
import { config } from './src/config';

async function main() {
  console.log('Resetting last_sync_at for all users...');
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .update({ last_sync_at: null, sync_status: 'completed', total_emails_synced: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all users
    
  if (error) {
    console.error('Error resetting:', error);
  } else {
    console.log('Reset successful. You can now sync again.');
  }
}

main();
