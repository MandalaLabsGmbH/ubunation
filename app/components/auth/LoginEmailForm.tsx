'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/app/hooks/useTranslation';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { AuthError } from '@/app/_helpers/authErrors';
import { AuthMode } from '@/app/hooks/useAuthForm';

interface LoginEmailFormProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    loading: boolean;
    error: AuthError;
    setMode: (mode: AuthMode) => void;
    resetForm: () => void;
}

export default function LoginEmailForm({ onSubmit, loading, error, setMode, resetForm }: LoginEmailFormProps) {
    const { translate } = useTranslation();
    return (
         <form onSubmit={onSubmit}>
            <CardContent>
                <div className='grid gap-4'>
                    <div className='grid gap-2'>
                        <Label htmlFor='email'>{translate("loginEmailForm-emailLabel-1")}</Label>
                        <Input id='email' name='email' type='email' autoComplete='email' placeholder='m@example.com' required />
                    </div>
                    {loading ? (
                        <Button disabled className="w-full">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {translate("loginEmailForm-loadingButton-1")}
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full">{translate("loginEmailForm-submitButton-1")}</Button>
                    )}
                    {!!error && <p className="text-red-600 text-sm text-center">{error}</p>}
                </div>
                 <div className='mt-2 text-center text-sm'>
                    <Button variant="link" type="button" onClick={() => { resetForm(); setMode('login-password'); }}>
                        {translate("loginEmailForm-passwordLoginLink-1")}
                    </Button>
                </div>
                <div className='mt-1 text-center text-sm'>
                    {translate("loginEmailForm-registerPrompt-1")} {' '}
                    <Button variant="link" type="button" onClick={() => { resetForm(); setMode('register'); }}>
                        {translate("loginEmailForm-registerLink-1")}
                    </Button>
                </div>
            </CardContent>
        </form>
    );
}
