import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AttemptEngine from '@/components/mock-tests/AttemptEngine';
import { notFound } from 'next/navigation';

export default async function MockTestAttemptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch the test details
  const { data: test, error: testError } = await supabase
    .from('mcq_tests')
    .select('*')
    .eq('id', id)
    .single();

  if (testError || !test) {
    return notFound();
  }

  // 2. Fetch all questions for this test
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', id)
    .order('id', { ascending: true });

  if (qError) {
    console.error('Error fetching questions:', qError);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AttemptEngine 
        test={test} 
        initialQuestions={questions || []} 
      />
    </div>
  );
}
