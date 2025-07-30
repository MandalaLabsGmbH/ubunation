'use client'

import { signOut } from "next-auth/react"

export default function LogoutButton() {
    const handleLogout = () => {
        // The Fix: Add a confirmation dialog before signing out.
        if (window.confirm("Are you sure you want to sign out?")) {
            signOut({ callbackUrl: '/' });
        }
    };

    return (
        // The button is now styled to look like a standard dropdown item.
        <button 
            onClick={handleLogout}
            className="w-full text-left"
        >
            Log Out
        </button>
    )
}
