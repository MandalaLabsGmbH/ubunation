'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { inter } from './fonts';
import LogoutButton from './logout-button';
import { ThemeToggleButton } from './theme-toggle-button';
import { useAuthModal } from '@/app/contexts/AuthModalContext';
import { useCart } from '@/app/contexts/CartContext'; // Import the useCart hook
import { ShoppingCart } from 'lucide-react'; // Import an icon

export default function Header() {
  const { data: session } = useSession();
  const { openModal } = useAuthModal();
  const { openCart, itemCount } = useCart(); // Get cart functions and state

  return (
    <header className={`${inter.className} w-full py-4 border-b`}>
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="relative h-10 w-24">
            <div className="block dark:hidden">
              <Image src="/images/ubuLogoBlack.png" alt="UBU Logo" fill style={{ objectFit: 'contain' }} priority/>
            </div>
            <div className="hidden dark:block">
              <Image src="/images/ubuLogoWhite.png" alt="UBU Logo" fill style={{ objectFit: 'contain' }} priority/>
            </div>
          </div>
        </Link>

        <div className="flex items-center space-x-4 text-sm">
          {session ? (
            <LogoutButton />
          ) : (
            <button onClick={() => openModal('/')} className="font-semibold text-foreground/80 hover:text-foreground transition-colors">
              Login
            </button>
          )}

          {/* Shopping Cart Button */}
          <button onClick={openCart} className="relative text-foreground/80 hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <ThemeToggleButton />
        </div>
      </nav>
    </header>
  );
}
