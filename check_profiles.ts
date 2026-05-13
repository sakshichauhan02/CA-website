import { createClient } from './utils/supabase/client'

async function checkProfiles() {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('email, role')
  console.log('Profiles:', data)
  if (error) console.error('Error:', error)
}

checkProfiles()
