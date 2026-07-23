import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DAILY_LIMIT = 5;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Return a normalised base URL (no trailing slash), or null if not configured. */
function resolveServiceUrl(envVar: string | undefined): string | null {
  const val = envVar?.trim();
  if (!val || !val.startsWith('http') || val.includes('your-') || val.includes('placeholder')) {
    return null;
  }
  return val.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = getTodayString();

  // 1. Daily limit check
  try {
    const { data: usageData, error: fetchErr } = await supabase
      .from('usage_logs')
      .select('action_count')
      .eq('user_id', userId)
      .eq('action_date', today)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.warn('Supabase fetch notice:', fetchErr.message);
    }

    const currentCount = usageData?.action_count || 0;
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error:
            "You've used today's 5 free actions. Upgrade to Pro for unlimited, or come back tomorrow.",
          count: currentCount,
          remaining: 0,
          limit: DAILY_LIMIT,
        },
        { status: 403 }
      );
    }
  } catch (err) {
    console.error('Usage check error:', err);
  }

  // 2. Parse uploaded file
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const fileName = file.name || 'document';
  const nameLower = fileName.toLowerCase();
  const isPdf = nameLower.endsWith('.pdf');
  const isWord = nameLower.endsWith('.docx') || nameLower.endsWith('.doc');

  if (!isPdf && !isWord) {
    return NextResponse.json(
      { error: 'Unsupported format. Please upload a PDF or Word (.docx) file.' },
      { status: 400 }
    );
  }

  // 3. Route to the correct backend service — no silent fallback
  let convertedBuffer: Buffer;
  let outputFilename: string;
  let contentType: string;

  if (isPdf) {
    // PDF → Word via pdf2docx microservice
    const pdf2docxUrl = resolveServiceUrl(process.env.PDF2DOCX_URL);
    if (!pdf2docxUrl) {
      return NextResponse.json(
        {
          error:
            'PDF-to-Word conversion service is not configured. ' +
            'Please deploy the pdf2docx microservice and add PDF2DOCX_URL to your environment.',
        },
        { status: 503 }
      );
    }

    const upstream = new FormData();
    const bytes = await file.arrayBuffer();
    upstream.append('file', new Blob([bytes], { type: 'application/pdf' }), fileName);

    const endpoint = `${pdf2docxUrl}/convert`;
    console.log('[/api/convert] PDF→DOCX via', endpoint, '| file:', fileName);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        body: upstream,
        signal: AbortSignal.timeout(120_000), // pdf2docx can be slow on first request
      });
    } catch (e: any) {
      console.error('[/api/convert] pdf2docx service unreachable:', e.message);
      return NextResponse.json(
        { error: 'PDF-to-Word conversion service is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '(no body)');
      console.error('[/api/convert] pdf2docx service error', res.status, errText);
      return NextResponse.json(
        { error: `PDF-to-Word conversion failed (service error ${res.status}): ${errText}` },
        { status: 502 }
      );
    }

    convertedBuffer = Buffer.from(await res.arrayBuffer());
    outputFilename = fileName.replace(/\.pdf$/i, '') + '-converted.docx';
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else {
    // Word → PDF via Gotenberg
    const gotenbergUrl = resolveServiceUrl(process.env.GOTENBERG_URL);
    if (!gotenbergUrl) {
      return NextResponse.json(
        {
          error:
            'Word-to-PDF conversion service is not configured. ' +
            'Please deploy Gotenberg and add GOTENBERG_URL to your environment.',
        },
        { status: 503 }
      );
    }

    const mimeType = nameLower.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/msword';

    const upstream = new FormData();
    const bytes = await file.arrayBuffer();
    upstream.append('files', new Blob([bytes], { type: mimeType }), fileName);

    const endpoint = `${gotenbergUrl}/forms/libreoffice/convert`;
    console.log('[/api/convert] DOCX→PDF via', endpoint, '| file:', fileName);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        body: upstream,
        signal: AbortSignal.timeout(60_000),
      });
    } catch (e: any) {
      console.error('[/api/convert] Gotenberg unreachable:', e.message);
      return NextResponse.json(
        { error: 'Word-to-PDF conversion service is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '(no body)');
      console.error('[/api/convert] Gotenberg error', res.status, errText);
      return NextResponse.json(
        { error: `Word-to-PDF conversion failed (Gotenberg ${res.status}): ${errText}` },
        { status: 502 }
      );
    }

    convertedBuffer = Buffer.from(await res.arrayBuffer());
    outputFilename = fileName.replace(/\.(docx?|doc)$/i, '') + '-converted.pdf';
    contentType = 'application/pdf';
  }

  // 4. Increment daily usage
  try {
    const { data: latestData } = await supabase
      .from('usage_logs')
      .select('action_count')
      .eq('user_id', userId)
      .eq('action_date', today)
      .maybeSingle();

    await supabase.from('usage_logs').upsert(
      {
        user_id: userId,
        action_date: today,
        action_count: (latestData?.action_count || 0) + 1,
      },
      { onConflict: 'user_id,action_date' }
    );
  } catch (err) {
    console.warn('Supabase usage increment error:', err);
  }

  // 5. Stream converted file back to browser
  return new NextResponse(new Uint8Array(convertedBuffer), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': convertedBuffer.length.toString(),
    },
  });
}
