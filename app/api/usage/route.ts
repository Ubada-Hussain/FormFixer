import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DAILY_CREDITS = 5000;

/**
 * Returns today's date string in PKT (UTC+5) timezone.
 * Resets at midnight Pakistan Standard Time.
 */
function getTodayPKT(): string {
  const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5
  const nowPKT = new Date(Date.now() + PKT_OFFSET_MS);
  return nowPKT.toISOString().split('T')[0];
}

export async function GET() {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isPro = sessionClaims?.metadata?.isPro === true;

  if (isPro) {
    return NextResponse.json({
      credits_used: 0,
      credits_remaining: DAILY_CREDITS,
      daily_limit: DAILY_CREDITS,
      remaining: DAILY_CREDITS, // backwards compat
      limit: DAILY_CREDITS,
      isPro: true,
    });
  }

  const today = getTodayPKT();

  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('credits_used')
      .eq('user_id', userId)
      .eq('action_date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase fetch notice:', error.message);
    }

    const creditsUsed = data?.credits_used ?? 0;
    const creditsRemaining = Math.max(0, DAILY_CREDITS - creditsUsed);

    return NextResponse.json({
      credits_used: creditsUsed,
      credits_remaining: creditsRemaining,
      daily_limit: DAILY_CREDITS,
      remaining: creditsRemaining, // backwards compat
      limit: DAILY_CREDITS,
    });
  } catch (err) {
    console.error('Usage GET error:', err);
    return NextResponse.json({
      credits_used: 0,
      credits_remaining: DAILY_CREDITS,
      daily_limit: DAILY_CREDITS,
      remaining: DAILY_CREDITS,
      limit: DAILY_CREDITS,
    });
  }
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isPro = sessionClaims?.metadata?.isPro === true;

  if (isPro) {
    return NextResponse.json({
      credits_used: 0,
      credits_remaining: DAILY_CREDITS,
      daily_limit: DAILY_CREDITS,
      remaining: DAILY_CREDITS,
      limit: DAILY_CREDITS,
      isPro: true,
    });
  }

  // Parse the credit cost from the request body
  let cost = 300; // safe default minimum
  try {
    const body = await request.json();
    if (typeof body?.cost === 'number' && body.cost > 0) {
      cost = Math.round(body.cost);
    }
  } catch {
    // no body or non-JSON body — use default
  }

  const today = getTodayPKT();

  try {
    // 1. Fetch current credits used
    const { data, error: fetchErr } = await supabase
      .from('usage_logs')
      .select('credits_used')
      .eq('user_id', userId)
      .eq('action_date', today)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.warn('Supabase fetch notice:', fetchErr.message);
    }

    const currentUsed = data?.credits_used ?? 0;
    const currentRemaining = Math.max(0, DAILY_CREDITS - currentUsed);

    // 2. Reject if insufficient credits
    if (currentRemaining < cost) {
      return NextResponse.json(
        {
          error: `Not enough credits. This action costs ${cost} credits, but you only have ${currentRemaining} remaining today. Your credits reset at midnight PKT.`,
          credits_used: currentUsed,
          credits_remaining: currentRemaining,
          daily_limit: DAILY_CREDITS,
          cost,
        },
        { status: 403 }
      );
    }

    const newUsed = currentUsed + cost;

    // 3. Upsert the new credits_used value
    const { error: upsertErr } = await supabase.from('usage_logs').upsert(
      {
        user_id: userId,
        action_date: today,
        credits_used: newUsed,
        // Keep action_count for any legacy reads (set to 1 as a heartbeat)
        action_count: 1,
      },
      { onConflict: 'user_id,action_date' }
    );

    if (upsertErr) {
      console.warn('Supabase upsert notice:', upsertErr.message);
    }

    const newRemaining = Math.max(0, DAILY_CREDITS - newUsed);

    return NextResponse.json({
      credits_used: newUsed,
      credits_remaining: newRemaining,
      daily_limit: DAILY_CREDITS,
      cost,
      remaining: newRemaining, // backwards compat
      limit: DAILY_CREDITS,
    });
  } catch (err) {
    console.error('Usage POST error:', err);
    return NextResponse.json({
      credits_used: cost,
      credits_remaining: DAILY_CREDITS - cost,
      daily_limit: DAILY_CREDITS,
      cost,
      remaining: DAILY_CREDITS - cost,
      limit: DAILY_CREDITS,
    });
  }
}
