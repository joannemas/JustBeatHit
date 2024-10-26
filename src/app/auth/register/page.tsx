"use client"

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { register } from "@/app/components/auth/actions";

export default function Page() {
  const [state, formAction] = useFormState(register, undefined)

  return (
    <div className="form-container">
      <div className='form-header'>
        <h3>Register</h3>
        <p className="description">Provide email and password to create an account</p>
      </div>
      <form action={formAction} aria-describedby="form-error">
        {/* Email field */}
        <label htmlFor="email">Email</label>
        <input type="text" id="email" name="email" placeholder="exemple@email.com" aria-describedby="email-error" />
        <span id="email-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.email ? state.errors?.email[0] : " "}</span>
        {/* Username field */}
        <label htmlFor="email">Username</label>
        <input type="text" id="username" name="username" placeholder="JohnDoe" aria-describedby="email-error" />
        <span id="email-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.username ? state.errors?.username[0] : " "}</span>
        {/* Password field */}
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Create password" aria-describedby="password-error" />
        <span id="password-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.password ? state.errors?.password[0] : " "}</span>
        {/* Repeat password field */}
        <label htmlFor="repeat-Password">Repeat password</label>
        <input type="password" id="repeat-password" name="repeatPassword" placeholder="Repeat your password" aria-describedby="repeatpassword-error" />
        <span id="repeatPassword-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.errors?.repeatPassword ? state.errors?.repeatPassword[0] : " "}</span>

        <span id="form-error" className="form-error" aria-live="polite" aria-atomic="true">{state?.message}</span>
        <SignUpButton />
      </form>
      <Link href="/auth/login" className="link">Already have an account? Sign in here.</Link>
    </div>
  )
}

function SignUpButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <Loader2 className='spinner' />}
      {!pending && "Register"}
    </button>
  )
}

