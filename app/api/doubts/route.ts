import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse body
    const { subject, question } = await request.json()

    if (!subject || !question) {
      return NextResponse.json(
        { error: 'Subject and question are required' },
        { status: 400 }
      )
    }

    // 3. Insert doubt
    const { data, error } = await supabase
      .from('doubts')
      .insert({
        user_id: user.id,
        subject,
        question,
        is_answered: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Doubt POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
