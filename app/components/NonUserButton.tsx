'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface UserButtonProps {
    label: string;
    route: string;
    isLink?: boolean;
}

export default function UserButton({ label, route, isLink }: UserButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (isLink) {
      // Open external links in a new tab for security and better user experience.
      window.open(route, '_blank', 'noopener,noreferrer');
    } else {
      // Navigate to internal links directly without checking for a session.
      router.push(route);
    }
  }

  return (
    <Button onClick={handleClick} className="w-50 bg-orange-500 hover:bg-orange-600 px-8 py-3 text-med font-semibold shadow-lg transition-transform transform hover:scale-105">
      {label}
    </Button>
  )
}