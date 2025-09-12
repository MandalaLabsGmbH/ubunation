'use client'

import Link from 'next/link';
import { useTranslation } from '@/app/hooks/useTranslation';
import { inter } from './fonts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react'; // Import the spinner icon

// SVG components for social media icons for better styling control
const FacebookIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const TwitterXIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm6.5-3c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" clipRule="evenodd" />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);


export default function Footer() {
  const { translate } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed.');
      }

      alert(translate("footer-subscribe-successMessage"));
      setEmail('');
      setStatus('idle');

    } catch (error) {
      console.error(error);
      alert(translate("footer-subscribe-errorMessage"));
      setStatus('idle');
    }
  };

  const legalLinks = [
    { href: 'https://ubunation.com/imprint-content/', label: translate("footer-imprintLink-1"), key: '5' },
    { href: 'https://ubunation.com/terms-and-conditions/', label: translate("footer-termsLink-1"), key: '6' },
  ];

  const socialLinks = [
    { href: 'https://www.facebook.com/ubunation', icon: <FacebookIcon />, label: translate("footer-facebookLabel-1") },
    { href: 'https://x.com/ubunationhq', icon: <TwitterXIcon />, label: translate("footer-twitterLabel-1") },
    { href: 'https://www.instagram.com/ubunation/', icon: <InstagramIcon />, label: translate("footer-instagramLabel-1") },
    { href: 'https://www.linkedin.com/company/ubunation/', icon: <LinkedInIcon />, label: translate("footer-linkedInLabel-1") },
  ];

  return (
    <footer className={`${inter.className} bg-card border-t bg-sky-800`}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-y-8 lg:gap-y-4">
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
            {legalLinks.map((link) => (
              <Link key={link.key} href={link.href} target="_blank" className="hover:text-primary transition-colors text-white">
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex justify-center gap-x-6">
            {socialLinks.map((social) => (
              <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary transition-colors text-white">
                <span className="sr-only">{social.label}</span>
                {social.icon}
              </Link>
            ))}
          </div>

          <form 
            onSubmit={handleSubmit}
            className="flex max-w-med items-center space-x-2"
          >
            <Label htmlFor="email" className="text-white">{translate("footer-newsletterLabel-1")}</Label>
            <Input 
              id="email"
              type="email"
              name="email"
              placeholder="Email" 
              className="bg-background" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
            />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translate("footer-subscribeButton-loading")}
                </>
              ) : (
                translate("footer-subscribeButton-1")
              )}
            </Button>
          </form>

        </div>

        <div className="text-white mt-8 text-center text-sm text-foreground/60">
          <p>{translate("footer-copyright-1")}</p>
        </div>
      </div>
    </footer>
  );
}