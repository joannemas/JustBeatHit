import Link from 'next/link';
import '@/stylesheets/navbar.scss';
import Image from "next/image";

const Navbar = () => {
    return (
        <div className="navbar">
            <ul><li><Link href="/">
                <Image
                    priority
                    src="/assets/img/LogoMini.svg"
                    alt="Logo Mini"
                    className="LogoMini"
                    width={57}
                    height={57}
                />

            </Link></li></ul>
            <ul>
                <li>Jeux</li>
                <li>l&apos;équipe JBH</li>
                <li>Contact</li>
                <li>à propos</li>
            </ul>
            <ul>
                <li>Comment ça va <span>AYMAN</span> ?</li>
                <Image
                    priority
                    src={'/assets/img/profil.png'}
                    alt="Profil"
                    className="Profil"
                    width={44}
                    height={44}
                />

            </ul>
        </div>
    );
}

export default Navbar;
