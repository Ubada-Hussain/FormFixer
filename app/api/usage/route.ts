import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DAILY_LIMIT = 5;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = getTodayString();

  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('action_count')
      .eq('user_id', userId)
      .eq('action_date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase fetch notice:', error.message);
    }

    const count = data?.action_count || 0;
    const remaining = Math.max(0, DAILY_LIMIT - count);

    return NextResponse.json({
      count,
      remaining,
      limit: DAILY_LIMIT,
    });
  } catch (err) {
    console.error('Usage GET error:', err);
    return NextResponse.json({
      count: 0,
      remaining: DAILY_LIMIT,
      limit: DAILY_LIMIT,
    });
  }
}

export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = getTodayString();

  try {
    // 1. Fetch current count
    const { data, error: fetchErr } = await supabase
      .from('usage_logs')
      .select('action_count')
      .eq('user_id', userId)
      .eq('action_date', today)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.warn('Supabase fetch notice:', fetchErr.message);
    }

    const currentCount = data?.action_count || 0;

    // 2. Reject with 403 if count is already 5 or more
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "You've used today's 5 free actions. Upgrade to Pro for unlimited, or come back tomorrow.",
          count: currentCount,
          remaining: 0,
          limit: DAILY_LIMIT,
        },
        { status: 403 }
      );
    }

    const newCount = currentCount + 1;

    // 3. Upsert incremented count into usage_logs
    const { error: upsertErr } = await supabase.from('usage_logs').upsert(
      {
        user_id: userId,
        action_date: today,
        action_count: newCount,
      },
      { onConflict: 'user_id,action_date' }
    );

    if (upsertErr) {
      console.warn('Supabase upsert notice:', upsertErr.message);
    }

    const remaining = Math.max(0, DAILY_LIMIT - newCount);

    return NextResponse.json({
      count: newCount,
      remaining,
      limit: DAILY_LIMIT,
    });
  } catch (err) {
    console.error('Usage POST error:', err);
    return NextResponse.json({
      count: 1,
      remaining: 4,
      limit: DAILY_LIMIT,
    });
  }
}
