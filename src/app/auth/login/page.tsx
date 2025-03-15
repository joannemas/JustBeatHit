"use client";

import { login } from "@/components/auth/actions";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import styles from "../auth.module.scss";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const [state, formAction] = useFormState(login, undefined);

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h3>Connexion</h3>
        <p className={styles.description}>Connectez-vous avec un email et un mot de passe.</p>
      </div>
      <form action={formAction} className={styles.form}>
        <label htmlFor="email" className={styles.label}>Email :</label>
        <input className={styles.input} type="text" id="email" name="email" placeholder="exemple@email.com" />
        <span id="email-error" className={styles.formError} aria-live="polite" aria-atomic="true">
          {state?.errors?.email?.[0] ?? " "}
        </span>

        <label htmlFor="password" className={styles.label}>Mot de passe :</label>
        <input className={styles.input} type="password" id="password" name="password" placeholder="Tapez votre mot de passe" />
        <span id="repeatPassword-error" className={styles.formError} aria-live="polite" aria-atomic="true">
          {state?.errors?.password?.[0] ?? " "}
        </span>

        <span id="form-error" className={styles.formError} aria-live="polite" aria-atomic="true">
          {state?.message}
        </span>

        <LoginButton />
      </form>

      <Link href="/auth/register" className={styles.link}>
        Vous n&apos;avez pas encore de compte ? Inscrivez-vous ici.
      </Link>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
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
        {!pending && "Connexion"}
      </button>
    </>
  );
}
