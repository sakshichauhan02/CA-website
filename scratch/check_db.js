const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pkqzjaiabfkdaqzgdggn.supabase.co'
const supabaseKey = 'sb_publishable_Suoe8bpdR4TSsz1V5NJ9EA_uCh-5hte'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*')
  console.log('Profiles Count:', profiles?.length || 0)
  console.log('Profiles:', profiles)

  const { data: results, error: rError } = await supabase.from('test_results').select('*')
  console.log('Test Results Count:', results?.length || 0)
}

checkData()
