'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/app/contexts/AuthModalContext'
import { Button } from '@/components/ui/button'

interface UserButtonProps {
    label: string;
    route: string;
    isLink?: boolean;
}

export default function UserButton({ label, route, isLink }: UserButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { openModal } = useAuthModal()

  const handleClick = () => {
    if (session && !isLink) {
      // If the user is logged in, redirect them directly to the purchase page.
      router.push(route)
    }
    else if (session && isLink) {
      window.open(route, '_blank');
    } else {
      // If the user is not logged in, open the login modal and tell it
      // to redirect to '/purchase' on successful login.
      openModal({ redirectUrl: route });
    }
  }

  return (
    <Button onClick={handleClick} className="w-full bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105">
      {label}
    </Button>
  )
}
