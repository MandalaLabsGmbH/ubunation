import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/app/hooks/useTranslation';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ForgotPage() {
const { translate } = useTranslation();

 return (
  <Card className='mx-auto max-w-sm border-0 shadow-none mt-4 sm:mt-12 sm:border sm:shadow-sm md:mt-20 lg:mt-24 xl:mt-28'>
   <CardHeader>
    
    <CardTitle className='text-2xl'>{translate("forgotPage-title-1")}</CardTitle>
    <CardDescription>{translate("forgotPage-description-1")}</CardDescription>
   </CardHeader>
   <CardContent>
    <div className='grid gap-4'>
     <div className='grid gap-2'>
      <Label htmlFor='email'>{translate("forgotPage-emailLabel-1")}</Label>
      <Input id='email' name='email' placeholder='m@example.com' />
     </div>
     <Button>{translate("forgotPage-sendButton-1")}</Button>
    </div>
    <div className='mt-4 text-center text-sm'>
     {translate("forgotPage-signInPrompt-1")}{' '}
     <Link href='/login' className='underline'>
      {translate("forgotPage-signInLink-1")}
     </Link>
    </div>
   </CardContent>
  </Card>
 )
}