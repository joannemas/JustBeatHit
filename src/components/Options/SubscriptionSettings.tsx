'use client'

import styles from '@/stylesheets/options.module.scss'
import Image from 'next/image'
import useClaims from "@/lib/hooks/useClaims";

export default function SubscriptionOptions() {
    const {userClaims: {plan}} = useClaims()

    return (
        <div className={styles.subscriptionWrapper}>
            <div className={`${styles.card} ${styles.free}`}>
                <div>
                    <h2>Gratuit</h2>
                    <p className={styles.description}>Jouez aussi longtemps que vous le souhaitez.</p>
                </div>
                
                <p className={styles.price}><span>0€</span>/mois</p>
                <ul className={styles.features}>
                    <p>Inclus</p>
                    <li>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Image
                                src="/assets/img/icon/check-icon.svg"
                                alt="Sauvegarder"
                                width={18}
                                height={18}
                                style={{ marginRight: 8, verticalAlign: 'middle' }}
                            />
                            Musique libre de droits
                        </span>
                    </li>
                    <li>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Image
                                src="/assets/img/icon/check-icon.svg"
                                alt="Sauvegarder"
                                width={18}
                                height={18}
                                style={{ marginRight: 8, verticalAlign: 'middle' }}
                            />
                            3 jeux
                        </span>
                    </li>
                    <li>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Image
                                src="/assets/img/icon/check-icon.svg"
                                alt="Sauvegarder"
                                width={18}
                                height={18}
                                style={{ marginRight: 8, verticalAlign: 'middle' }}
                            />
                            1 défi journalier
                        </span>
                    </li>
                    <li>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Image
                                src="/assets/img/icon/check-icon.svg"
                                alt="Sauvegarder"
                                width={18}
                                height={18}
                                style={{ marginRight: 8, verticalAlign: 'middle' }}
                            />
                            Offre gratuit
                        </span>
                    </li>
                </ul>

            </div>

            <div className={`${styles.card} ${styles.premium}`}>
                <div>
                    <h2>Premium</h2>
                    <p className={styles.description}>Jouez aussi longtemps que vous le souhaitez.</p>
                </div>
                
                <p className={styles.price}><span>6.99€</span>/mois</p>
                <ul className={styles.features}>
                    <p>Inclus</p>
                    <li>
                        <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.3421 13.5088C5.6594 13.1915 6.17385 13.1915 6.49115 13.5088L10.25 17.2677L20.5088 7.00885C20.8261 6.69155 21.3405 6.69155 21.6578 7.00885C21.9751 7.32615 21.9751 7.8406 21.6578 8.1579L10.8245 18.9912C10.5072 19.3085 9.99274 19.3085 9.67544 18.9912L5.3421 14.6579C5.0248 14.3406 5.0248 13.8262 5.3421 13.5088Z" fill="#F1203C"/>
                        </svg>
                        Toutes les musiques
                    </li>
                    <li>
                        <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.3421 13.5088C5.6594 13.1915 6.17385 13.1915 6.49115 13.5088L10.25 17.2677L20.5088 7.00885C20.8261 6.69155 21.3405 6.69155 21.6578 7.00885C21.9751 7.32615 21.9751 7.8406 21.6578 8.1579L10.8245 18.9912C10.5072 19.3085 9.99274 19.3085 9.67544 18.9912L5.3421 14.6579C5.0248 14.3406 5.0248 13.8262 5.3421 13.5088Z" fill="#F1203C"/>
                        </svg>
                        Tous les modes et défis
                    </li>
                    <li>
                        <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.3421 13.5088C5.6594 13.1915 6.17385 13.1915 6.49115 13.5088L10.25 17.2677L20.5088 7.00885C20.8261 6.69155 21.3405 6.69155 21.6578 7.00885C21.9751 7.32615 21.9751 7.8406 21.6578 8.1579L10.8245 18.9912C10.5072 19.3085 9.99274 19.3085 9.67544 18.9912L5.3421 14.6579C5.0248 14.3406 5.0248 13.8262 5.3421 13.5088Z" fill="#F1203C"/>
                        </svg>
                        Tous les défis journalier
                    </li>
                    <li>
                        <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.3421 13.5088C5.6594 13.1915 6.17385 13.1915 6.49115 13.5088L10.25 17.2677L20.5088 7.00885C20.8261 6.69155 21.3405 6.69155 21.6578 7.00885C21.9751 7.32615 21.9751 7.8406 21.6578 8.1579L10.8245 18.9912C10.5072 19.3085 9.99274 19.3085 9.67544 18.9912L5.3421 14.6579C5.0248 14.3406 5.0248 13.8262 5.3421 13.5088Z" fill="#F1203C"/>
                        </svg>
                        Ajout de fichiers audio personnalisés
                    </li>
                </ul>

            </div>
        </div>
    )
}
