'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import styles from '@/stylesheets/options.module.scss'
import Image from 'next/image'
import Loader from '@/components/Loader'

export default function PasswordSettings() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState<'success' | 'error' | 'invalid' | 'wrongCurrent' | 'sameAsOldPassword' | null>(null)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Récupération de l'utilisateur connecté
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (user) setUser(user)
            setLoading(false)
        }
        fetchUser()
    }, [])

    const validatePassword = (password: string) => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /\d/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        )
    }

    const isValidPassword = () => {
        return (
            currentPassword.length > 0 &&
            validatePassword(newPassword) &&
            newPassword === confirmPassword
        )
    }

    const handlePasswordUpdate = async () => {
        if (!user) {
            setMessage('error')
            return
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage('invalid')
            return
        }

        if (!validatePassword(newPassword) || newPassword !== confirmPassword) {
            setMessage('invalid')
            return
        }

        setSaving(true)
        setMessage(null)

        // Vérifie le mot de passe actuel
        const res = await fetch('/api/check-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: currentPassword })
        })

        if (res.status === 401) {
            setMessage('wrongCurrent')
            setSaving(false)
            return
        }

        if (!res.ok) {
            setMessage('error')
            setSaving(false)
            return
        }

        // Mise à jour du mot de passe
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            console.error('Erreur update password:', error.message)
            if (error.message.includes("New password should be different")) {
                setMessage('sameAsOldPassword')
            } else {
                setMessage('error')
            }
        } else {
            setMessage('success')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        }

        setSaving(false)
        setTimeout(() => setMessage(null), 7000)
    }

    if (loading) return <Loader />


    return (
        <div className={styles.generalSettings + ' ' + styles.passwordSettings}>
            <div className={styles.formGroup}>
                <label>Mot de passe actuel</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    disabled={saving}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Nouveau mot de passe</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={saving}
                />
                <ul className={styles.passwordHints}>
                    <p>Le mot de passe doit contenir :</p>
                    <li className={newPassword.length >= 8 ? styles.valid : styles.invalid}>
                        Au moins 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? styles.valid : styles.invalid}>
                        Une majuscule
                    </li>
                    <li className={/\d/.test(newPassword) ? styles.valid : styles.invalid}>
                        Un chiffre
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? styles.valid : styles.invalid}>
                        Un caractère spécial
                    </li>
                </ul>
            </div>

            <div className={styles.formGroup}>
                <label>Confirmer le mot de passe</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={saving}
                />
            </div>

            <button
                onClick={handlePasswordUpdate}
                disabled={saving || !isValidPassword()}
                className={styles.saveButton}
            >
                <Image
                    src="/assets/img/icon/check-icon.svg"
                    alt="Sauvegarder"
                    width={18}
                    height={18}
                    style={{ marginRight: 8, verticalAlign: 'middle' }}
                />
                {saving ? 'Changement...' : 'Mettre à jour le mot de passe'}
            </button>

            {message === 'success' && <p className={styles.successMessage}>Mot de passe mis à jour avec succès.</p>}
            {message === 'error' && <p className={styles.errorMessage}>Une erreur est survenue. Réessaie plus tard.</p>}
            {message === 'invalid' && <p className={styles.errorMessage}>Vérifie les champs et les critères de sécurité.</p>}
            {message === 'wrongCurrent' && <p className={styles.errorMessage}>Le mot de passe actuel est incorrect.</p>}
            {message === 'sameAsOldPassword' && <p className={styles.errorMessage}>Le nouveau mot de passe doit être différent de l&apos;ancien.</p>}
        </div>
    )
}
