'use client'

import { useState, FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Loader2, X, CheckCircle, XCircle } from 'lucide-react';

interface BecomeVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeVoiceModal({ isOpen, onClose }: BecomeVoiceModalProps) {
  const { translate } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    socialFollowers: '',
    socialLink: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };
  
  const handleClose = () => {
      // Reset form state when closing
      setFormData({ name: '', socialFollowers: '', socialLink: '', email: '' });
      setStatus('idle');
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <Card className="relative bg-background rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
        </button>

        {status === 'success' ? (
            <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p>{translate("becomeVoiceModal-successMessage-1")}</p>
                <Button onClick={handleClose} className="mt-6">{translate("becomeVoiceModal-okButton-1")}</Button>
            </div>
        ) : status === 'error' ? (
             <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <p>{translate("becomeVoiceModal-errorMessage-1")}</p>
                <Button onClick={handleClose} className="mt-6">{translate("becomeVoiceModal-okButton-1")}</Button>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-center mb-6">{translate("becomeVoiceModal-title-1")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">{translate("becomeVoiceModal-nameLabel-1")}</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="socialFollowers">{translate("becomeVoiceModal-followersLabel-1")}</Label>
                        <Input id="socialFollowers" name="socialFollowers" value={formData.socialFollowers} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="socialLink">{translate("becomeVoiceModal-linkLabel-1")}</Label>
                        <Input id="socialLink" name="socialLink" value={formData.socialLink} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="email">{translate("becomeVoiceModal-emailLabel-1")}</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={status === 'loading'}>
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {translate("becomeVoiceModal-sendingButton-1")}
                            </>
                        ) : (
                            translate("becomeVoiceModal-sendButton-1")
                        )}
                    </Button>
                </form>
            </>
        )}
      </Card>
    </div>
  );
}