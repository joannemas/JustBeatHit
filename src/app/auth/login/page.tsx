"use client";

import { login } from "@/components/auth/actions";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { z } from "zod";
import styles from "../auth.module.scss"; // ✅ Import du CSS module

const loginForm = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
});

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

  return (
    <button className={styles.button} disabled={pending}>
      Connexion
    </button>
  );
}
