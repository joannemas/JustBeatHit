"use client"

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { registerAnonyme } from "@/components/auth/actions";
import styles from '../auth.module.scss'

export default function RegisterAnonymePage() {
  const [state, formAction] = useFormState(registerAnonyme, undefined)

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

        <span id="form-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.message}</span>
        <SignUpButton />
      </form>
      <Link href="/auth/login" className={styles.link}>Vous avez déjà un compte ? Connectez-vous ici.</Link>
    </div>
  )
}

function SignUpButton() {
  const { pending } = useFormStatus()

  return (
    <>
      <button className={styles.button} disabled={pending}>
        {pending && <Loader2 className='spinner' />}
        {!pending && "S'inscrire"}
      </button>
    </>
  )
}
