'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const NAV_LINKS = [
  { href: '/compress', label: 'Compress' },
  { href: '/convert',  label: 'Convert'  },
  { href: '/presets',  label: 'Presets'  },
  { href: '/pricing',  label: 'Pricing'  },
  { href: '/about',    label: 'About'    },
];

export default function Navbar() {
  const pathname = usePathname();
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('YOUR_PUBLISHABLE_KEY')
  );

  return (
    <nav>
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="mark" />
          FormFixer
        </Link>

        <div className="navlinks">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navcta flex items-center gap-3">
          {hasValidClerkKey ? (
            <>
              <SignedOut>
                <Link href="/sign-in" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link href="/compress" className="btn btn-primary btn-sm">
                  Fix a file free
                </Link>
              </SignedOut>

              <SignedIn>
                <Link href="/compress" className="btn btn-ghost btn-sm">
                  Compress
                </Link>
                <UserButton
                  fallbackRedirectUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 border border-[#e2ded6] shadow-sm',
                    },
                  }}
                />
              </SignedIn>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link href="/compress" className="btn btn-primary btn-sm">
                Fix a file free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
