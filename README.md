# FormFit

FormFit is a free, ad-free web app that fixes files so they match exactly what a scholarship or admission portal demands. It exists because the tools people currently use for this — random online compressors — are full of ads, unreliable, or quietly expensive, even though the task itself (resize a photo to 200×230px under 200KB, or turn a PDF into a Word file) should take seconds.

## What it does

- **Compress**: Upload a photo and set a target file size and pixel dimensions, or pick a portal preset (UGC scholarship, Common App, JEE Mains, and more) to auto-fill the exact spec. Compression runs entirely in the browser via the Canvas API, so images never leave the user's device.
- **Convert**: Combine images into a single PDF client-side, or convert between PDF and Word. Basic conversion is free; high-fidelity conversion for complex, table-heavy documents is a paid feature powered by a server-side engine (LibreOffice via Gotenberg).
- **Presets library**: A searchable, growing list of scholarship and admission portals with their exact upload requirements, so users don't have to hunt for the spec themselves.

## Why it's different

- No ads on any plan, free or paid
- Client-side processing for compression, so files stay private and results are instant
- Honest freemium split: the free tier covers what most applications actually need; payment is only required for pixel-accurate document conversion
- Built around real portal requirements rather than generic "compress by X%" sliders

## Tech stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Compression**: Canvas API / browser-image-compression (client-side)
- **Document conversion**: LibreOffice headless via Gotenberg, self-hosted
- **Storage**: Cloudflare R2
- **Auth**: Clerk
- **Database**: Supabase (Postgres)
- **Payments**: Stripe
- **Hosting**: Vercel (frontend), Railway/Fly.io (conversion workers)

## Status

Early-stage build. The compressor and images-to-PDF converter are functional; high-fidelity document conversion, accounts, and the saved-documents "Application Kit" are in progress.

## Contributing

Issues and pull requests are welcome, especially additions to the portal presets library — if you know a scholarship or admission portal's exact photo/document requirements, open a PR.
