'use client'
import { useState } from "react"
import Navbar from "@/components/Navbar"
import styles from "@/stylesheets/options.module.scss"
import Image from "next/image"

const sections = ['général', 'mot de passe', 'abonnement', 'notifications', 'supprimer le compte']

export default function OptionsPage() {
    const [activeSection, setActiveSection] = useState('général')

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
                    {sections.map(section => (
                        <button
                            key={section}
                            className={activeSection === section ? styles.activeTab : ''}
                            onClick={() => setActiveSection(section)}
                        >
                            {section}
                        </button>
                    ))}
                </nav>

                <div className={styles.sectionContent}>
                    {activeSection === 'général'}
                    {activeSection === 'mot de passe'}
                    {activeSection === 'abonnement'}
                    {activeSection === 'notifications'}
                    {activeSection === 'supprimer le compte'}
                </div>
            </section>
        </div>
    )
}
