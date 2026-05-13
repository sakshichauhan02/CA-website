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
        { error: 'Unauthorized. Please login to save your study plan.' },
        { status: 401 }
      )
    }

    // 2. Parse and validate body
    const body = await request.json()
    const { date, tasks } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Tasks must be an array' },
        { status: 400 }
      )
    }

    // 3. Upsert the plan
    // Using user_id and date as the unique key for upsert
    const { data, error } = await supabase
      .from('study_plans')
      .upsert(
        { 
          user_id: user.id, 
          date, 
          tasks,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Database Upsert Error:', error)
      return NextResponse.json(
        { error: 'Failed to save study plan to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Study plan saved successfully',
      data
    })

  } catch (error: any) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
