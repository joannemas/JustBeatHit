'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import styles from '@/stylesheets/options.module.scss'
import Image from 'next/image'

export default function GeneralSettings() {
    const [user, setUser] = useState<any>(null)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [initialUsername, setInitialUsername] = useState('')
    const [initialEmail, setInitialEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<'success' | 'error' | 'emailConfirmationNeeded' | null>(null)

    useEffect(() => {
        const fetchUserAndProfile = async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
            console.error('Erreur getUser:', error.message)
            setLoading(false)
            return
        }
        if (user) {
            setUser(user)
            setEmail(user.email || '')
            setInitialEmail(user.email || '')

            const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.id)
            .single()

            if (profileError) {
            console.error('Erreur fetch profile:', profileError.message)
            setUsername('')
            setInitialUsername('')
            } else {
            setUsername(profileData?.username || '')
            setInitialUsername(profileData?.username || '')
            }
        }
        setLoading(false)
        }

        fetchUserAndProfile()
    }, [])

    const handleSave = async () => {
        if (!username || !email) {
            setMessage('error');
            return;
        }

        setSaving(true);
        setMessage(null);

        let emailChanged = email !== initialEmail;
        let emailUpdated = false;

        if (emailChanged) {
            const { error: emailError } = await supabase.auth.updateUser({ email });

            if (emailError) {
                console.error('Erreur update email:', emailError.message);
                setMessage('error');
                setSaving(false);
                return;
            } else {
                emailUpdated = true;
                setInitialEmail(email);
            }
        }

        if (username !== initialUsername) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username })
                .eq('user_id', user.id);

            if (profileError) {
                console.error('Erreur update profil:', profileError.message);
                setMessage('error');
                setSaving(false);
                return;
            } else {
                setInitialUsername(username);
            }
        }

        if (emailUpdated) {
            setMessage('emailConfirmationNeeded');
        } else if (username !== initialUsername) {
            setMessage('success');
        }

        setSaving(false);

        setTimeout(() => setMessage(null), 5000);
    }

    if (loading) return <p>Chargement...</p>

    const hasChanges = username !== initialUsername || email !== initialEmail

    return (
        <div className={styles.generalSettings}>
        <div className={styles.avatar}>
            <img
            src={user?.user_metadata?.avatar_url || '/assets/img/default-avatar.png'}
            alt="Avatar"
            />
        </div>

        <div className={styles.formGroup}>
            <label>Nom d&apos;utilisateur</label>
            <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={saving}
            />
        </div>

        <div className={styles.formGroup}>
            <label>Email</label>
            <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={saving}
            />
        </div>

        <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={styles.saveButton}
        >
            <Image
                src="/assets/img/icon/check-icon.svg"
                alt="Sauvegarder"
                width={18}
                height={18}
                style={{ marginRight: 8, verticalAlign: 'middle' }}
            />
            {saving ? 'Enregistrement...' : 'Sauvegarder les changements'}
        </button>

        {message === 'success' && (
            <p className={styles.successMessage}>Modifications enregistrées avec succès !</p>
        )}
        {message === 'emailConfirmationNeeded' && (
            <p className={styles.infoMessage}>
                Un email de confirmation a été envoyé à ton adresse email actuelle, clique sur le lien pour confirmer le changement !</p>
        )}
        {message === 'error' && (
            <p className={styles.errorMessage}>Une erreur est survenue. Vérifie les champs ou réessaie plus tard.</p>
        )}
        </div>
    )
}
