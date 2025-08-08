'use client'

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from "lucide-react";
import { cognitoConfirm } from '@/app/_helpers/registerHelper';

interface ConfirmRegisterFormProps {
    email: string;
    password: string;
    onSuccess: () => void; // Add onSuccess prop
}

// ... (your submitUserCollectible function can stay here)

export default function ConfirmRegisterForm({ email, password, onSuccess }: ConfirmRegisterFormProps) {
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setShowError(false);
        const formData = new FormData(e.currentTarget);
        const confCode = formData.get('confirmCode')?.toString() || '';

        try {
            await cognitoConfirm(email, confCode);
            // await submitUserCollectible(email); // You can keep this logic

            const loginResponse = await signIn("credentials", {
                username: email,
                password: password,
                redirect: false,
            });

            if (loginResponse?.error) {
                throw new Error("Login failed after confirmation.");
            } else {
                // Call the onSuccess function from the modal
                onSuccess();
            }
        } catch (error) {
            console.error("Confirmation or login error:", error);
            setLoading(false);
            setShowError(true);
        }
    }

    return (
       <form onSubmit={handleSubmit}>
            <Card className='w-full border-0 shadow-none'>
                <CardHeader>
                    <CardTitle className='text-xl'>Confirm your email</CardTitle>
                    <CardDescription>Enter the code from your email to finish signing up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='grid gap-4'>
                        <div className='grid gap-2'>
                            <Label htmlFor='confirmCode'>Confirmation Code</Label>
                            <Input id='confirmCode' name='confirmCode' placeholder='123456' required />
                        </div>
                        {!loading ? (
                            <Button className="w-full" type="submit">Confirm & Login</Button>
                        ) : (
                            <Button className="w-full" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        )}
                        {!!showError &&
                            <p className="text-sm font-medium text-destructive text-center">
                                Confirmation failed. Please check the code and try again.
                            </p>
                        }
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
