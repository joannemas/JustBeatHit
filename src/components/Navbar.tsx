"use client"

import NavLink from './NavLink'
import styles from '@/stylesheets/navbar.module.scss'
import Image from 'next/image'
import {supabase} from "@/lib/supabase/client";
import {useEffect, useState} from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    
    useEffect(()=>{
        const fetchUser = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            setUser(user)
        }
        fetchUser()
    }, [])
    

    return (
        <>
        <button
        className={`${styles.burger} ${menuOpen ? styles.open : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Ouvrir le menu"
        >
        <span></span>
        <span></span>
        <span></span>
        </button>
        <div className={`${styles.navbar} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.logoNavbar}>
            <Image
            priority
            src="/assets/img/logo-jbh.png"
            alt="Logo Just Beat Hit"
            width={100}
            height={100}
            className={styles.logoNavbarJBH}
            />
        </div>

        <ul>
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/game/karakaku">Karakaku</NavLink>
            <NavLink href="/game/paroles-en-tete">Paroles en tête</NavLink>
            <NavLink href="/game/blind-test">Blind test</NavLink>
            {user && <NavLink href="/profil">Profil</NavLink>}
            {user && <NavLink href="/options">Options</NavLink>}
            {user && <li className={styles.navItem}>
                <a onClick={async (e) => {
                    e.preventDefault()
                    await supabase.auth.signOut()
                    setUser(null)
                    window.location.href = "/"
                    }}
                    style={{ cursor: 'pointer' }}>
                    Déconnexion
                </a>
            </li>}

        </ul>

        <div className={styles.decorationNavbar}></div>
        </div>
        {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
        </>
    )
}
