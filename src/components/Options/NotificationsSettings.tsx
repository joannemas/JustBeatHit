'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import styles from '@/stylesheets/options.module.scss'
import Image from 'next/image'
import Loader from '@/components/Loader'

export default function NotificationsSettings() {
    const [subscribed, setSubscribed] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<'success' | 'error' | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (user && !userError) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('newsletter_subscribed')
                    .eq('user_id', user.id)
                    .single()

                if (!error && data) {
                    setSubscribed(data.newsletter_subscribed ?? false)
                } else {
                    console.error('Erreur récupération newsletter:', error?.message)
                }
            } else {
                console.error('Erreur récupération utilisateur:', userError?.message)
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    const handleToggle = async () => {
        setSaving(true)
        setMessage(null)

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (!user || userError) {
            console.error('Utilisateur non trouvé pour update newsletter')
            setMessage('error')
            setSaving(false)
            return
        }

        const { error } = await supabase
            .from('profiles')
            .update({ newsletter_subscribed: !subscribed })
            .eq('user_id', user.id)

        if (error) {
            console.error('Erreur mise à jour newsletter:', error.message)
            setMessage('error')
        } else {
            setSubscribed(!subscribed)
            setMessage('success')
        }

        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }


    if (loading) return <Loader />

    return (
        <div className={styles.notificationsSettings}>
            <div className={styles.notificationsCard}>
                <div>
                    <h2>Inscris-toi à notre<br/><span>newsletter</span>
                    <Image
                        src="/assets/img/icon/score-line.svg"
                        alt="decoration"
                        width={40}
                        height={40}
                        className={styles.newsletterIcon}
                    />
                    </h2>
                    <ul>
                        <li>Les dernières actus et mises à jour du jeu</li>
                        <li>Des récompenses exclusives en jeu</li>
                        <li>Des musiques rien que pour toi</li>
                        <li>Et bien d&apos;autres...</li>
                    </ul>
                </div>
                <Image
                    src="/assets/img/music-mail-img.svg"
                    alt="Newsletter"
                    width={300}
                    height={250}
                    className={styles.newsletterPreview}
                />
            </div>

            <label>
                <input
                type="checkbox"
                checked={subscribed}
                onChange={handleToggle}
                disabled={saving}
                />
                Recevoir des notifications de notre newsletter par email
            </label>

            {message === 'success' && <p className={styles.successMessage}>Préférence mise à jour !</p>}
            {message === 'error' && <p className={styles.successMessage}>Erreur lors de la mise à jour, réessaye plus tard.</p>}
        </div>
    )
}
