import type { Metadata, Viewport } from "next";
import Head from 'next/head';
import "./globals.css";
import Footer from "./footer";
import Header from "./header";
import { ThemeProvider } from "../theme-provider";
import { AuthModalProvider } from "@/app/contexts/AuthModalContext";
import AuthModal from "@/app/components/auth/AuthModal";
import AuthSessionProvider from "./session-provider";
import { CartProvider } from "@/app/contexts/CartContext";
import CartModal from "@/app/components/cart/CartModal";
import { PaymentProvider } from "@/app/contexts/PaymentContext";
import PaymentModal from "@/app/components/payment/PaymentModal";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { PurchasesModalProvider } from "@/app/contexts/PurchasesModalContext";
import PurchasesModal from "@/app/components/user/purchases/PurchasesModal";
import { UserProvider } from "@/app/contexts/UserContext"; // Import UserProvider
import { EditProfileModalProvider } from "@/app/contexts/EditProfileModalContext";
import EditProfileModal from "@/app/components/user/profile/EditProfileModal";
import OnboardingModal from "@/app/components/user/onboarding/OnboardingModal";
import UserSessionManager from "@/app/components/user/session/UserSessionManager";

export const metadata: Metadata = {
  title: "Ubunation",
  description: "Donate to Ubunation Today!",
  // Explicitly define your icons here
  icons: {
    icon: '/app/favicon.ico', // Standard favicon
    apple: '/app/apple-icon.png', // For Apple devices
  },
};

// It's also good practice to define the viewport for mobile devices
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
            <body>
        <AuthSessionProvider>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <UserProvider>
                <UserSessionManager />
                <AuthModalProvider>
                  <CartProvider>
                    <PurchasesModalProvider>
                      <EditProfileModalProvider> {/* Add EditProfileModalProvider */}
                        <PaymentProvider>
                          <div className="flex flex-col min-h-screen bg-background text-foreground">
                            <Header />
                            <main className="flex-grow container mx-auto p-6">
                                {children}
                            </main>
                            <Footer />
                            <AuthModal />
                            <CartModal />
                            <PaymentModal />
                            <PurchasesModal />
                            <EditProfileModal />
                            <OnboardingModal />
                          </div>
                        </PaymentProvider>
                      </EditProfileModalProvider>
                    </PurchasesModalProvider>
                  </CartProvider>
                </AuthModalProvider>
              </UserProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
