'use client'

import { signOut } from "next-auth/react"
import { useTranslation } from '@/app/hooks/useTranslation';

export default function LogoutButton() {
    const { translate } = useTranslation();
    const handleLogout = () => {
        // The Fix: Add a confirmation dialog before signing out.
        if (window.confirm(translate("logoutButton-confirm-1"))) {
            signOut({ callbackUrl: '/' });
        }
    };

    return (
        // The button is now styled to look like a standard dropdown item.
        <button 
            onClick={handleLogout}
            className="w-full text-left"
        >
            {translate("logoutButton-logOut-1")}
        </button>
    )
}
