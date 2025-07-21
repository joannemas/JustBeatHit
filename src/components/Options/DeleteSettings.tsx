'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import styles from '@/stylesheets/options.module.scss'
import Link from 'next/link'
import Image from 'next/image'

export default function DeleteAccountSettings() {
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)


    const handleDelete = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (userError || sessionError || !sessionData?.session) {
            setError("Vous devez être connecté pour supprimer votre compte.")
            return
        }

        const token = sessionData.session.access_token

        const res = await fetch('/api/delete-user', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (res.ok) {
            await supabase.auth.signOut()
            window.location.href = 'https://justbeathit.com'
        } else {
            try {
                const err = await res.json()
                setError(err.error || "Erreur inconnue lors de la suppression.")
            } catch {
                setError("Erreur serveur : réponse invalide.")
            }
        }
    }


    return (
        <div className={styles.deleteWrapper}>
            <h2>Dommage de te voir partir :(</h2>
            <ul>
                <li>Si tu veux juste recevoir moins d&apos;e-mails, <Link href="/options/notifications" className={styles.gradientUnderline}>tu peux gérer tes notifications ici !</Link></li>
                <li>Et si tu veux changer de pseudo, <Link href="/options">c&apos;est par là !</Link></li>
            </ul>

            <p className={styles.deleteWarning}>
                <Image
                    src="/assets/img/icon/warning-triangle-outline.svg"
                    alt="Avertissement"
                    width={24}
                    height={24}
                    style={{ marginRight: '5px' }}
                />
                Supprimer ton compte, c&apos;est définitif.<br/>Une fois fait, impossible de revenir en arrière.
            </p>

            {!confirming ? (
                <button
                    className={styles.dangerButton}
                    onClick={() => setConfirming(true)}
                >
                    <Image
                        src="/assets/img/icon/delete-circled-outline.svg"
                        alt="Supprimer"
                        width={24}
                        height={24}
                        style={{ verticalAlign: 'bottom', margin: '-2px 5px' }}
                        
                    />
                    Supprimer mon compte
                </button>
            ) : (
                <div className={styles.confirmationBox}>
                    <p>Es-tu sûr ? Cette action est permanente.</p>
                    <div className={styles.buttonGroup}>
                        <button className={styles.cancelButton} onClick={() => setConfirming(false)}>
                            Annuler
                        </button>
                        <button className={styles.dangerButton} onClick={handleDelete}>
                            Confirmer la suppression
                        </button>
                    </div>
                </div>
            )}

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    )
}