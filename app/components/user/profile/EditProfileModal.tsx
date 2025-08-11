'use client'

import { useState, useEffect, FormEvent } from 'react';
import { getAmplifyToken } from '@/app/_helpers/apiHelpers';
import { useEditProfileModal } from '@/app/contexts/EditProfileModalContext';
import { useUser } from '@/app/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import the router

type FormState = {
    fullName: string;
    username: string;
    country: string;
    newsletter: boolean;
};

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function EditProfileModal() {
    const { isOpen, closeModal } = useEditProfileModal();
    const { user, setUser } = useUser();
    const router = useRouter(); // Initialize the router

    const [formState, setFormState] = useState<FormState>({
        fullName: '',
        username: '',
        country: '',
        newsletter: false,
    });
    const [status, setStatus] = useState<SubmissionStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormState({
                fullName: user.authData?.fullName || '',
                username: user.username || '',
                country: user.authData?.country || '',
                newsletter: user.authData?.newsletter === '1',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormState(prev => ({ ...prev, newsletter: checked }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const newAuthData = {
            ...(user?.authData || {}), // Start with existing data or an empty object
            fullName: formState.fullName,
            country: formState.country,
            newsletter: formState.newsletter ? '1' : '0',
        };

        const payload = {
            username: formState.username,
            authData: newAuthData
        };

        try {
            const token = await getAmplifyToken();
            if (!token) throw new Error("Authentication session not found.");

            const response = await fetch('/api/db/user', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile.');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setStatus('success');
            
            // The Fix: Refresh the page to show the updated data
            router.refresh();

            setTimeout(() => {
                closeModal();
                setStatus('idle');
            }, 1500);

        } catch (error) {
            console.error("Profile update error:", error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    const renderFormContent = () => {
        if (status === 'loading') {
            return <div className="text-center py-20"><Loader2 className="h-12 w-12 animate-spin mx-auto" /></div>;
        }
        if (status === 'success') {
            return <div className="text-center py-20"><CheckCircle className="h-16 w-16 text-green-500 mx-auto" /><p className="mt-4">Profile updated successfully!</p></div>;
        }
        if (status === 'error') {
            return <div className="text-center py-20"><XCircle className="h-16 w-16 text-destructive mx-auto" /><p className="mt-4 text-destructive">{errorMessage}</p><Button onClick={() => setStatus('idle')} className="mt-4">Try Again</Button></div>;
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formState.fullName} onChange={handleChange} placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={formState.username} onChange={handleChange} placeholder="e.g. johndoe24" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={formState.country} onChange={handleChange} placeholder="e.g. Germany" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <Label>Newsletter Opt-in</Label>
                        <p className="text-sm text-muted-foreground">Receive updates and news from UBUNATION.</p>
                    </div>
                    <Switch checked={formState.newsletter} onCheckedChange={handleSwitchChange} />
                </div>
                <Button type="submit" className="w-full">Submit</Button>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
            <Card className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-6 w-6" /></button>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                </div>
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {renderFormContent()}
                </div>
            </Card>
        </div>
    );
}
