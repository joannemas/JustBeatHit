import NavLink from './NavLink'
import styles from '@/stylesheets/navbar.module.scss'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className={styles.navbar}>
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
            {user && <NavLink href="/auth/logout">Déconnexion</NavLink>}
        </ul>

        <div className={styles.decorationNavbar}></div>
        </div>
    )
}