const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Payments table error or does not exist:', error.message);
  } else {
    console.log('Payments table exists and has data:', data);
  }

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  console.log('Profiles check:', pError ? pError.message : 'OK');
}

checkTables();
