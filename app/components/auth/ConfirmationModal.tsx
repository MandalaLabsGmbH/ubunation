'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react";
import { useTranslation } from '@/app/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthError } from '@/app/_helpers/authErrors';

interface ConfirmationModalProps {
    isOpen: boolean;
    isConfirming: boolean;
    email: string;
    code: string;
    setCode: (code: string) => void;
    error: AuthError;
    onConfirm: () => void;
    onBack: () => void;
    isAlertOpen: boolean;
    setIsAlertOpen: (isOpen: boolean) => void;
    onStartOver: () => void;
}

export default function ConfirmationModal({ 
    isOpen, 
    isConfirming, 
    email, 
    code, 
    setCode, 
    error, 
    onConfirm, 
    onBack,
    isAlertOpen,
    setIsAlertOpen,
    onStartOver
}: ConfirmationModalProps) {
      const { translate } = useTranslation();
    return (
        <>
            <Dialog open={isOpen}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{translate("confirmationModal-title-1")}</DialogTitle>
                        <DialogDescription>
                            {translate("confirmationModal-description-1")}  {email} {translate("confirmationModal-description-2")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">{translate("confirmationModal-codeLabel-1")}</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="col-span-3"
                                placeholder='123456'
                            />
                        </div>
                        {!!error && <p className="text-red-600 text-sm col-span-4 text-center">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onBack} disabled={isConfirming}>{translate("confirmationModal-backButton-1")}</Button>
                        {isConfirming ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {translate("confirmationModal-confirmingButton-1")} 
                            </Button>
                        ) : (
                            <Button onClick={onConfirm}>{translate("confirmationModal-confirmButton-1")}</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{translate("confirmationModal-alertTitle-1")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {translate("confirmationModal-alertDescription-1")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>{translate("confirmationModal-alertCancel-1")}</AlertDialogCancel>
                        <AlertDialogAction onClick={onStartOver}>{translate("confirmationModal-alertAction-1")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}