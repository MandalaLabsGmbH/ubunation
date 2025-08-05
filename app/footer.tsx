import Link from 'next/link';
import { inter } from './fonts'; // Assuming you have fonts set up like this

export default function Footer() {
  const mainLinks = [
    { href: 'https://ubunation.com/', label: 'About', key: '1' },
    { href: 'https://ubunation.com/wlfa/?_gl=1*l81gcz*_ga*MTM5NDE1MDc2MS4xNzUzODk1NTYz*_ga_V408MXZKKQ*czE3NTM4OTU1NjIkbzEkZzEkdDE3NTM4OTU3MTIkajQ0JGwwJGgw', label: 'Vision', key: '2' },
    { href: 'https://ubunation.com/blog/', label: 'Blog', key: '3' },
    { href: 'https://ubunation.com/', label: 'Contact Us', key: '4' },
  ];

  const legalLinks = [
    { href: 'https://ubunation.com/imprint-content/', label: 'Imprint', key: '5' },
    { href: 'https://ubunation.com/terms-and-conditions/', label: 'Terms of Service', key: '6' },
    { href: 'https://ubunation.com/data-privacy-2/', label: 'Privacy', key: '7' },
  ];

  return (
    <footer className={`${inter.className} mt-16 border-t`}>
      <div className="container mx-auto px-6 py-8">
        {/* Top row with navigation links */}
        <div className="flex flex-col items-center justify-between gap-y-4 md:flex-row">
          {/* Main navigation links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground md:justify-start">
            {mainLinks.map((link) => (
              <Link key={link.key} href={link.href} target="_blank" className="hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
          {/* Legal navigation links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground md:justify-end">
            {legalLinks.map((link) => (
              <Link key={link.key} href={link.href} target="_blank" className="hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row with copyright */}
        <div className="mt-8 text-center text-sm text-foreground">
          <p>© UBUNΛTION 2025</p>
        </div>
      </div>
    </footer>
  );
}