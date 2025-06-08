'use client'

import { resendConfirmationEmail } from '@/components/auth/actions';
import styles from "../auth.module.scss";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import React, { useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [state, formAction] = useFormState(resendConfirmationEmail, undefined);
  
  return (
      <form action={formAction}>
          <div>We send you an confirmation email, please check your mails</div>
          <input type="hidden" name="email" value={email?? undefined} />
          <span id="form-error" className={styles.formError} aria-live="polite" aria-atomic="true">
            {state?.message == "Confirmation envoyé avec succès." ? undefined : state?.message}
          </span>
          <span id="form-success" className={styles.formSuccess} aria-live="polite" aria-atomic="true">
          {state?.message !== "Confirmation envoyé avec succès." ? undefined : state?.message}
        </span>
          <ResendButton />
      </form>
  )
}

function ResendButton() {
    const { pending } = useFormStatus()
    const captcha = useRef<HCaptcha | null>(null)
  
  
    return (
      <>
        <HCaptcha ref={captcha} size='invisible' sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!} />
        <button className={styles.button} disabled={pending} onClick={async (e) => {
          e.preventDefault()
  
          await captcha.current?.execute({ async: true })
  
          requestAnimationFrame(() => {
            const button = e.target as HTMLButtonElement;
            const form = button.form
            form?.requestSubmit();
          });
        }}>
          {pending && <Loader2 className='spinner' />}
          {!pending && "Renvoyer"}
        </button>
      </>
    );
  }