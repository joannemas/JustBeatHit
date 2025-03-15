"use client";

import { createPassword } from "@/components/auth/actions";
import { useFormState, useFormStatus } from "react-dom";
import styles from "../auth.module.scss";
import { Loader2 } from 'lucide-react';

export default function Page() {
    const [state, formAction] = useFormState(createPassword, undefined);

    return (
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h3>Créez votre mot de passe</h3>
                <p className={styles.description}>Votre mot de passe doit comporter au moins 8 caractères, dont au moins un caractère spécial, une majuscule, une minuscule et un chiffre.</p>
            </div>
            <form action={formAction} className={styles.form}>
                {/* Password field */}
                <label className={styles.label} htmlFor="password">Mot de passe</label>
                <input className={styles.input} type="password" id="password" name="password" placeholder="Créez un mot de passe" aria-describedby="password-error" />
                <span id="password-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.errors?.password ? state.errors?.password[0] : " "}</span>
                {/* Repeat password field */}
                <label className={styles.label} htmlFor="repeat-password">Confirmez le mot de passe</label>
                <input className={styles.input} type="password" id="repeat-password" name="repeatPassword" placeholder="Confirmez votre mot de passe" aria-describedby="repeatpassword-error" />
                <span id="repeatpassword-error" className={styles.formError} aria-live="polite" aria-atomic="true">{state?.errors?.repeatPassword ? state.errors?.repeatPassword[0] : " "}</span>

                <span id="form-error" className={styles.formError} aria-live="polite" aria-atomic="true">
                    {state?.message}
                </span>

                <CreateButton />
            </form>
        </div>
    );
}

function CreateButton() {
    const { pending } = useFormStatus();

    return (
        <>
            <button className={styles.button} disabled={pending}>
                {pending && <Loader2 className='spinner' />}
                {!pending && "Créer mon mot de passe"}
            </button>
        </>
    );
}
