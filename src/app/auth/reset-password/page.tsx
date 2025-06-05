"use client";

import { sendPasswordResetRequest } from "@/components/auth/actions";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import styles from "../auth.module.scss";
import { Loader2 } from 'lucide-react';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef } from "react";

export default function Page() {
  const [state, formAction] = useFormState(sendPasswordResetRequest, undefined);

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h3>Réinitialiser votre mot de passe</h3>
        <p className={styles.description}>Nous allons vous envoyez un lien de réinitialisation par e-mail.</p>
      </div>
      <form action={formAction} className={styles.form}>
        <label htmlFor="email" className={styles.label}>Email :</label>
        <input className={styles.input} type="text" id="email" name="email" placeholder="exemple@email.com" />
        <span id="email-error" className={styles.formError} aria-live="polite" aria-atomic="true">
          {state?.errors?.email?.[0] ?? " "}
        </span>

        <span id="form-error" className={styles.formError} aria-live="polite" aria-atomic="true">
          {state?.message !== "Un lien de réinitialisation vous a été envoyé par e-mail." ? state?.message : undefined}
        </span>

        <ResetButton />

        <span id="form-success" className={styles.formSuccess} aria-live="polite" aria-atomic="true">
          {state?.message !== "Un lien de réinitialisation vous a été envoyé par e-mail." ? undefined : state?.message}
        </span>
      </form>
      <Link href="/auth/login" className={styles.link}>
        Se connecter
      </Link>
    </div>
  );
}

function ResetButton() {
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
        {!pending && "Réinitialiser"}
      </button>
    </>
  );
}
