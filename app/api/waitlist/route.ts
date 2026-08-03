import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ email });

    if (error) {
      // If the email is already in the waitlist (unique constraint violation), it's fine.
      if (error.code !== '23505') {
        console.error('Waitlist insert error:', error.message);
        return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Waitlist API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
