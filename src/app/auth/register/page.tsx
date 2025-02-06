"use client"

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { register } from "@/components/auth/actions";

export default function Page() {
  const [state, formAction] = useFormState(register, undefined)

  return (
    <div className="form-container">
      <div className='form-header'>
        <h3>Inscription</h3>
        <p className="description">Créez un compte avec un email et un mot de passe.</p>
      </div>
      <form action={formAction} aria-describedby="form-error">
        {/* Email field */}
        <label htmlFor="email">Email</label>
        <input type="text" id="email" name="email" placeholder="exemple@email.com" aria-describedby="email-error" />
        <span id="email-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.email ? state.errors?.email[0] : " "}</span>
        {/* Username field */}
        <label htmlFor="username">Nom d&apos;utilisateur</label>
        <input type="text" id="username" name="username" placeholder="JohnDoe" aria-describedby="username-error" />
        <span id="username-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.username ? state.errors?.username[0] : " "}</span>
        {/* Password field */}
        <label htmlFor="password">Mot de passe</label>
        <input type="password" id="password" name="password" placeholder="Créez un mot de passe" aria-describedby="password-error" />
        <span id="password-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.password ? state.errors?.password[0] : " "}</span>
        {/* Repeat password field */}
        <label htmlFor="repeat-password">Confirmez le mot de passe</label>
        <input type="password" id="repeat-password" name="repeatPassword" placeholder="Confirmez votre mot de passe" aria-describedby="repeatpassword-error" />
        <span id="repeatpassword-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.repeatPassword ? state.errors?.repeatPassword[0] : " "}</span>

        <span id="form-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.message}</span>
        <SignUpButton />
      </form>
      <Link href="/auth/login" className="link">Vous avez déjà un compte ? Connectez-vous ici.</Link>
    </div>
  )
}

function SignUpButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <Loader2 className='spinner' />}
      {!pending && "S'inscrire"}
    </button>
  )
}
