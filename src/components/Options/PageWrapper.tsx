'use client'

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import styles from "@/stylesheets/options.module.scss"
import Image from "next/image"

const sections = [
    { label: 'général', path: '/options' },
    { label: 'mot de passe', path: '/options/password' },
    { label: 'abonnement', path: '/options/subscription' },
    { label: 'notifications', path: '/options/notifications' },
    { label: 'supprimer le compte', path: '/options/delete' }
]

export default function PageWrapper({ section, children }: { section: string, children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [pathname])

    return (
        <div>
            <Navbar />
            <section className={styles.optionsContainer}>

                <div className={styles.musicDecoration}>
                <Image
                    src="/assets/img/MusicBar-gradient.svg"
                    alt="Music"
                    width={100}
                    height={100}
                    className={styles.musicDecoration}
                />
                </div>

                <nav className={styles.navTabs}>
                {sections.map(s => (
                    <button
                    key={s.label}
                    className={section === s.label ? styles.activeTab : ''}
                    onClick={() => router.push(s.path)}
                    >
                    {s.label}
                    </button>
                ))}
                </nav>

                <div className={styles.sectionContent}>
                {children}
                </div>
            </section>
        </div>
    )
}
