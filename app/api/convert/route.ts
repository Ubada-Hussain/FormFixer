import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

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
  const { userId, sessionClaims } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isPro = sessionClaims?.metadata?.isPro === true;


  // Rate limiting (max 10 requests per minute per user)
  const { success } = rateLimit(userId, 10, 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { status: 429 }
    );
  }

  const today = getTodayString();

  // 1. Daily limit check (Bypass for Pro)
  if (!isPro) {
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
  }

  // 2. Parse uploaded file
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const target = formData.get('target') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File is too large. Maximum allowed size is 10MB.' },
      { status: 413 }
    );
  }

  const fileName = file.name || 'document';
  const nameLower = fileName.toLowerCase();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length < 4) {
    return NextResponse.json({ error: 'Invalid file format or empty file.' }, { status: 400 });
  }

  // Magic bytes checking
  const isPdfMagic = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
  const isOfficeXMagic = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04; // PK.. (.docx, .pptx, etc.)
  const isOfficeOldMagic = buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0; // OLE DOC (.doc, .ppt, etc.)

  const isPdf = isPdfMagic;
  const isOffice = isOfficeXMagic || isOfficeOldMagic;

  if (!isPdf && !isOffice) {
    return NextResponse.json(
      { error: 'Invalid file signature. Only authentic PDF, Word, or PowerPoint files are allowed.' },
      { status: 400 }
    );
  }

  // 3. Route to the correct backend service — no silent fallback
  let convertedBuffer: Buffer;
  let outputFilename: string;
  let contentType: string;

  if (isPdf) {
    const pdf2docxUrl = resolveServiceUrl(process.env.PDF2DOCX_URL);
    if (!pdf2docxUrl) {
      return NextResponse.json(
        {
          error:
            'PDF conversion service is not configured. ' +
            'Please deploy the pdf2docx microservice and add PDF2DOCX_URL to your environment.',
        },
        { status: 503 }
      );
    }

    const upstream = new FormData();
    upstream.append('file', new Blob([bytes], { type: 'application/pdf' }), fileName);

    let endpoint = `${pdf2docxUrl}/convert`;
    let targetFormatName = 'Word';
    
    if (target === 'powerpoint') {
      endpoint = `${pdf2docxUrl}/pdf-to-pptx`;
      targetFormatName = 'PowerPoint';
    }

    console.log(`[/api/convert] PDF→${targetFormatName} via`, endpoint, '| file:', fileName);

    const internalKey = process.env.INTERNAL_API_KEY || '';

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        body: upstream,
        signal: AbortSignal.timeout(120_000), // can be slow on first request
        headers: {
          'X-Internal-Key': internalKey,
        },
      });
    } catch (err) {
      const e = err as Error;
      console.error(`[/api/convert] pdf2docx service unreachable:`, e.message);
      return NextResponse.json(
        { error: `PDF-to-${targetFormatName} conversion service is temporarily unavailable. Please try again shortly.` },
        { status: 503 }
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '(no body)');
      console.error(`[/api/convert] pdf2docx service error`, res.status, errText);
      
      // Pass along RTL unsupported error specifically
      if (res.status === 400 && errText.includes('isRtlUnsupported')) {
        try {
          const errJson = JSON.parse(errText);
          return NextResponse.json(errJson, { status: 400 });
        } catch {
          // fallthrough
        }
      }
      
      return NextResponse.json(
        { error: `PDF-to-${targetFormatName} conversion failed. The file may be corrupted, encrypted, or too complex. Please try a different file.` },
        { status: 502 }
      );
    }

    convertedBuffer = Buffer.from(await res.arrayBuffer());
    if (target === 'powerpoint') {
      outputFilename = fileName.replace(/\.pdf$/i, '') + '-converted.pptx';
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else {
      outputFilename = fileName.replace(/\.pdf$/i, '') + '-converted.docx';
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  } else {
    // Office → PDF via Gotenberg
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

    let mimeType = 'application/octet-stream';
    if (nameLower.endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (nameLower.endsWith('.doc')) {
      mimeType = 'application/msword';
    } else if (nameLower.endsWith('.pptx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (nameLower.endsWith('.ppt')) {
      mimeType = 'application/vnd.ms-powerpoint';
    }

    const upstream = new FormData();
    upstream.append('files', new Blob([bytes], { type: mimeType }), fileName);

    const endpoint = `${gotenbergUrl}/forms/libreoffice/convert`;
    console.log('[/api/convert] Office→PDF via', endpoint, '| file:', fileName);

    const internalKey = process.env.INTERNAL_API_KEY || '';

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        body: upstream,
        signal: AbortSignal.timeout(60_000),
        headers: {
          'X-Internal-Key': internalKey,
        },
      });
    } catch (err) {
      const e = err as Error;
      console.error('[/api/convert] Gotenberg unreachable:', e.message);
      return NextResponse.json(
        { error: 'Document-to-PDF conversion service is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '(no body)');
      console.error('[/api/convert] Gotenberg error', res.status, errText);
      return NextResponse.json(
        { error: 'Document-to-PDF conversion failed. The file may be corrupted or in an unsupported format. Please try a different file.' },
        { status: 502 }
      );
    }

    convertedBuffer = Buffer.from(await res.arrayBuffer());
    outputFilename = fileName.replace(/\.(docx?|doc|pptx?|ppt)$/i, '') + '-converted.pdf';
    contentType = 'application/pdf';
  }

  // 4. Increment daily usage
  if (!isPro) {
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
