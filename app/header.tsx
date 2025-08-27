'use client'

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { inter } from './fonts';
import { ThemeToggleButton } from './theme-toggle-button';
import { useAuthModal } from '@/app/contexts/AuthModalContext';
import { useCart } from '@/app/contexts/CartContext';
import { ShoppingCart, Menu } from 'lucide-react';
import LanguageSelector from '@/app/components/LanguageSelector';
import { useTranslation } from '@/app/hooks/useTranslation';
import UserDropdown from '@/app/components/user/UserDropdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { data: session } = useSession();
  const { openModal } = useAuthModal();
  const { openCart, itemCount } = useCart();
  const { translate } = useTranslation();
  const pathname = usePathname(); // Hook to get the current URL path

  // Define the navigation links in an array for easier management
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: 'https://ubunation.com/', label: 'Projects' },
    { href: 'https://ubunation.com/', label: 'About' },
    { href: 'https://ubunation.com/', label: 'Contact' },
  ];

  return (
    <header className={`${inter.className} w-full py-4 border-b`}>
      <nav className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <div className="relative h-10 w-24">
              <div className="relative h-10 block dark:hidden">
                <Image src="/images/ubuLogoBlack.png" alt="UBU Logo" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'contain' }} priority/>
              </div>
              <div className="relative h-10 hidden dark:block">
                <Image src="/images/ubuLogoWhite.png" alt="UBU Logo" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'contain' }} priority/>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex justify-center items-center space-x-8 flex-1">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href}
              // Open external links in a new tab
              target={link.href.startsWith('http') ? '_blank' : '_self'}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
              // Apply underline style if it's the active 'Home' link
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary underline underline-offset-4' : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side: Icons and Mobile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={openCart} className="relative text-foreground/80 hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          
          <LanguageSelector />

          {/* Theme toggle is visible on desktop here */}
          <div className="hidden md:block">
            <ThemeToggleButton />
          </div>

          {session ? (
            <UserDropdown />
          ) : (
            <button onClick={() => openModal({ redirectUrl: '/' })} className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
              {translate('login')}
            </button>
          )}

          {/* Hamburger Menu (visible on mobile) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link 
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {/* Theming is an item inside the mobile menu */}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between">
                  <span>Theme</span>
                  <ThemeToggleButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
}