import type { Metadata } from "next";
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
import { EditProfileModalProvider } from "@/app/contexts/EditProfileModalContext"; // Import EditProfileModalProvider
import EditProfileModal from "@/app/components/user/profile/EditProfileModal"; // Import EditProfileModal

export const metadata: Metadata = {
  title: "UBUNΛTION",
  description: "Donate with UBUNΛTION today!",
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
              <UserProvider> {/* Add UserProvider */}
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
                            <EditProfileModal /> {/* Add EditProfileModal */}
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
