"use client"

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { register } from "@/components/auth/actions";
import styles from '../auth.module.scss'
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef } from 'react';

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, undefined)

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h3>Inscription</h3>
        <p className={styles.description}>Créez un compte avec un email et un mot de passe.</p>
      </div>
      <form className={styles.form} action={formAction} aria-describedby="form-error">
        {/* Email field */}
        <label className={styles.label} htmlFor="email">Email</label>
        <input className={styles.input} type="text" id="email" name="email" placeholder="exemple@email.com" aria-describedby="email-error" />
        <span id="email-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.errors?.email ? state.errors?.email[0] : " "}</span>
        {/* Username field */}
        <label className={styles.label} htmlFor="username">Nom d&apos;utilisateur</label>
        <input className={styles.input} type="text" id="username" name="username" placeholder="JohnDoe" aria-describedby="username-error" />
        <span id="username-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.errors?.username ? state.errors?.username[0] : " "}</span>
        {/* Password field */}
        <label className={styles.label} htmlFor="password">Mot de passe</label>
        <input className={styles.input} type="password" id="password" name="password" placeholder="Créez un mot de passe" aria-describedby="password-error" />
        <span id="password-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.errors?.password ? state.errors?.password[0] : " "}</span>
        {/* Repeat password field */}
        <label className={styles.label} htmlFor="repeat-password">Confirmez le mot de passe</label>
        <input className={styles.input} type="password" id="repeat-password" name="repeatPassword" placeholder="Confirmez votre mot de passe" aria-describedby="repeatpassword-error" />
        <span id="repeatpassword-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.errors?.repeatPassword ? state.errors?.repeatPassword[0] : " "}</span>

        <span id="form-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.message}</span>
        <SignUpButton />
      </form>
      <Link href="/auth/login" className={styles.link}>Vous avez déjà un compte ? Connectez-vous ici.</Link>
    </div>
  )
}

function SignUpButton() {
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
        {!pending && "S'inscrire"}
      </button>
    </>
  )
}
