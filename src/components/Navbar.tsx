import NavLink from './NavLink'
import styles from '@/stylesheets/navbar.module.scss'
import Image from 'next/image'

export default function Navbar() {
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
            <NavLink href="/profil">Profil</NavLink>
            <NavLink href="/options">Options</NavLink>
            <NavLink href="/auth/logout">Déconnexion</NavLink>
        </ul>

        <div className={styles.decorationNavbar}></div>
        </div>
    )
}