'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/compress', label: 'Compress' },
  { href: '/convert',  label: 'Convert'  },
  { href: '/presets',  label: 'Presets'  },
  { href: '/pricing',  label: 'Pricing'  },
  { href: '/about',    label: 'About'    },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav>
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="mark" />
          FormFit
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

        <div className="navcta">
          <Link href="/pricing" className="btn btn-ghost btn-sm">
            Pricing
          </Link>
          <Link href="/compress" className="btn btn-primary btn-sm">
            Fix a file free
          </Link>
        </div>
      </div>
    </nav>
  );
}
