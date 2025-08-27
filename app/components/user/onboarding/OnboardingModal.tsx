'use client'

import { useState, FormEvent, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { getAmplifyToken } from '@/app/_helpers/apiHelpers';

export default function OnboardingModal() {
    const { user, setUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formState, setFormState] = useState({
        firstName: '',
        lastName: '',
        country: '',
        username: ''
    });

    useEffect(() => {
        if (user && (user.userType === 'onboarding' || user.userType === 'unregistered')) {
            setIsOpen(true);
            setFormState({
                firstName: user.authData?.firstName || '',
                lastName: user.authData?.lastName || '',
                country: user.authData?.country || '',
                username: user.username || ''
            });
        } else {
            setIsOpen(false);
        }
    }, [user]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formState.firstName || !formState.lastName || !formState.country || !formState.username) {
            setError("All fields are required.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            // FIX: Construct the payload with the correct nested structure for authData.
            // This also safely handles cases where the initial user.authData might be null.
            const payload = {
                username: formState.username,
                userType: 'email',
                authData: {
                    ...(user?.authData || {}), // Preserve existing authData fields
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    country: formState.country,
                }
            };

            const token = await getAmplifyToken();
            const response = await fetch('/api/db/user', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload) // Send the correctly structured payload
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile.');
            }

            const updatedUser = await response.json();
            // The updatedUser will now have userType: 'email', so the modal will close
            // on the next render thanks to the useEffect hook.
            setUser(updatedUser);
            setIsOpen(false);

        } catch (err) {
             if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
            <Card className="relative bg-background rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Welcome to UBUNɅTION!</h2>
                    <p className="text-muted-foreground">Please tell us a few more things about yourself to get started.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" value={formState.firstName} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="lasttName">Last Name</Label>
                        <Input id="lastName" name="lastName" value={formState.lastName} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={formState.country} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formState.username} onChange={handleChange} required />
                    </div>
                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}