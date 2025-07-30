'use client'

import Link from 'next/link';
import { usePurchasesModal } from '@/app/contexts/PurchasesModalContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { useState } from 'react';
import LogoutButton from '../../logout-button';

export default function UserDropdown() {
  const { openModal } = usePurchasesModal();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenPurchases = () => {
    // Close the dropdown first, then open the modal after a short delay
    setIsOpen(false);
    setTimeout(() => {
      openModal();
    }, 150);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/collectibles">My Collectibles</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenPurchases}>
          Purchases
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* The Fix: Add the LogoutButton as an item in the dropdown */}
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
